const pool = require('./pool');
const { TEST_USER, seedTestUser, cleanTestUser } = require('./testUser');
const { MARKET_SHARES, seedMarketShares, cleanMarketShares } = require('./marketShares');

async function seedAll() {
  const user = await seedTestUser();
  const marketSharesCount = await seedMarketShares();
  return { user, marketSharesCount };
}

async function cleanAll() {
  await cleanTestUser();
  await cleanMarketShares();
}

async function getCurrentAccountByWalletId(walletId) {
  const { rows } = await pool.query(
    `SELECT cta_pk_id AS id, cta_db_balance AS balance FROM tb_current_account WHERE wlt_fk_id = $1`,
    [walletId],
  );
  return rows[0];
}

async function getRecoverTokenByEmail(email) {
  const { rows } = await pool.query(
    `SELECT usr_st_recover_token AS token FROM tb_user WHERE usr_st_email = $1`,
    [email],
  );
  return rows[0]?.token;
}

module.exports = {
  pool,
  TEST_USER,
  MARKET_SHARES,
  seedTestUser,
  cleanTestUser,
  seedMarketShares,
  cleanMarketShares,
  seedAll,
  cleanAll,
  getCurrentAccountByWalletId,
  getRecoverTokenByEmail,
};
