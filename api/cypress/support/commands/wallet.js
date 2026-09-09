Cypress.Commands.add('apiWalletGetByWalletId', (walletId, token) => {
  return cy.request({
    method: 'GET',
    url: `/wallet/${walletId}`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});
