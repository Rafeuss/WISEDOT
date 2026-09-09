Cypress.Commands.add('apiInvestmentInvest', ({ token, walletId, marketShareId, initialValue, transactionsPassword }) => {
  return cy.request({
    method: 'POST',
    url: '/investment',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: {
      initialValue,
      walletId,
      marketShareId,
      transactionsPassword,
    },
  });
});

Cypress.Commands.add('apiInvestmentWithdraw', ({ token, walletId, marketShareId, amount, transactionsPassword }) => {
  return cy.request({
    method: 'POST',
    url: '/investment/withdraw',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: {
      walletId,
      marketShareId,
      amount,
      transactionsPassword,
    },
  });
});

Cypress.Commands.add('apiInvestmentGetSummary', (walletId, token) => {
  return cy.request({
    method: 'GET',
    url: `/investment/summary/${walletId}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiInvestmentGetWalletInvestments', (walletId, token) => {
  return cy.request({
    method: 'GET',
    url: `/investment/wallet-investments/${walletId}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});
