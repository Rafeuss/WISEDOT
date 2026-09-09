describe('Perfil / Logout', () => {
  beforeEach(() => {
    cy.loginAsSeedUser();
    cy.visit('/wallet');
  });

  // CT-PERF-01 - Dropdown exibe os dados da conta (Agencia/Conta/Instituicao)
  it('deve exibir os rótulos de dados da conta no dropdown de perfil', () => {
    cy.uiPerfilOpenProfileMenu();
    cy.uiPerfilExpectAccountDetailsVisible();
  });

  // CT-PERF-02 - skip: aguardando correcao do BUG-02 (logout nao invalida a sessao/cookie)
  it.skip('deve invalidar o cookie de sessão e bloquear a rota protegida após o logout (BUG-02)', () => {
    cy.getCookie('token').should('exist');

    cy.uiPerfilLogout();

    cy.getCookie('token').should('not.exist');
    cy.visit('/wallet');
    cy.url().should('not.include', '/wallet');
  });

  // CT-PERF-03 - skip: aguardando correcao do BUG-02 (logout nao invalida a sessao/cookie); reproduzido tambem ao clicar so no icone (BUG-32)
  it.skip('deve invalidar o cookie de sessão e bloquear a rota protegida ao clicar apenas no ícone de porta (BUG-32)', () => {
    cy.getCookie('token').should('exist');

    cy.uiPerfilOpenProfileMenu();
    cy.uiPerfilClickLogoutIcon();

    cy.getCookie('token').should('not.exist');
    cy.visit('/wallet');
    cy.url().should('not.include', '/wallet');
  });

  // CT-PERF-04 - cada botao de copiar leva o valor correto para a area de transferencia, sem confirmacao visual
  it('deve copiar o valor correto de cada campo da conta ao clicar no respectivo botao de copiar', () => {
    cy.uiPerfilOpenProfileMenu();
    cy.uiPerfilStubClipboard();

    ['email', 'agencia', 'conta', 'instituicao'].forEach((field) => {
      cy.uiPerfilFieldValueText(field).then((value) => {
        cy.uiPerfilClickCopyButton(field);
        cy.uiPerfilExpectClipboardWrittenWith(value);
      });
    });

    cy.uiPerfilExpectNoCopyConfirmationVisible();
  });
});
