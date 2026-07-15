class HomePage {
  visit() {
    cy.visit('/wallet');
    return this;
  }

  expectBalance(value) {
    cy.contains(value).should('be.visible');
    return this;
  }

  goToInvestments() {
    cy.contains('Meus investimentos').click();
    return this;
  }

  openAccountMenu() {
    cy.get('#open-profile').click();
    return this;
  }

  logoutFromAccountMenu() {
    this.openAccountMenu();
    cy.contains('Sair').click();
    return this;
  }

  toggleBalanceEye() {
    cy.get('#show-information').click();
    return this;
  }

  expectBalanceMasked() {
    cy.get('#total-balance').should('contain.text', '••••••');
    return this;
  }

  expectOnboardingTourVisible() {
    cy.contains('Acesso a informações da conta', { timeout: 8000 }).should('be.visible');
    return this;
  }
}

export default new HomePage();
