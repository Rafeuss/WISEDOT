Cypress.Commands.add('apiPaidSlipsPayRequest', ({ token, walletId, barcode, name, transactionPassword, value }) => {
  return cy.request({
    method: 'POST',
    url: '/paid-slips',
    failOnStatusCode: false,
    headers: { Authorization: `Bearer ${token}` },
    body: {
      barcode,
      name,
      transactionPassword,
      value,
      walletId,
    },
  });
});

Cypress.Commands.add('apiPaidSlipsGetByCode', (code, token) => {
  return cy.request({
    method: 'GET',
    url: `/paid-slips/${code}`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiPaidSlipsGetPending', (token) => {
  return cy.request({
    method: 'GET',
    url: '/paid-slips/pendent',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiPaidSlipsPay', (session, barcode, value = 150.75) => {
  return cy.encryptTransactionPin(session.token, session.user.pin).then((encryptedPin) => {
    return cy.apiPaidSlipsPayRequest({
      token: session.token,
      walletId: session.walletId,
      barcode,
      name: 'Joao Silva',
      transactionPassword: encryptedPin,
      value,
    });
  });
});
