Cypress.Commands.add('apiMarketShareList', ({ page = 1, size = 50 } = {}, token) => {
  return cy.request({
    method: 'GET',
    url: `/market-share?page=${page}&size=${size}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiMarketShareSearch', (query, token) => {
  return cy.request({
    method: 'GET',
    url: `/market-share/search?query=${query}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiMarketShareFilterByRisk', (risk, token) => {
  return cy.request({
    method: 'GET',
    url: `/market-share/filter-by-risk?risk=${risk}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiMarketShareGetById', (id, { token, failOnStatusCode = true } = {}) => {
  return cy.request({
    method: 'GET',
    url: `/market-share/${id}`,
    failOnStatusCode,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});
