Cypress.Commands.add('uiNotificacoesExpectTitleVisible', () => {
  cy.contains('Notificações').should('be.visible');
});

Cypress.Commands.add('uiNotificacoesInterceptNotificationCall', () => {
  cy.intercept('GET', '**/notification').as('notificationCall');
});

Cypress.Commands.add('uiNotificacoesExpectNotificationCallNotBroken', () => {
  cy.wait('@notificationCall').its('request.url').should('not.include', '/undefined/');
});

Cypress.Commands.add('uiNotificacoesExpectNotificationsRendered', () => {
  cy.contains('Carregando notificações...').should('not.exist');
  cy.get('.container-not').should('exist');
});
