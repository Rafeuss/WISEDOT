import 'cypress-axe';
import './commands/login';
import './commands/home';
import './commands/investimentos';
import './commands/notificacoes';
import './commands/transaction-pin-modal';
import './commands/pagamentos';
import './commands/perfil';
import './commands/recuperacao-senha';
import './commands/cadastro';

Cypress.Commands.add('seedTestUser', (overrides) => cy.task('db:seedTestUser', overrides || null));
Cypress.Commands.add('seedMarketShares', () => cy.task('db:seedMarketShares'));
Cypress.Commands.add('cleanTestUsersByPrefix', (prefix) => cy.task('db:cleanTestUsersByEmailPrefix', prefix));

Cypress.Commands.add('waitForRecoverToken', (email, attempts = 5) =>
  cy.task('db:waitForRecoverToken', { email, attempts }),
);

Cypress.Commands.add('apiRequestOtp', (email) =>
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/request-otp`,
    failOnStatusCode: false,
    body: { email },
  }),
);

Cypress.Commands.add('apiValidateOtp', (email, token) =>
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/validate-otp`,
    failOnStatusCode: false,
    body: { email, token },
  }),
);

Cypress.Commands.add('apiChangePassword', (recoveryToken, newPassword) =>
  cy.request({
    method: 'PATCH',
    url: `${Cypress.env('API_URL')}/auth/change-password`,
    failOnStatusCode: false,
    headers: recoveryToken ? { Authorization: `Bearer ${recoveryToken}` } : undefined,
    body: { newPassword },
  }),
);

Cypress.Commands.add('apiLogin', (email, password) =>
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    failOnStatusCode: false,
    body: { email, password },
  }),
);

Cypress.Commands.add('loginAsSeedUser', () => {
  return cy.seedTestUser().then((user) => {
    cy.visit('/');
    cy.uiLoginFillEmail(user.email);
    cy.uiLoginFillPassword(user.password);
    cy.uiLoginSubmit();
    cy.url({ timeout: 20000 }).should('include', '/wallet');
    return cy.wrap(user);
  });
});

function logA11yViolations(violations) {
  cy.task('log', `${violations.length} violacao(oes) de acessibilidade encontrada(s)`);
  violations.forEach((v) => {
    cy.task('log', `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} elemento(s))`);
  });
}

Cypress.Commands.add('runA11yScan', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, { includedImpacts: ['critical', 'serious'], ...options }, logA11yViolations, false);
});
