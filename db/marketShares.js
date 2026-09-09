const pool = require('./pool');

const MARKET_SHARES = require('./data/market-shares.json');

async function cleanMarketShares() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM tb_investments_market_shares
       WHERE mts_fk_id IN (SELECT mts_pk_id FROM tb_market_shares WHERE mts_st_cnpj = ANY($1))`,
      [MARKET_SHARES.map((m) => m.cnpj)],
    );
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

    await client.query(
      `DELETE FROM tb_investments_market_shares
       WHERE mts_fk_id IN (SELECT mts_pk_id FROM tb_market_shares WHERE mts_st_cnpj = ANY($1))`,
      [MARKET_SHARES.map((m) => m.cnpj)],
    );
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
