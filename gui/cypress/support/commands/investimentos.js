Cypress.Commands.add('uiInvestimentosSearchByName', (name) => {
  cy.get('input[placeholder*="Nome do fundo" i]').clear().type(name);
});

Cypress.Commands.add('uiInvestimentosExpectFundVisible', (name) => {
  cy.contains(name, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('uiInvestimentosExpectFundNotVisible', (name) => {
  cy.contains(name).should('not.exist');
});

Cypress.Commands.add('uiInvestimentosFilterByRisk', (risk) => {
  cy.contains('button', /Filtrar|Risco/i).click();
  cy.contains(risk).click();
  cy.contains('button', 'Aplicar').click();
});

Cypress.Commands.add('uiInvestimentosSelectRiskFilter', (risk) => {
  cy.contains('button', new RegExp(`^${risk}$`)).click();
});

Cypress.Commands.add('uiInvestimentosFilterByRisks', (risks) => {
  cy.contains('button', /Filtrar|Risco/i).click();
  risks.forEach((risk) => cy.uiInvestimentosSelectRiskFilter(risk));
  cy.contains('button', 'Aplicar').click();
});

Cypress.Commands.add('uiInvestimentosExpectFilterCount', (count) => {
  cy.contains('button', /Filtrar/i).should('contain.text', String(count));
});

Cypress.Commands.add('uiInvestimentosOpenRiskFilterPanel', () => {
  cy.contains('button', /Filtrar|Risco/i).click();
});

Cypress.Commands.add('uiInvestimentosExpectRiskFilterSelected', (risk) => {
  cy.contains('button', new RegExp(`^${risk}$`)).should('have.class', 'border-[#8FB8FF]');
});

Cypress.Commands.add('uiInvestimentosOpenInvestForm', (fundName) => {
  cy.contains(fundName)
    .parents('div')
    .first()
    .within(() => {
      cy.contains('button', 'Investir').click();
    });
});

Cypress.Commands.add('uiInvestimentosFillInvestAmount', (amount) => {
  cy.get('#RedemptionValueInput').clear().type(amount);
});

Cypress.Commands.add('uiInvestimentosConfirmInvestment', () => {
  cy.get('#investmentButton').click();
});

Cypress.Commands.add('uiInvestimentosExpectInvestmentButtonEnabled', () => {
  cy.get('#investmentButton').should('not.be.disabled');
});

Cypress.Commands.add('uiInvestimentosExpectInvestmentButtonDisabled', () => {
  cy.get('#investmentButton').should('be.disabled');
});

Cypress.Commands.add('uiInvestimentosInvest', (fundName, amount) => {
  cy.uiInvestimentosOpenInvestForm(fundName);
  cy.uiInvestimentosFillInvestAmount(amount);
  cy.uiInvestimentosConfirmInvestment();
});

Cypress.Commands.add('uiInvestimentosGoToMyInvestments', () => {
  cy.contains('Meus investimentos').click();
});

Cypress.Commands.add('uiInvestimentosGoToInvestTab', () => {
  cy.contains('button', 'Investir').click();
});

Cypress.Commands.add('uiInvestimentosExpectInvestmentListed', (fundName) => {
  cy.contains(fundName).should('be.visible');
});

Cypress.Commands.add('uiInvestimentosExpectSuccessToast', () => {
  cy.contains(/investimento.*sucesso/i, { timeout: 8000 }).should('be.visible');
});

Cypress.Commands.add('uiInvestimentosWithdraw', (fundName, amount) => {
  cy.contains(fundName)
    .parents('div')
    .first()
    .within(() => {
      cy.contains('button', /Resgate/i).click();
    });
  cy.get('#RedemptionValueInput').clear().type(amount);
  cy.get('#RedemptionButton').click();
});

Cypress.Commands.add('uiInvestimentosExpectWithdrawSuccessToast', () => {
  cy.contains(/resgate.*sucesso/i, { timeout: 8000 }).should('be.visible');
});

Cypress.Commands.add('uiInvestimentosExpectInsufficientBalanceError', () => {
  cy.contains(/saldo insuficiente/i).should('be.visible');
});
