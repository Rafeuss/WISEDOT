Cypress.Commands.add('uiPagamentosFillBarcode', (barcode) => {
  cy.get('input[name="barcode"], input[placeholder*="código de barras" i]').first().clear().type(barcode);
});

Cypress.Commands.add('uiPagamentosContinueStep', () => {
  cy.contains('button', 'Continuar').click();
});

Cypress.Commands.add('uiPagamentosExpectInlineError', (message) => {
  cy.contains(message).should('be.visible');
});

Cypress.Commands.add('uiPagamentosExpectStepTwoVisible', () => {
  cy.contains('Para quando?', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('uiPagamentosGoToSummary', () => {
  cy.uiPagamentosExpectStepTwoVisible();
  cy.contains('button', 'Continuar').click();
});

Cypress.Commands.add('uiPagamentosConfirmPayment', () => {
  cy.contains('button', 'Realizar pagamento', { timeout: 10000 }).click();
});

Cypress.Commands.add('uiPagamentosPayWithPin', (pin) => {
  cy.uiTransactionPinModalEnterPin(pin);
  cy.uiTransactionPinModalConfirm();
});

Cypress.Commands.add('uiPagamentosExpectSuccessToast', () => {
  cy.contains(/pagamento realizado/i, { timeout: 30000 }).should('be.visible');
});

Cypress.Commands.add('uiPagamentosExpectErrorToast', (message) => {
  cy.contains(message, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('uiPagamentosExpectBarcodeValue', (value) => {
  cy.get('input[name="barcode"], input[placeholder*="código de barras" i]').first().should('have.value', value);
});

Cypress.Commands.add('uiPagamentosExpectBarcodeEmpty', () => {
  return cy.uiPagamentosExpectBarcodeValue('');
});

Cypress.Commands.add('uiPagamentosGoBackToStepOne', () => {
  cy.contains('button', 'Voltar').click();
});

