Cypress.Commands.add('apiTransactionAuthHeaders', (token) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
});

Cypress.Commands.add('apiTransactionCreate', ({ token, walletId, value, type, name, description, transactionsPassword } = {}) => {
  return cy.apiTransactionAuthHeaders(token).then((headers) =>
    cy.request({
      method: 'POST',
      url: '/transaction',
      failOnStatusCode: false,
      headers,
      body: { walletId, value, type, name, description, transactionsPassword },
    }),
  );
});

Cypress.Commands.add('apiTransactionGetAll', (walletId, token) => {
  return cy.apiTransactionAuthHeaders(token).then((headers) =>
    cy.request({
      method: 'GET',
      url: `/transaction/all/${walletId}`,
      failOnStatusCode: false,
      headers,
    }),
  );
});

Cypress.Commands.add('apiTransactionGetRecent', (walletId, token) => {
  return cy.apiTransactionAuthHeaders(token).then((headers) =>
    cy.request({
      method: 'GET',
      url: `/transaction/${walletId}`,
      failOnStatusCode: false,
      headers,
    }),
  );
});

Cypress.Commands.add('apiTransactionGetFiltered', (walletId, days, token) => {
  return cy.apiTransactionAuthHeaders(token).then((headers) =>
    cy.request({
      method: 'GET',
      url: `/transaction/filtro/${walletId}/${days}`,
      failOnStatusCode: false,
      headers,
    }),
  );
});

Cypress.Commands.add('apiTransactionGetCryptKey', (token) => {
  return cy.apiTransactionAuthHeaders(token).then((headers) =>
    cy.request({
      method: 'GET',
      url: '/transaction/crypt/key',
      failOnStatusCode: false,
      headers,
    }),
  );
});

Cypress.Commands.add('apiTransactionEncryptPassword', (publicKey, password) => {
  return cy.request({
    method: 'POST',
    url: '/transaction/encrypt_password',
    failOnStatusCode: false,
    body: { publicKey, password },
  });
});

Cypress.Commands.add('apiTransactionGetBalance', (walletId, token) => {
  return cy
    .apiTransactionAuthHeaders(token)
    .then((headers) =>
      cy.request({
        method: 'GET',
        url: `/wallet/${walletId}`,
        failOnStatusCode: false,
        headers,
      }),
    )
    .then((response) => response.body.data.balanceCurrentAccount);
});
