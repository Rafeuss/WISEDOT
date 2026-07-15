import PerfilPage from '../../support/pageObjects/PerfilPage';
import HomePage from '../../support/pageObjects/HomePage';

describe('Perfil / Logout', () => {
  beforeEach(() => {
    cy.loginAsSeedUser();
    HomePage.visit();
  });

  // CT-PERF-01 - Dropdown exibe os dados da conta (Agencia/Conta/Instituicao)
  it('deve exibir os rotulos de dados da conta no dropdown de perfil', () => {
    PerfilPage.openProfileMenu();
    PerfilPage.expectAccountDetailsVisible();
  });

  // CT-PERF-02 - regressao BUG-02: "Sair" so navega para "/"
  it('deve manter o cookie de sessao valido e a rota protegida acessivel apos o logout (BUG-02)', () => {
    cy.getCookie('token').should('exist');

    PerfilPage.logout();

    cy.getCookie('token').should('exist');
    cy.visit('/wallet');
    cy.url().should('include', '/wallet');
  });
});
