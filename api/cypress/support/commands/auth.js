Cypress.Commands.add('apiAuthLogin', (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/auth/login',
    failOnStatusCode: false,
    body: { email, password },
  });
});

Cypress.Commands.add('apiAuthRequestOtp', (email) => {
  return cy.request({
    method: 'POST',
    url: '/auth/request-otp',
    failOnStatusCode: false,
    body: { email },
  });
});

Cypress.Commands.add('apiAuthValidateOtp', (email, token) => {
  return cy.request({
    method: 'POST',
    url: '/auth/validate-otp',
    failOnStatusCode: false,
    body: { email, token },
  });
});

Cypress.Commands.add('apiAuthChangePassword', (recoveryToken, newPassword) => {
  return cy.request({
    method: 'PATCH',
    url: '/auth/change-password',
    failOnStatusCode: false,
    headers: recoveryToken ? { Authorization: `Bearer ${recoveryToken}` } : undefined,
    body: { newPassword },
  });
});
