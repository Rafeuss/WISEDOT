describe('Recuperação de senha', () => {
  beforeEach(() => {
    cy.visit('/auth/forgot-password');
  });

  // CT-REC-01 - BUG-15: diferente de Login/Cadastro, nenhuma mensagem de erro
  it('deve manter o botao Enviar desabilitado com e-mail em formato inválido', () => {
    cy.uiRecuperacaoSenhaFillEmail('emailinvalido');
    cy.uiRecuperacaoSenhaSubmitButtonShouldBeDisabled();
  });

  // CT-REC-02 - skip: aguardando correcao do BUG-04 (request-otp falha com 500 e a tela nao avanca para a etapa de OTP)
  it.skip('deve avançar para a etapa de código (OTP) ao informar um e-mail cadastrado (BUG-04)', () => {
    cy.intercept('POST', '**/auth/request-otp').as('requestOtp');

    cy.seedTestUser().then((user) => {
      cy.uiRecuperacaoSenhaFillEmail(user.email);
      cy.uiRecuperacaoSenhaSubmit();

      cy.wait('@requestOtp');
      cy.uiRecuperacaoSenhaExpectOtpStepVisible();
    });
  });

  // CT-REC-03 - Campo de e-mail vazio
  it('deve manter o botao Enviar desabilitado com o campo de e-mail vazio', () => {
    cy.uiRecuperacaoSenhaSubmitButtonShouldBeDisabled();
  });

  // CT-REC-04 - solicitar um novo codigo invalida o codigo anterior
  it('deve invalidar o código anterior ao solicitar um novo código para o mesmo e-mail', () => {
    cy.seedTestUser({
      email: 'qa.rec04.otp@academywallet.test',
      cpf: '22233344456',
      rg: '112233440',
    }).then((user) => {
      cy.apiRequestOtp(user.email);

      cy.waitForRecoverToken(user.email).then((oldToken) => {
        cy.apiRequestOtp(user.email);

        cy.waitForRecoverToken(user.email).then((newToken) => {
          expect(newToken).to.not.eq(oldToken);

          cy.apiValidateOtp(user.email, oldToken).then((oldTokenResponse) => {
            expect(oldTokenResponse.status).to.eq(401);
            expect(oldTokenResponse.body.message).to.eq('Token inválido');
          });

          cy.apiValidateOtp(user.email, newToken).then((newTokenResponse) => {
            expect(newTokenResponse.status).to.eq(200);
            expect(newTokenResponse.body.data).to.have.property('recoverPasswordToken');
          });
        });
      });
    });
  });

  // CT-REC-05 - skip: aguardando correcao do BUG-28 (change-password nao altera de fato a senha de quem solicitou a redefinicao)
  it.skip('deve alterar a senha da própria conta ao concluir o fluxo de recuperação de senha (BUG-28)', () => {
    cy.seedTestUser({
      email: 'qa.rec05.recovery@academywallet.test',
      cpf: '22233344457',
      rg: '112233441',
    }).then((user) => {
      cy.apiRequestOtp(user.email);

      cy.waitForRecoverToken(user.email).then((token) => {
        cy.apiValidateOtp(user.email, token).then((validateResponse) => {
          const recoverPasswordToken = validateResponse.body.data.recoverPasswordToken;
          const newPassword = 'NovaSenhaBug28@123';

          cy.apiChangePassword(recoverPasswordToken, newPassword).then((changeResponse) => {
            expect(changeResponse.status).to.eq(200);
          });

          cy.apiLogin(user.email, user.password).then((oldPasswordLogin) => {
            expect(oldPasswordLogin.status).to.eq(401);
          });

          cy.apiLogin(user.email, newPassword).then((newPasswordLogin) => {
            expect(newPasswordLogin.status).to.eq(200);
          });
        });
      });
    });
  });

  // CT-REC-06 - e-mail digitado nao e preservado ao sair para o login e voltar
  it('deve limpar o e-mail digitado ao voltar para o login e retornar para a tela de recuperação', () => {
    cy.uiRecuperacaoSenhaFillEmail('usuario.recuperacao@academywallet.test');
    cy.uiRecuperacaoSenhaGoToLogin();
    cy.uiLoginGoToForgotPassword();
    cy.uiRecuperacaoSenhaExpectEmailEmpty();
  });
});
