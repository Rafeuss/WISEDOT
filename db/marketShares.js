const pool = require('./pool');

const MARKET_SHARES = [
  { name: 'ARX Denial FIC FIRF CP', cnpj: '83167388000147', minDeposit: 100.0, yearYield: 11.61, risk: 'ALTO', dayYield: 1.5, daysToRetrieve: 1, benchmark: 'CDI', marketValue: 1000000.0, shareKeeper: 'Banco XP', manager: 'ARX Investimentos', marketValueYearAvg: 950000.0, redemption: 'D+0' },
  { name: 'Sulamérica Inflatie FI RF LP', cnpj: '93765839000100', minDeposit: 5.0, yearYield: -0.8, risk: 'MUITO_ALTO', dayYield: 2.5, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 850000.0, shareKeeper: 'Banco BTG', manager: 'Sulamérica Investimentos', marketValueYearAvg: 820000.0, redemption: 'D+0' },
  { name: 'Absolute Alpha Global FIC FIM', cnpj: '60900535000140', minDeposit: 1.0, yearYield: 9.24, risk: 'MUITO_BAIXO', dayYield: 0.0, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 1200000.0, shareKeeper: 'Banco XP', manager: 'Absolute Investimentos', marketValueYearAvg: 1100000.0, redemption: 'D+0' },
  { name: 'Apex Equity Hedge FIM', cnpj: '97330853000123', minDeposit: 10.0, yearYield: 5.78, risk: 'MUITO_ALTO', dayYield: 3.3, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 740000.0, shareKeeper: 'Banco BTG', manager: 'ARX Investimentos', marketValueYearAvg: 700000.0, redemption: 'D+0' },
  { name: 'Ibiuna Long Blased FIC FIM', cnpj: '86988726000108', minDeposit: 0.01, yearYield: -5.08, risk: 'BAIXO', dayYield: 0.9, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 630000.0, shareKeeper: 'Banco XP', manager: 'Sulamérica Investimentos', marketValueYearAvg: 610000.0, redemption: 'D+0' },
  { name: 'ARX Everest FIC Renda Fixa Crédito Privado', cnpj: '86695496000180', minDeposit: 33.0, yearYield: 9.8, risk: 'MUITO_ALTO', dayYield: 3.5, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 980000.0, shareKeeper: 'Banco XP', manager: 'Absolute Investimentos', marketValueYearAvg: 920000.0, redemption: 'D+0' },
  { name: 'Icatu Vanguarda Credit Plus FIC Renda Fixa Crédito Privado', cnpj: '76954780000170', minDeposit: 0.0, yearYield: -0.5, risk: 'MODERADO', dayYield: 1.4, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 560000.0, shareKeeper: 'Banco BTG', manager: 'ARX Investimentos', marketValueYearAvg: 540000.0, redemption: 'D+0' },
  { name: 'Angá High Yield FI Renda Fixa Crédito Privado', cnpj: '98714780000136', minDeposit: 25.0, yearYield: 1.26, risk: 'ALTO', dayYield: 2.6, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 890000.0, shareKeeper: 'Banco XP', manager: 'Sulamérica Investimentos', marketValueYearAvg: 850000.0, redemption: 'D+0' },
  { name: 'Guepardo Institucional FIC Ações', cnpj: '09777729000143', minDeposit: 5.0, yearYield: 3.28, risk: 'MUITO_BAIXO', dayYield: 3.4, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 430000.0, shareKeeper: 'Banco BTG', manager: 'Absolute Investimentos', marketValueYearAvg: 400000.0, redemption: 'D+0' },
  { name: 'Sulamérica Selection FI Ações', cnpj: '30568721000163', minDeposit: 15.0, yearYield: -15.08, risk: 'ALTO', dayYield: 1.9, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 370000.0, shareKeeper: 'Banco XP', manager: 'ARX Investimentos', marketValueYearAvg: 390000.0, redemption: 'D+0' },
  { name: 'Tarpon GT FIC Ações', cnpj: '04018834000185', minDeposit: 17.5, yearYield: 16.62, risk: 'MUITO_ALTO', dayYield: 3.5, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 150000.0, shareKeeper: 'Banco BTG', manager: 'Sulamérica Investimentos', marketValueYearAvg: 1080000.0, redemption: 'D+0' },
  { name: 'Dahlia 70 Advisory XP Seguros Previdência FI Multimercado', cnpj: '13643906000176', minDeposit: 12.25, yearYield: -2.83, risk: 'MUITO_ALTO', dayYield: 5.5, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 760000.0, shareKeeper: 'Banco XP', manager: 'Absolute Investimentos', marketValueYearAvg: 740000.0, redemption: 'D+0' },
  { name: 'Trígono 70 Previdência FIC Multimercado', cnpj: '10205437000115', minDeposit: 33.33, yearYield: 19.21, risk: 'MUITO_BAIXO', dayYield: 0.0, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 1320000.0, shareKeeper: 'Banco BTG', manager: 'ARX Investimentos', marketValueYearAvg: 1250000.0, redemption: 'D+0' },
  { name: 'Bogari Value Icatu Prev FI Multimercado', cnpj: '82045000000172', minDeposit: 11.11, yearYield: 2.43, risk: 'ALTO', dayYield: 1.6, daysToRetrieve: 0, benchmark: 'CDI', marketValue: 680000.0, shareKeeper: 'Banco XP', manager: 'Sulamérica Investimentos', marketValueYearAvg: 650000.0, redemption: 'D+0' },
];

async function cleanMarketShares() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM tb_investments_market_shares`);
    await client.query(`DELETE FROM tb_market_shares WHERE mts_st_cnpj = ANY($1)`, [
      MARKET_SHARES.map((m) => m.cnpj),
    ]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function seedMarketShares() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM tb_investments_market_shares`);
    await client.query(`DELETE FROM tb_market_shares WHERE mts_st_cnpj = ANY($1)`, [
      MARKET_SHARES.map((m) => m.cnpj),
    ]);

    for (const m of MARKET_SHARES) {
      await client.query(
        `INSERT INTO tb_market_shares
          (mts_st_name, mts_st_cnpj, mts_db_min_deposit, mts_db_year_yield, mts_st_risk,
           mts_it_day_yield, mts_it_days_to_retrieve, mts_st_benchmark, mts_db_market_value,
           mts_dt_created_at, mts_st_share_keeper, mts_st_manager, mts_db_market_value_year_avg, mts_st_redemption)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11, $12, $13)`,
        [
          m.name, m.cnpj, m.minDeposit, m.yearYield, m.risk,
          m.dayYield, m.daysToRetrieve, m.benchmark, m.marketValue,
          m.shareKeeper, m.manager, m.marketValueYearAvg, m.redemption,
        ],
      );
    }

    await client.query('COMMIT');
    return MARKET_SHARES.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { MARKET_SHARES, seedMarketShares, cleanMarketShares };
