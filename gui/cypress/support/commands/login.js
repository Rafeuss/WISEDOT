Cypress.Commands.add('uiLoginFillEmail', (email) => {
  cy.get('input[type="email"], input[name="email"]').first().clear().type(email).blur();
});

Cypress.Commands.add('uiLoginFillPassword', (password) => {
  cy.get('input[type="password"], input[name="password"]').first().clear().type(password).blur();
});

Cypress.Commands.add('uiLoginSubmit', () => {
  cy.contains('button', 'Entrar').should('not.be.disabled').click();
});

Cypress.Commands.add('uiLoginSubmitButtonShouldBeDisabled', () => {
  cy.contains('button', 'Entrar').should('be.disabled');
});

Cypress.Commands.add('uiLoginGoToForgotPassword', () => {
  cy.get('#forgot-password-link').click();
});

Cypress.Commands.add('uiLoginExpectErrorToast', (message) => {
  cy.contains(message, { timeout: 6000 }).should('be.visible');
});

Cypress.Commands.add('uiLoginExpectInlineError', (message) => {
  cy.contains(message).should('be.visible');
});

Cypress.Commands.add('uiLoginExpectRedirectedToLogin', () => {
  cy.url({ timeout: 10000 }).should('eq', `${Cypress.config('baseUrl')}/`);
  cy.contains('button', 'Entrar').should('be.visible');
});
