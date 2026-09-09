import {
  buildValidPayload,
  generateOversizedName,
  generateSingleWordName,
  generateNameWithDigits,
  generateNameWithSymbols,
  generateRgOfLength,
  generateRgWithInvalidChar,
  generateStrongPassword,
  generatePasswordWithoutUppercase,
  generatePasswordWithoutLowercase,
  generatePasswordWithoutDigit,
  generatePasswordWithoutSpecialChar,
  generateNumericTransactionPassword,
  generateAlphaTransactionPassword,
} from '../../support/utils/userPayload';

describe('API - User / Cadastro', () => {
  after(() => {
    cy.cleanTestUsersByPrefix('qa.api.user.');
  });

  // CT-API-USER-01 - Cadastro completo com sucesso
  it('deve cadastrar um usuário completo com sucesso', () => {
    const payload = buildValidPayload();

    cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data).to.have.property('id');
      expect(response.body.data).to.have.property('email', payload.email);
    });
  });

  // CT-API-USER-02 - E-mail duplicado
  it('deve retornar 409 ao cadastrar com um e-mail já existente', () => {
    cy.seedTestUser().then((seededUser) => {
      const payload = buildValidPayload({ email: seededUser.email });

      cy.apiUserCreate(payload).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body.message).to.match(/e-mail.*cadastrado/i);
      });
    });
  });

  // CT-API-USER-03 - CPF duplicado
  it('deve retornar 409 ao cadastrar com um CPF já existente', () => {
    cy.seedTestUser().then((seededUser) => {
      const payload = buildValidPayload({ cpf: seededUser.cpf });

      cy.apiUserCreate(payload).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body.message).to.match(/cpf.*cadastrado/i);
      });
    });
  });

  // CT-API-USER-04 - Contrato: campo obrigatorio faltando
  it('deve retornar 422 quando um campo obrigatório (rg) não é informado', () => {
    const payload = buildValidPayload();
    delete payload.rg;

    cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors).to.be.an('array');
      expect(response.body.errors.some((e) => e.field === 'rg')).to.be.true;
    });
  });

  // CT-API-USER-05 - GET /user autenticado
  it('deve retornar os dados do usuário autenticado', () => {
    cy.apiLoginAsSeedUser().then((session) => {
      cy.apiUserGetMe(session.token).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.email).to.eq(session.user.email);
        expect(response.body.data.cpf).to.eq(session.user.cpf);
        expect(response.body.data.wallet).to.have.property('id', session.walletId);
      });
    });
  });

  // CT-API-USER-06 - GET /user sem token
  it('deve retornar 401 ao buscar usuário sem token de autenticação', () => {
    cy.apiUserGetMe().then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-USER-07 - first-access: fluxo positivo
  it('deve marcar o primeiro acesso como concluido (firstAccess true -> false)', () => {
    const payload = buildValidPayload();

    cy.apiUserCreate(payload).then((createResponse) => {
      const userId = createResponse.body.data.id;

      cy.apiLogin(payload.email, payload.loginPassword).then(({ token }) => {
        cy.apiUserMarkFirstAccess(userId, token).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.apiUserGetMe(token).then((response) => {
          expect(response.body.data.firstAccess).to.eq(false);
        });
      });
    });
  });

  // CT-API-USER-08 - skip: aguardando correcao do BUG-25 (segunda chamada a first-access desfaz a marcacao em vez de manter concluido)
  it.skip('não deve desfazer a marcação de primeiro acesso quando o endpoint é chamado uma segunda vez', () => {
    const payload = buildValidPayload();

    cy.apiUserCreate(payload).then((createResponse) => {
      const userId = createResponse.body.data.id;

      cy.apiLogin(payload.email, payload.loginPassword).then(({ token }) => {
        cy.apiUserMarkFirstAccess(userId, token);

        cy.apiUserMarkFirstAccess(userId, token).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.apiUserGetMe(token).then((response) => {
          expect(response.body.data.firstAccess).to.eq(false);
        });
      });
    });
  });

  // CT-API-USER-09 - first-access sem token
  it('deve retornar 401 ao marcar first-access sem token', () => {
    cy.apiUserMarkFirstAccess('00000000-0000-4000-8000-000000000000').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-USER-10 - first-access de outro usuario
  it('deve retornar 401 ao tentar marcar o first-access de outro usuário', () => {
    cy.apiLoginAsSeedUser().then((session) => {
      cy.apiUserMarkFirstAccess('00000000-0000-4000-8000-000000000000', session.token).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.match(/não tem permissão/i);
      });
    });
  });

  function expectFieldRejected(overrides, field) {
    const payload = buildValidPayload(overrides);

    return cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === field)).to.be.true;
    });
  }

  // CT-API-USER-11 - name: uma unica palavra (sem espaco)
  it('deve retornar 422 quando o nome tem apenas uma palavra', () => {
    expectFieldRejected({ name: generateSingleWordName() }, 'name');
  });

  // CT-API-USER-12 - name: contem digitos
  it('deve retornar 422 quando o nome contém dígitos', () => {
    expectFieldRejected({ name: generateNameWithDigits() }, 'name');
  });

  // CT-API-USER-13 - name: contem simbolos
  it('deve retornar 422 quando o nome contém símbolos', () => {
    expectFieldRejected({ name: generateNameWithSymbols() }, 'name');
  });

  // CT-API-USER-14 - name: acima de 150 caracteres
  it('deve retornar 422 quando o nome tem mais de 150 caracteres', () => {
    expectFieldRejected({ name: generateOversizedName() }, 'name');
  });

  // CT-API-USER-15 - rg: exatamente 10 caracteres
  it('deve cadastrar com rg de exatamente 10 caracteres alfanuméricos', () => {
    const payload = buildValidPayload({ rg: generateRgOfLength(10) });

    cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-16 - rg: exatamente 7 caracteres
  it('deve cadastrar com rg de exatamente 7 caracteres', () => {
    const payload = buildValidPayload({ rg: generateRgOfLength(7) });

    cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-17 - skip: aguardando correcao do BUG-26 (rg de 11 a 14 caracteres e rejeitado, contrariando o contrato)
  it.skip('não deve rejeitar um RG de 11 caracteres, já que o contrato documenta suporte a até 14 (BUG-26)', () => {
    const payload = buildValidPayload({ rg: generateRgOfLength(11) });

    cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-18 - rg: caractere nao alfanumerico
  it('deve retornar 422 quando o rg contém caractere não alfanumérico', () => {
    expectFieldRejected({ rg: generateRgWithInvalidChar() }, 'rg');
  });

  // CT-API-USER-19 - loginPassword: sem letra maiuscula
  it('deve retornar 422 quando a senha não tem letra maiúscula', () => {
    expectFieldRejected({ loginPassword: generatePasswordWithoutUppercase() }, 'loginPassword');
  });

  // CT-API-USER-20 - loginPassword: sem letra minuscula
  it('deve retornar 422 quando a senha não tem letra minúscula', () => {
    expectFieldRejected({ loginPassword: generatePasswordWithoutLowercase() }, 'loginPassword');
  });

  // CT-API-USER-21 - loginPassword: sem digito
  it('deve retornar 422 quando a senha não tem dígito', () => {
    expectFieldRejected({ loginPassword: generatePasswordWithoutDigit() }, 'loginPassword');
  });

  // CT-API-USER-22 - loginPassword: sem caractere especial
  it('deve retornar 422 quando a senha não tem caractere especial', () => {
    expectFieldRejected({ loginPassword: generatePasswordWithoutSpecialChar() }, 'loginPassword');
  });

  // CT-API-USER-23 - loginPassword: abaixo do minimo
  it('deve retornar 422 quando a senha tem menos de 8 caracteres', () => {
    expectFieldRejected({ loginPassword: generateStrongPassword(7) }, 'loginPassword');
  });

  // CT-API-USER-24 - loginPassword: exatamente 8 caracteres
  it('deve cadastrar com loginPassword de exatamente 8 caracteres', () => {
    const payload = buildValidPayload({ loginPassword: generateStrongPassword(8) });

    cy.apiUserCreate(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-25 - transactionsPassword: 5 digitos
  it('deve retornar 422 quando a senha de transações tem 5 dígitos', () => {
    expectFieldRejected({ transactionsPassword: generateNumericTransactionPassword(5) }, 'transactionsPassword');
  });

  // CT-API-USER-26 - transactionsPassword: 7 digitos
  it('deve retornar 422 quando a senha de transações tem 7 dígitos', () => {
    expectFieldRejected({ transactionsPassword: generateNumericTransactionPassword(7) }, 'transactionsPassword');
  });

  // CT-API-USER-27 - transactionsPassword: contem letras
  it('deve retornar 422 quando a senha de transações contém letras', () => {
    expectFieldRejected({ transactionsPassword: generateAlphaTransactionPassword() }, 'transactionsPassword');
  });

  // CT-API-USER-28 - skip: aguardando correcao do BUG-30 (RG nao e validado como unico)
  it.skip('não deve permitir o cadastro de dois usuários com o mesmo RG', () => {
    cy.seedTestUser().then((seededUser) => {
      const payload = buildValidPayload({ rg: seededUser.rg });

      cy.apiUserCreate(payload).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body.message).to.match(/rg.*cadastrado/i);
      });
    });
  });
});
