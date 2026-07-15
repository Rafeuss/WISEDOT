class InvestimentosPage {
  visit() {
    cy.visit('/investment');
    return this;
  }

  searchByName(name) {
    cy.get('input[placeholder*="Nome do fundo" i]').clear().type(name);
    return this;
  }

  // Timeout maior que o default: a primeira renderizacao da lista busca GET
  // /market-share e pode demorar mais que 4s, causando flakiness.
  expectFundVisible(name) {
    cy.contains(name, { timeout: 10000 }).should('be.visible');
    return this;
  }

  expectFundNotVisible(name) {
    cy.contains(name).should('not.exist');
    return this;
  }

  filterByRisk(risk) {
    cy.contains('button', /Filtrar|Risco/i).click();
    cy.contains(risk).click();
    cy.contains('button', 'Aplicar').click();
    return this;
  }

  // #RedemptionValueInput e compartilhado entre investir/resgatar (RefundSection.tsx);
  // #investmentButton so abre o modal de PIN - a confirmacao e feita nos specs.
  invest(fundName, amount) {
    cy.contains(fundName)
      .parents('div')
      .first()
      .within(() => {
        cy.contains('button', 'Investir').click();
      });
    cy.get('#RedemptionValueInput').clear().type(amount);
    cy.get('#investmentButton').click();
    return this;
  }

  goToMyInvestments() {
    cy.contains('Meus investimentos').click();
    return this;
  }

  expectInvestmentListed(fundName) {
    cy.contains(fundName).should('be.visible');
    return this;
  }

  expectSuccessToast() {
    cy.contains(/investimento.*sucesso/i, { timeout: 8000 }).should('be.visible');
    return this;
  }

  // Em "Meus investimentos" o botao mostra o valor no rotulo (ex: "Resgate: R$ 500,00"),
  // nao o texto "Resgatar" (MyInvestmentsContainer.tsx).
  withdraw(fundName, amount) {
    cy.contains(fundName)
      .parents('div')
      .first()
      .within(() => {
        cy.contains('button', /Resgate/i).click();
      });
    cy.get('#RedemptionValueInput').clear().type(amount);
    cy.get('#RedemptionButton').click();
    return this;
  }

  expectWithdrawSuccessToast() {
    cy.contains(/resgate.*sucesso/i, { timeout: 8000 }).should('be.visible');
    return this;
  }

  expectInsufficientBalanceError() {
    cy.contains(/saldo insuficiente/i).should('be.visible');
    return this;
  }
}

export default new InvestimentosPage();
