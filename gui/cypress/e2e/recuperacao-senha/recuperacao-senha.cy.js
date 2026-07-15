import RecuperacaoSenhaPage from '../../support/pageObjects/RecuperacaoSenhaPage';

describe('Recuperação de senha', () => {
  beforeEach(() => {
    RecuperacaoSenhaPage.visit();
  });

  // CT-REC-01 - BUG-15: diferente de Login/Cadastro, nenhuma mensagem de erro
  it('deve manter o botao Enviar desabilitado com e-mail em formato invalido', () => {
    RecuperacaoSenhaPage.fillEmail('emailinvalido');
    RecuperacaoSenhaPage.submitButtonShouldBeDisabled();
  });

  // CT-REC-02 - regressao do BUG-04: a tela nao avanca para a etapa de OTP 
  it('nao deve avancar para a etapa de codigo ao informar um e-mail cadastrado (BUG-04)', () => {
    cy.seedTestUser().then((user) => {
      RecuperacaoSenhaPage.fillEmail(user.email).submit();

      cy.wait(3000);
      RecuperacaoSenhaPage.expectOtpStepNotVisible();
      RecuperacaoSenhaPage.expectStepOneVisible();
    });
  });

  // CT-REC-03 - Campo de e-mail vazio
  it('deve manter o botao Enviar desabilitado com o campo de e-mail vazio', () => {
    RecuperacaoSenhaPage.submitButtonShouldBeDisabled();
  });
});
