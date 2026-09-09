const OTHER_USER = {
  email: 'qa.seed.user.b.auth@academywallet.test',
  cpf: '52998224728',
  rg: '112233448',
};

describe('API - Auth', () => {
  let testUser;

  beforeEach(() => {
    cy.seedTestUser().then((user) => {
      testUser = user;
    });
  });

  // CT-API-AUTH-01 - Login com sucesso
  it('deve autenticar com credenciais válidas e retornar token', () => {
    cy.apiAuthLogin(testUser.email, testUser.password).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('token');
      expect(response.body.data).to.have.property('expiresIn', 3600);
    });
  });

  // CT-API-AUTH-02 - Senha incorreta
  it('deve retornar 401 para senha incorreta', () => {
    cy.apiAuthLogin(testUser.email, 'SenhaErrada@123').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-03 - E-mail inexistente
  it('deve retornar 401 para e-mail não cadastrado', () => {
    cy.apiAuthLogin('nao.existe@academywallet.test', 'Qualquer@123').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-04 - Payload sem senha (contrato)
  it('deve retornar 422 quando a senha não é informada', () => {
    cy.apiAuthLogin(testUser.email).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'password')).to.be.true;
    });
  });

  // CT-API-AUTH-05 - skip: aguardando correcao do BUG-04 (request-otp retorna 500 nao tratado para e-mail valido)
  it.skip('não deve falhar com erro 500 ao solicitar recuperação de senha com um e-mail válido (BUG-04)', () => {
    cy.apiAuthRequestOtp(testUser.email).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  // CT-API-AUTH-06 - skip: aguardando correcao do BUG-28 (change-password nao altera de fato a senha de quem solicitou a redefinicao, este fluxo depende disso)
  it.skip('deve completar o fluxo de redefinicao de senha (OTP -> troca de senha -> novo login)', () => {
    cy.apiAuthRequestOtp(testUser.email);

    cy.recoverTokenByEmail(testUser.email).then((otpToken) => {
      cy.apiAuthValidateOtp(testUser.email, otpToken).then((validateResponse) => {
        expect(validateResponse.status).to.eq(200);
        const recoverPasswordToken = validateResponse.body.data.recoverPasswordToken;

        cy.apiAuthChangePassword(recoverPasswordToken, 'NovaSenha@123').then((changeResponse) => {
          expect(changeResponse.status).to.eq(200);
          expect(changeResponse.body.message).to.eq('Password changed');
        });

        cy.apiAuthLogin(testUser.email, 'NovaSenha@123').then((loginResponse) => {
          expect(loginResponse.status).to.eq(200);
        });
      });
    });
  });

  // CT-API-AUTH-07 - validate-otp com token incorreto
  it('deve retornar 401 ao validar OTP com token incorreto', () => {
    cy.apiAuthRequestOtp(testUser.email);

    cy.apiAuthValidateOtp(testUser.email, '0000').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-08 - skip: aguardando correcao do BUG-24 (validate-otp retorna 500 nao tratado sem solicitacao previa)
  it.skip('não deve retornar erro 500 ao validar um código OTP para um usuário que nunca solicitou um (BUG-24)', () => {
    cy.apiAuthValidateOtp(testUser.email, '0000').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-09 - validate-otp com e-mail inexistente
  it('deve retornar 404 ao validar OTP com e-mail não cadastrado', () => {
    cy.apiAuthValidateOtp('nao.existe@academywallet.test', '0000').then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // CT-API-AUTH-10 - change-password sem token de recuperacao
  it('deve retornar 401 ao trocar a senha sem token de recuperação', () => {
    cy.apiAuthChangePassword(undefined, 'NovaSenha@123').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-11 - skip: aguardando correcao do BUG-42 (token de recuperacao de senha e reutilizavel apos a primeira troca)
  it.skip('não deve permitir que o token de recuperação de senha seja reutilizado após a primeira troca (BUG-42)', () => {
    cy.apiAuthRequestOtp(testUser.email);

    cy.recoverTokenByEmail(testUser.email).then((otpToken) => {
      cy.apiAuthValidateOtp(testUser.email, otpToken).then((validateResponse) => {
        const recoverPasswordToken = validateResponse.body.data.recoverPasswordToken;

        cy.apiAuthChangePassword(recoverPasswordToken, 'PrimeiraTroca@123').then((firstChange) => {
          expect(firstChange.status).to.eq(200);
        });

        cy.apiAuthChangePassword(recoverPasswordToken, 'SegundaTroca@456').then((secondChange) => {
          expect(secondChange.status).to.eq(401);
        });
      });
    });
  });

  // CT-API-AUTH-12 - LoginDto.password: abaixo do minimo (4 caracteres)
  it('deve retornar 422 quando a senha de login tem menos de 5 caracteres', () => {
    cy.apiAuthLogin(testUser.email, 'Ab1@').then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'password')).to.be.true;
    });
  });

  // CT-API-AUTH-13 - LoginDto.password: acima do maximo (51 caracteres)
  it('deve retornar 422 quando a senha de login tem mais de 50 caracteres', () => {
    cy.apiAuthLogin(testUser.email, `${'a'.repeat(50)}1`).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'password')).to.be.true;
    });
  });

  // CT-API-AUTH-14 - VerifyEmailTokenDto.token: menos de 4 digitos
  it('deve retornar 422 ao validar OTP com token de 3 dígitos', () => {
    cy.apiAuthValidateOtp(testUser.email, '123').then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'token')).to.be.true;
    });
  });

  // CT-API-AUTH-15 - VerifyEmailTokenDto.token: contem letras
  it('deve retornar 422 ao validar OTP com token contendo letras', () => {
    cy.apiAuthValidateOtp(testUser.email, 'ab12').then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'token')).to.be.true;
    });
  });

  // CT-API-AUTH-16 - VerifyEmailTokenDto.token: mais de 4 digitos
  it('deve retornar 422 ao validar OTP com token de 5 dígitos', () => {
    cy.apiAuthValidateOtp(testUser.email, '12345').then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'token')).to.be.true;
    });
  });

  // CT-API-AUTH-17 - skip: aguardando correcao do BUG-28 (change-password nao altera de fato a senha de quem solicitou a redefinicao)
  it.skip('deve alterar a senha da própria conta ao concluir o fluxo de recuperação de senha (BUG-28)', () => {
    cy.seedTestUser(OTHER_USER).then(() => {
      cy.apiAuthRequestOtp(testUser.email);

      cy.recoverTokenByEmail(testUser.email).then((otpToken) => {
        cy.apiAuthValidateOtp(testUser.email, otpToken).then((validateResponse) => {
          const recoverPasswordToken = validateResponse.body.data.recoverPasswordToken;
          const newPassword = 'NovaSenhaBug28@123';

          cy.apiAuthChangePassword(recoverPasswordToken, newPassword).then((changeResponse) => {
            expect(changeResponse.status).to.eq(200);
            expect(changeResponse.body.message).to.eq('Password changed');
          });

          cy.apiAuthLogin(testUser.email, testUser.password).then((oldPasswordLogin) => {
            expect(oldPasswordLogin.status).to.eq(401);
          });

          cy.apiAuthLogin(testUser.email, newPassword).then((newPasswordLogin) => {
            expect(newPasswordLogin.status).to.eq(200);
          });
        });
      });

      cy.cleanTestUser(OTHER_USER.email);
    });
  });
});
