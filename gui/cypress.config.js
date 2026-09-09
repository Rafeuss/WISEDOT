const { defineConfig } = require('cypress');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const {
  seedTestUser,
  cleanTestUser,
  cleanTestUsersByEmailPrefix,
  seedMarketShares,
  cleanMarketShares,
  getRecoverTokenByEmail,
  pool,
} = require('../db');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_URL || 'https://localhost:3001',
    chromeWebSecurity: false,
    defaultCommandTimeout: 8000,
    retries: { runMode: 2, openMode: 0 },
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });

      on('task', {
        async 'db:seedTestUser'(overrides) {
          const user = await seedTestUser(overrides || {});
          return user;
        },
        async 'db:cleanTestUser'(email) {
          await cleanTestUser(email);
          return null;
        },
        async 'db:cleanTestUsersByEmailPrefix'(prefix) {
          return await cleanTestUsersByEmailPrefix(prefix);
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
        async 'db:getRecoverTokenByEmail'(email) {
          return await getRecoverTokenByEmail(email);
        },
        async 'db:waitForRecoverToken'({ email, attempts = 5, intervalMs = 200 }) {
          for (let attempt = 0; attempt < attempts; attempt += 1) {
            const token = await getRecoverTokenByEmail(email);
            if (token) return token;
            if (attempt < attempts - 1) {
              await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
          }
          return null;
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
