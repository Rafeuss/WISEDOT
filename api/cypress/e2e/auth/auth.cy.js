describe('API - Auth', () => {
  let testUser;

  beforeEach(() => {
    cy.seedTestUser().then((user) => {
      testUser = user;
    });
  });

  // CT-API-AUTH-01 - Login com sucesso
  it('deve autenticar com credenciais validas e retornar token', () => {
    cy.request('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('token');
      expect(response.body.data).to.have.property('expiresIn', 3600);
    });
  });

  // CT-API-AUTH-02 - Senha incorreta
  it('deve retornar 401 para senha incorreta', () => {
    cy.request({
      method: 'POST',
      url: '/auth/login',
      body: { email: testUser.email, password: 'SenhaErrada@123' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-03 - E-mail inexistente
  it('deve retornar 401 para e-mail nao cadastrado', () => {
    cy.request({
      method: 'POST',
      url: '/auth/login',
      body: { email: 'nao.existe@academywallet.test', password: 'Qualquer@123' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-04 - Payload sem senha (contrato)
  it('deve retornar 422 quando a senha nao e informada', () => {
    cy.request({
      method: 'POST',
      url: '/auth/login',
      body: { email: testUser.email },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  // CT-API-AUTH-05 - regressao: recuperacao de senha (ver BUG-04)
  it('regressao BUG-04: recuperacao de senha falha com 500 nao tratado', () => {
    cy.request({
      method: 'POST',
      url: '/auth/request-otp',
      body: { email: testUser.email },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  // CT-API-AUTH-06 - fluxo positivo: request-otp -> validate-otp -> change-password -> login
  it('deve completar o fluxo de redefinicao de senha (OTP -> troca de senha -> novo login)', () => {
    cy.request({
      method: 'POST',
      url: '/auth/request-otp',
      body: { email: testUser.email },
      failOnStatusCode: false,
    });

    cy.recoverTokenByEmail(testUser.email).then((otpToken) => {
      cy.request({
        method: 'POST',
        url: '/auth/validate-otp',
        body: { email: testUser.email, token: otpToken },
      }).then((validateResponse) => {
        expect(validateResponse.status).to.eq(200);
        const recoverPasswordToken = validateResponse.body.data.recoverPasswordToken;

        cy.request({
          method: 'PATCH',
          url: '/auth/change-password',
          headers: { Authorization: `Bearer ${recoverPasswordToken}` },
          body: { newPassword: 'NovaSenha@123' },
        }).then((changeResponse) => {
          expect(changeResponse.status).to.eq(200);
          expect(changeResponse.body.message).to.eq('Password changed');
        });

        cy.request({
          method: 'POST',
          url: '/auth/login',
          body: { email: testUser.email, password: 'NovaSenha@123' },
        }).then((loginResponse) => {
          expect(loginResponse.status).to.eq(200);
        });
      });
    });
  });

  // CT-API-AUTH-07 - validate-otp com token incorreto
  it('deve retornar 401 ao validar OTP com token incorreto', () => {
    cy.request({
      method: 'POST',
      url: '/auth/request-otp',
      body: { email: testUser.email },
      failOnStatusCode: false,
    });

    cy.request({
      method: 'POST',
      url: '/auth/validate-otp',
      failOnStatusCode: false,
      body: { email: testUser.email, token: '0000' },
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-07b - regressao: validate-otp para usuario que nunca solicitou OTP (ver BUG-24)
  it('regressao BUG-24: retorna 500 nao tratado ao validar OTP para usuario que nunca solicitou um', () => {
    cy.request({
      method: 'POST',
      url: '/auth/validate-otp',
      failOnStatusCode: false,
      body: { email: testUser.email, token: '0000' },
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  // CT-API-AUTH-08 - validate-otp com e-mail inexistente
  it('deve retornar 404 ao validar OTP com e-mail nao cadastrado', () => {
    cy.request({
      method: 'POST',
      url: '/auth/validate-otp',
      failOnStatusCode: false,
      body: { email: 'nao.existe@academywallet.test', token: '0000' },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // CT-API-AUTH-09 - change-password sem token de recuperacao
  it('deve retornar 401 ao trocar a senha sem token de recuperacao', () => {
    cy.request({
      method: 'PATCH',
      url: '/auth/change-password',
      failOnStatusCode: false,
      body: { newPassword: 'NovaSenha@123' },
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-AUTH-10 - regressao: token de recuperacao reutilizavel dentro da janela 
  it('regressao: o token de recuperacao pode ser reutilizado para trocar a senha mais de uma vez', () => {
    cy.request({
      method: 'POST',
      url: '/auth/request-otp',
      body: { email: testUser.email },
      failOnStatusCode: false,
    });

    cy.recoverTokenByEmail(testUser.email).then((otpToken) => {
      cy.request({
        method: 'POST',
        url: '/auth/validate-otp',
        body: { email: testUser.email, token: otpToken },
      }).then((validateResponse) => {
        const recoverPasswordToken = validateResponse.body.data.recoverPasswordToken;

        cy.request({
          method: 'PATCH',
          url: '/auth/change-password',
          headers: { Authorization: `Bearer ${recoverPasswordToken}` },
          body: { newPassword: 'PrimeiraTroca@123' },
        }).then((firstChange) => {
          expect(firstChange.status).to.eq(200);
        });

        cy.request({
          method: 'PATCH',
          url: '/auth/change-password',
          headers: { Authorization: `Bearer ${recoverPasswordToken}` },
          body: { newPassword: 'SegundaTroca@456' },
        }).then((secondChange) => {
          expect(secondChange.status).to.eq(200);
        });
      });
    });
  });

  // CT-API-AUTH-11 - LoginDto.password: abaixo do minimo (4 caracteres)
  it('deve retornar 422 quando a senha de login tem menos de 5 caracteres', () => {
    cy.request({
      method: 'POST',
      url: '/auth/login',
      failOnStatusCode: false,
      body: { email: testUser.email, password: 'Ab1@' },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  // CT-API-AUTH-12 - LoginDto.password: acima do maximo (51 caracteres)
  it('deve retornar 422 quando a senha de login tem mais de 50 caracteres', () => {
    cy.request({
      method: 'POST',
      url: '/auth/login',
      failOnStatusCode: false,
      body: { email: testUser.email, password: `${'a'.repeat(50)}1` },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  // CT-API-AUTH-13 - VerifyEmailTokenDto.token: menos de 4 digitos
  it('deve retornar 422 ao validar OTP com token de 3 digitos', () => {
    cy.request({
      method: 'POST',
      url: '/auth/validate-otp',
      failOnStatusCode: false,
      body: { email: testUser.email, token: '123' },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  // CT-API-AUTH-14 - VerifyEmailTokenDto.token: contem letras
  it('deve retornar 422 ao validar OTP com token contendo letras', () => {
    cy.request({
      method: 'POST',
      url: '/auth/validate-otp',
      failOnStatusCode: false,
      body: { email: testUser.email, token: 'ab12' },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  // CT-API-AUTH-15 - VerifyEmailTokenDto.token: mais de 4 digitos
  it('deve retornar 422 ao validar OTP com token de 5 digitos', () => {
    cy.request({
      method: 'POST',
      url: '/auth/validate-otp',
      failOnStatusCode: false,
      body: { email: testUser.email, token: '12345' },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });
});
