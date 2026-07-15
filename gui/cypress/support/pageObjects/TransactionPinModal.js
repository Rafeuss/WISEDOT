// Cada botao representa um PAR de digitos ofuscado (ex: "5 ou 9"); o backend
// testa as 64 combinacoes e aceita a que bater com o PIN. Ver BUG-01.
class TransactionPinModal {
  enterPin(pin) {
    cy.get('#number-buttons').should('be.visible');

    cy.get('#number-buttons button:not(#delete-button)').then(($buttons) => {
      const pairs = [...$buttons].map((btn) => {
        const match = btn.textContent.match(/(\d+)\s*ou\s*(\d+)/i);
        return { num1: match[1], num2: match[2] };
      });

      pin.split('').forEach((digit) => {
        const pairIndex = pairs.findIndex((p) => p.num1 === digit || p.num2 === digit);
        if (pairIndex === -1) {
          throw new Error(`Digito ${digit} nao encontrado em nenhum par do teclado de PIN`);
        }
        // o modal re-renderiza a cada digito; sem essa espera a query
        // seguinte pode pegar o DOM em transicao.
        cy.wait(150);
        cy.get('#number-buttons', { timeout: 10000 }).should('be.visible');
        cy.get('#number-buttons button:not(#delete-button)').eq(pairIndex).click();
      });
    });

    cy.get('#confirm-button').should('not.be.disabled');
    return this;
  }

  confirm() {
    cy.get('#confirm-button').click();
    return this;
  }
}

export default new TransactionPinModal();
