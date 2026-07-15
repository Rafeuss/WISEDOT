import TransactionPinModal from './TransactionPinModal';

class PagamentosPage {
  visit() {
    cy.visit('/payment');
    return this;
  }

  fillBarcode(barcode) {
    cy.get('input[name="barcode"], input[placeholder*="código de barras" i]').first().clear().type(barcode);
    return this;
  }

  continueStep() {
    cy.contains('button', 'Continuar').click();
    return this;
  }

  expectInlineError(message) {
    cy.contains(message).should('be.visible');
    return this;
  }

  // Etapa 2 (checking/page.tsx, "Para quando?") -> Etapa 3 (resumo). Espera
  // o cabecalho da etapa 2 renderizar antes de clicar em "Continuar" de novo,
  // evitando clicar no botao antes da navegacao client-side da etapa
  // anterior terminar (mesmo texto "Continuar" se repete nas duas etapas).
  goToSummary() {
    cy.contains('Para quando?', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Continuar').click();
    return this;
  }

  confirmPayment() {
    cy.contains('button', 'Realizar pagamento', { timeout: 10000 }).click();
    return this;
  }

  payWithPin(pin) {
    TransactionPinModal.enterPin(pin).confirm();
    return this;
  }

  // BUG-21: o sucesso do pagamento nao exibe toast, so navega - por isso validamos so a URL.
  expectSuccessToast() {
    cy.url({ timeout: 15000 }).should('include', '/payment');
    return this;
  }

  expectErrorToast(message) {
    cy.contains(message, { timeout: 10000 }).should('be.visible');
    return this;
  }
}

export default new PagamentosPage();
