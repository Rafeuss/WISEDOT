const bcrypt = require('bcryptjs');
const pool = require('./pool');

const SALT_ROUNDS = Number(process.env.SALTS) || 12;

const TEST_USER = {
  name: 'QA Seed Usuario',
  email: 'qa.seed.user@academywallet.test',
  password: 'Seed@Teste123',
  cpf: '11144477735',
  rg: '998877665',
  pin: '123456',
  initialBalance: 10000.0,
};

async function deleteUserCascade(client, email) {
  const { rows } = await client.query(
    `SELECT usr_pk_id FROM tb_user WHERE usr_st_email = $1`,
    [email],
  );
  if (rows.length === 0) return;

  const userId = rows[0].usr_pk_id;

  const walletRes = await client.query(
    `SELECT wlt_pk_id FROM tb_wallet WHERE usr_fk_id = $1`,
    [userId],
  );

  if (walletRes.rows.length > 0) {
    const walletId = walletRes.rows[0].wlt_pk_id;

    await client.query(
      `DELETE FROM tb_investments_market_shares
       WHERE ivs_fk_id IN (SELECT ivs_pk_id FROM tb_investments WHERE wlt_fk_id = $1)`,
      [walletId],
    );
    await client.query(`DELETE FROM tb_investments WHERE wlt_fk_id = $1`, [walletId]);
    await client.query(`DELETE FROM tb_transactions WHERE wlt_fk_id = $1`, [walletId]);
    await client.query(`DELETE FROM tb_current_account WHERE wlt_fk_id = $1`, [walletId]);
    await client.query(`DELETE FROM tb_wallet WHERE wlt_pk_id = $1`, [walletId]);
  }

  await client.query(`DELETE FROM tb_notifications WHERE usr_fk_id = $1`, [userId]);
  await client.query(`DELETE FROM tb_user WHERE usr_pk_id = $1`, [userId]);
}

async function generateAccountNumber(client) {
  let account;
  let exists = true;
  while (exists) {
    account = Math.floor(100000000 + Math.random() * 900000000);
    const { rows } = await client.query(
      `SELECT 1 FROM tb_wallet WHERE wlt_it_account = $1`,
      [account],
    );
    exists = rows.length > 0;
  }
  return account;
}

async function seedTestUser(overrides = {}) {
  const user = { ...TEST_USER, ...overrides };
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await deleteUserCascade(client, user.email);

    const hashedLoginPassword = bcrypt.hashSync(user.password, SALT_ROUNDS);
    const hashedPin = bcrypt.hashSync(user.pin, SALT_ROUNDS);

    const userInsert = await client.query(
      `INSERT INTO tb_user (usr_st_name, usr_st_email, usr_st_login_password, usr_st_cpf, usr_st_rg, usr_bl_first_access)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING usr_pk_id`,
      [user.name, user.email, hashedLoginPassword, user.cpf, user.rg],
    );
    const userId = userInsert.rows[0].usr_pk_id;

    const account = await generateAccountNumber(client);

    const walletInsert = await client.query(
      `INSERT INTO tb_wallet (wlt_it_agency, wlt_it_account, wlt_it_organization, wlt_st_transactions_password, usr_fk_id)
       VALUES (1, $1, 380, $2, $3)
       RETURNING wlt_pk_id`,
      [account, hashedPin, userId],
    );
    const walletId = walletInsert.rows[0].wlt_pk_id;

    await client.query(
      `INSERT INTO tb_current_account (cta_db_balance, wlt_fk_id)
       VALUES ($1, $2)`,
      [user.initialBalance, walletId],
    );

    await client.query('COMMIT');

    return {
      userId,
      walletId,
      email: user.email,
      password: user.password,
      pin: user.pin,
      cpf: user.cpf,
      rg: user.rg,
      agency: 1,
      account,
      organization: 380,
      balance: user.initialBalance,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cleanTestUser(email = TEST_USER.email) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await deleteUserCascade(client, email);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { TEST_USER, seedTestUser, cleanTestUser };
