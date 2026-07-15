import LoginPage from '../../support/pageObjects/LoginPage';

describe('Login', () => {
  let testUser;

  before(() => {
    cy.seedTestUser().then((user) => {
      testUser = user;
    });
  });

  beforeEach(() => {
    LoginPage.visit();
  });

  // CT-LOGIN-01 - Fluxo positivo
  it('deve logar com sucesso usando credenciais validas', () => {
    LoginPage.fillEmail(testUser.email).fillPassword(testUser.password).submit();
    cy.url().should('include', '/wallet');
  });

  // CT-LOGIN-02 - Credenciais invalidas
  it('deve exibir mensagem generica para credenciais invalidas', () => {
    LoginPage.fillEmail(testUser.email).fillPassword('SenhaErrada@123').submit();
    LoginPage.expectErrorToast('E-mail ou senha inválidos');
    cy.url().should('not.include', '/wallet');
  });

  // CT-LOGIN-03 - E-mail em formato invalido
  it('deve bloquear submissao com e-mail em formato invalido', () => {
    LoginPage.fillEmail('emailinvalido').fillPassword(testUser.password);
    LoginPage.expectInlineError('Insira um e-mail válido');
    LoginPage.submitButtonShouldBeDisabled();
  });

  // CT-LOGIN-04 - Senha curta (menor que o minimo)
  it('deve bloquear submissao com senha menor que 8 caracteres', () => {
    LoginPage.fillEmail(testUser.email).fillPassword('abc');
    LoginPage.expectInlineError('A senha deve ter pelo menos 8 caracteres');
    LoginPage.submitButtonShouldBeDisabled();
  });

  // CT-LOGIN-05 - Campos vazios
  it('deve manter o botao Entrar desabilitado com campos vazios', () => {
    LoginPage.submitButtonShouldBeDisabled();
  });
});
