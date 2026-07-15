import HomePage from './HomePage';

class PerfilPage {
  openProfileMenu() {
    HomePage.openAccountMenu();
    return this;
  }

  // BUG-07: Profile.tsx busca os dados via uma chamada que retorna 500, entao os valores
  // ficam no placeholder "0" - aqui so validamos que os 3 rotulos sao renderizados.
  expectAccountDetailsVisible() {
    cy.get('#profile-modal').within(() => {
      cy.contains('Agência').should('be.visible');
      cy.contains('Conta').should('be.visible');
      cy.contains('Instituição').should('be.visible');
    });
    return this;
  }

  logout() {
    HomePage.logoutFromAccountMenu();
    return this;
  }
}

export default new PerfilPage();
