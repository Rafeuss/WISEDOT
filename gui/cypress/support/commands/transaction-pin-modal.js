Cypress.Commands.add('uiTransactionPinModalEnterPin', (pin) => {
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
      cy.get('#number-buttons', { timeout: 10000 }).should('be.visible');
      cy.get('#number-buttons button:not(#delete-button)').eq(pairIndex).click();
    });
  });

  cy.get('#confirm-button').should('not.be.disabled');
});

Cypress.Commands.add('uiTransactionPinModalConfirm', () => {
  cy.get('#confirm-button').click();
});
