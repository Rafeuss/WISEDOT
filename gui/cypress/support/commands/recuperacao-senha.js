Cypress.Commands.add('uiRecuperacaoSenhaFillEmail', (email) => {
  cy.get('#email').clear().type(email);
});

Cypress.Commands.add('uiRecuperacaoSenhaSubmit', () => {
  cy.get('#enter-btn').click();
});

Cypress.Commands.add('uiRecuperacaoSenhaSubmitButtonShouldBeDisabled', () => {
  cy.get('#enter-btn').should('be.disabled');
});

Cypress.Commands.add('uiRecuperacaoSenhaExpectOtpStepVisible', () => {
  cy.contains('E-mail enviado').should('be.visible');
});

Cypress.Commands.add('uiRecuperacaoSenhaGoToLogin', () => {
  cy.get('#back-link').click();
});

Cypress.Commands.add('uiRecuperacaoSenhaExpectEmailEmpty', () => {
  cy.get('#email').should('have.value', '');
});
