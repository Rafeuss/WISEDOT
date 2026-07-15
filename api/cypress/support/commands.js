Cypress.Commands.add('seedTestUser', (overrides) => cy.task('db:seedTestUser', overrides || null));
Cypress.Commands.add('cleanTestUser', (email) => cy.task('db:cleanTestUser', email || null));
Cypress.Commands.add('seedMarketShares', () => cy.task('db:seedMarketShares'));
Cypress.Commands.add('cleanMarketShares', () => cy.task('db:cleanMarketShares'));
Cypress.Commands.add('seedAll', () => cy.task('db:seedAll'));

Cypress.Commands.add('apiLogin', (email, password) => {
  return cy
    .request('POST', '/auth/login', { email, password })
    .then((response) => {
      const token = response.body.data.token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { token, walletId: payload.idWallet, status: response.status };
    });
});

Cypress.Commands.add('apiLoginAsSeedUser', (overrides) => {
  return cy.seedTestUser(overrides).then((user) => {
    return cy.apiLogin(user.email, user.password).then(({ token, walletId }) => {
      return cy.wrap({ user, token, walletId });
    });
  });
});

function buildObfuscatedPin(pin) {
  return pin
    .split('')
    .map((digit) => `${digit}${(Number(digit) + 5) % 10}`)
    .join('');
}

Cypress.Commands.add('encryptTransactionPin', (token, pin) => {
  return cy
    .request({
      method: 'GET',
      url: '/transaction/crypt/key',
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      const publicKey = response.body.data.cryptKey;
      return cy.task('crypto:encryptWithPublicKey', { publicKey, text: buildObfuscatedPin(pin) });
    });
});

Cypress.Commands.add('authHeader', (token) => ({ Authorization: `Bearer ${token}` }));

Cypress.Commands.add('currentAccountByWalletId', (walletId) =>
  cy.task('db:getCurrentAccountByWalletId', walletId),
);

Cypress.Commands.add('recoverTokenByEmail', (email) =>
  cy.task('db:getRecoverTokenByEmail', email),
);
