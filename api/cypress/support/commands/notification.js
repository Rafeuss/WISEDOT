Cypress.Commands.add('apiNotificationSend', (userId, title, message, token) => {
  return cy.request({
    method: 'POST',
    url: '/notification',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: { userId, title, message },
  });
});

Cypress.Commands.add('apiNotificationList', (token) => {
  return cy.request({
    method: 'GET',
    url: '/notification',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
});

Cypress.Commands.add('apiNotificationMarkAsSeen', (notificationId, token) => {
  return cy.request({
    method: 'PATCH',
    url: '/notification/mark-as-seen',
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: { notificationId },
  });
});
