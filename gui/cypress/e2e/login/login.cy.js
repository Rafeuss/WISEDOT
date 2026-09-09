describe('Login', () => {
  let testUser;

  before(() => {
    cy.seedTestUser().then((user) => {
      testUser = user;
    });
  });

  beforeEach(() => {
    cy.visit('/');
  });

  // CT-LOGIN-01 - Fluxo positivo
  it('deve logar com sucesso usando credenciais válidas', () => {
    cy.uiLoginFillEmail(testUser.email);
    cy.uiLoginFillPassword(testUser.password);
    cy.uiLoginSubmit();
    cy.url().should('include', '/wallet');
  });

  // CT-LOGIN-02 - Credenciais invalidas
  it('deve exibir mensagem genérica para credenciais inválidas', () => {
    cy.uiLoginFillEmail(testUser.email);
    cy.uiLoginFillPassword('SenhaErrada@123');
    cy.uiLoginSubmit();
    cy.uiLoginExpectErrorToast('E-mail ou senha inválidos');
    cy.url().should('not.include', '/wallet');
  });

  // CT-LOGIN-03 - E-mail em formato invalido
  it('deve bloquear submissão com e-mail em formato inválido', () => {
    cy.uiLoginFillEmail('emailinvalido');
    cy.uiLoginFillPassword(testUser.password);
    cy.uiLoginExpectInlineError('Insira um e-mail válido');
    cy.uiLoginSubmitButtonShouldBeDisabled();
  });

  // CT-LOGIN-04 - Senha curta (menor que o minimo)
  it('deve bloquear submissão com senha menor que 8 caracteres', () => {
    cy.uiLoginFillEmail(testUser.email);
    cy.uiLoginFillPassword('abc');
    cy.uiLoginExpectInlineError('A senha deve ter pelo menos 8 caracteres');
    cy.uiLoginSubmitButtonShouldBeDisabled();
  });

  // CT-LOGIN-05 - Campos vazios
  it('deve manter o botao Entrar desabilitado com campos vazios', () => {
    cy.uiLoginSubmitButtonShouldBeDisabled();
  });

  // CT-LOGIN-06 - Rotas protegidas redirecionam para o login sem sessao
  it('deve redirecionar para o login ao acessar rotas protegidas sem sessão', () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('/wallet');
    cy.uiLoginExpectRedirectedToLogin();

    cy.visit('/investment');
    cy.uiLoginExpectRedirectedToLogin();

    cy.visit('/payment');
    cy.uiLoginExpectRedirectedToLogin();

    cy.visit('/notification');
    cy.uiLoginExpectRedirectedToLogin();

    cy.visit('/wallet/extract-complete');
    cy.uiLoginExpectRedirectedToLogin();
  });

  // CT-LOGIN-07 - Usuario autenticado acessando tela de auth e redirecionado para dentro do app
  it('deve redirecionar para a Carteira ao acessar /auth/register já autenticado', () => {
    cy.loginAsSeedUser();
    cy.visit('/auth/register');
    cy.url().should('include', '/wallet');
  });
});
