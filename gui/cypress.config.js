const { defineConfig } = require('cypress');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { seedTestUser, cleanTestUser, seedMarketShares, cleanMarketShares, pool } = require('../db');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_URL || 'https://localhost:3001',
    apiUrl: 'http://localhost:3000',
    chromeWebSecurity: false,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      on('task', {
        async 'db:seedTestUser'() {
          const user = await seedTestUser();
          return user;
        },
        async 'db:cleanTestUser'() {
          await cleanTestUser();
          return null;
        },
        async 'db:seedMarketShares'() {
          const count = await seedMarketShares();
          return count;
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
        log(message) {
          console.log(message);
          return null;
        },
      });

      on('after:run', async () => {
        await pool.end();
      });

      config.env.API_URL = 'http://localhost:3000';
      return config;
    },
  },
});
