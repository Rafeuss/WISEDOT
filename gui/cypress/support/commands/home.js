Cypress.Commands.add('uiHomeExpectBalance', (value) => {
  cy.contains(value).should('be.visible');
});

Cypress.Commands.add('uiHomeGoToInvestments', () => {
  cy.contains('Meus investimentos').click();
});

Cypress.Commands.add('uiHomeOpenAccountMenu', () => {
  cy.get('#open-profile').click();
});

Cypress.Commands.add('uiHomeLogoutFromAccountMenu', () => {
  cy.uiHomeOpenAccountMenu();
  cy.contains('Sair').click();
});

Cypress.Commands.add('uiHomeClickLogoutDoorIcon', () => {
  cy.get('#logout-door').click();
});

Cypress.Commands.add('uiHomeToggleBalanceEye', () => {
  cy.get('#show-information').click();
});

Cypress.Commands.add('uiHomeExpectBalanceMasked', () => {
  cy.get('#total-balance').should('contain.text', '••••••');
});

Cypress.Commands.add('uiHomeExpectOnboardingTourVisible', () => {
  cy.contains('Acesso a informações da conta', { timeout: 8000 }).should('be.visible');
});

Cypress.Commands.add('uiHomeSkipOnboardingTour', () => {
  cy.contains('.shepherd-button', 'Pular').click();
});

Cypress.Commands.add('uiHomeExpectOnboardingTourNotVisible', () => {
  cy.contains('Acesso a informações da conta').should('not.exist');
});

Cypress.Commands.add('uiHomeExpectLinkToExtractComplete', () => {
  cy.get('a[href*="extract-complete"]').should('exist');
});

Cypress.Commands.add('uiHomeExpectExtractCompleteLoaded', () => {
  cy.contains('Extrato completo').should('be.visible');
  cy.contains('button', 'Filtrar').should('be.visible');
  cy.contains('button', 'Exportar').should('be.visible');
});

Cypress.Commands.add('uiHomeExpectGreetingDoesNotOverflow', () => {
  cy.document().should((doc) => {
    expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
  });
});
