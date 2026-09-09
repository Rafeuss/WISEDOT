Cypress.Commands.add('apiCurrentAccountCreate', (body, token) => {
  return cy.request({
    method: 'POST',
    url: '/current-account',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });
});

Cypress.Commands.add('apiCurrentAccountList', (token) => {
  return cy.request({
    method: 'GET',
    url: '/current-account',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiCurrentAccountGetById', (id, token) => {
  return cy.request({
    method: 'GET',
    url: `/current-account/${id}`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiCurrentAccountUpdate', (id, body, token) => {
  return cy.request({
    method: 'PATCH',
    url: `/current-account/${id}`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });
});

Cypress.Commands.add('apiCurrentAccountRemove', (id, token) => {
  return cy.request({
    method: 'DELETE',
    url: `/current-account/${id}`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});
