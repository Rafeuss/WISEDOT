const { defineConfig } = require('cypress');
const path = require('path');
const { publicEncrypt } = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const {
  seedTestUser,
  cleanTestUser,
  seedMarketShares,
  cleanMarketShares,
  getCurrentAccountByWalletId,
  getRecoverTokenByEmail,
  pool,
} = require('../db');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 8000,
    video: false,
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      on('task', {
        async 'db:seedTestUser'(overrides) {
          return await seedTestUser(overrides || {});
        },
        async 'db:cleanTestUser'(email) {
          await cleanTestUser(email);
          return null;
        },
        async 'db:seedMarketShares'() {
          return await seedMarketShares();
        },
        async 'db:cleanMarketShares'() {
          await cleanMarketShares();
          return null;
        },
        async 'db:seedAll'() {
          const user = await seedTestUser();
          const marketSharesCount = await seedMarketShares();
          return { user, marketSharesCount };
        },
        async 'db:getCurrentAccountByWalletId'(walletId) {
          return await getCurrentAccountByWalletId(walletId);
        },
        async 'db:getRecoverTokenByEmail'(email) {
          return await getRecoverTokenByEmail(email);
        },
        'crypto:encryptWithPublicKey'({ publicKey, text }) {
          return publicEncrypt(publicKey, Buffer.from(text, 'utf8')).toString('base64');
        },
      });

      on('after:run', async () => {
        await pool.end();
      });

      return config;
    },
  },
});
