import 'cypress-axe';
import LoginPage from './pageObjects/LoginPage';

Cypress.Commands.add('seedTestUser', () => cy.task('db:seedTestUser'));
Cypress.Commands.add('cleanTestUser', () => cy.task('db:cleanTestUser'));
Cypress.Commands.add('seedMarketShares', () => cy.task('db:seedMarketShares'));
Cypress.Commands.add('cleanMarketShares', () => cy.task('db:cleanMarketShares'));
Cypress.Commands.add('seedAll', () => cy.task('db:seedAll'));

Cypress.Commands.add('loginAsSeedUser', () => {
  return cy.seedTestUser().then((user) => {
    LoginPage.visit().fillEmail(user.email).fillPassword(user.password).submit();
    cy.url().should('include', '/wallet');
    return cy.wrap(user);
  });
});

function logA11yViolations(violations) {
  cy.task('log', `${violations.length} violacao(oes) de acessibilidade encontrada(s)`);
  violations.forEach((v) => {
    cy.task('log', `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} elemento(s))`);
  });
}

// skipFailures=true: reporta violacoes (logadas + documentadas em bugReport.md)
// em vez de falhar a suite, ja que o objetivo e documentar a aplicacao, nao corrigi-la.
Cypress.Commands.add('runA11yScan', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options, logA11yViolations, true);
});
