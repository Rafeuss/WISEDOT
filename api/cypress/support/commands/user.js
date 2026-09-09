Cypress.Commands.add('apiUserCreate', (payload) => {
  return cy.request({
    method: 'POST',
    url: '/user',
    failOnStatusCode: false,
    body: payload,
  });
});

Cypress.Commands.add('apiUserGetMe', (token) => {
  return cy.request({
    method: 'GET',
    url: '/user',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiUserMarkFirstAccess', (userId, token) => {
  return cy.request({
    method: 'PATCH',
    url: `/user/${userId}/first-access`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});
