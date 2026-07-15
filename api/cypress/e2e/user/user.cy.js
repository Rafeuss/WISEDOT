/**
 * Gera um CPF valido (mesmo algoritmo de digito verificador usado pelo backend
 * em `backend/src/user/decorators/cpf-validator.ts`), unico o suficiente para
 * nao colidir entre execucoes (baseado em digitos aleatorios).
 */
function generateValidCpf() {
  const randomDigits = () => Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  const calcDigit = (nums) => {
    let sum = 0;
    let factor = nums.length + 1;
    for (const n of nums) {
      sum += n * factor;
      factor--;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 || rest === 11 ? 0 : rest;
  };

  const base = randomDigits();
  const d1 = calcDigit(base);
  const d2 = calcDigit([...base, d1]);
  return [...base, d1, d2].join('');
}

function uniqueSuffix() {
  return `${Date.now()}${Cypress._.uniqueId()}`;
}

function buildNewUserPayload(overrides = {}) {
  return {
    name: 'Usuario Teste API',
    email: `qa.api.user.${uniqueSuffix()}@academywallet.test`,
    loginPassword: 'Senha@Forte123',
    cpf: generateValidCpf(),
    rg: '12345678',
    transactionsPassword: '123456',
    ...overrides,
  };
}

function createUser(payload) {
  return cy.request({
    method: 'POST',
    url: '/user',
    failOnStatusCode: false,
    body: payload,
  });
}

describe('API - User / Cadastro', () => {
  // CT-API-USER-01 - Cadastro completo com sucesso
  it('deve cadastrar um usuario completo com sucesso (201)', () => {
    const payload = buildNewUserPayload();

    createUser(payload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data).to.have.property('id');
      expect(response.body.data).to.have.property('email', payload.email);
    });
  });

  // CT-API-USER-02 - E-mail duplicado
  it('deve retornar 409 ao cadastrar com um e-mail ja existente', () => {
    cy.seedTestUser().then((seededUser) => {
      const payload = buildNewUserPayload({ email: seededUser.email });

      createUser(payload).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body.message).to.match(/e-mail.*cadastrado/i);
      });
    });
  });

  // CT-API-USER-03 - CPF duplicado
  it('deve retornar 409 ao cadastrar com um CPF ja existente', () => {
    cy.seedTestUser().then((seededUser) => {
      const payload = buildNewUserPayload({ cpf: seededUser.cpf });

      createUser(payload).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body.message).to.match(/cpf.*cadastrado/i);
      });
    });
  });

  // CT-API-USER-04 - Contrato: campo obrigatorio faltando
  it('deve retornar 422 quando um campo obrigatorio (rg) nao e informado', () => {
    const payload = buildNewUserPayload();
    delete payload.rg;

    createUser(payload).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors).to.be.an('array');
      expect(response.body.errors.some((e) => e.field === 'rg')).to.be.true;
    });
  });

  // CT-API-USER-05 - GET /user autenticado
  it('deve retornar os dados do usuario autenticado', () => {
    cy.apiLoginAsSeedUser().then((session) => {
      cy.request({
        method: 'GET',
        url: '/user',
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.email).to.eq(session.user.email);
        expect(response.body.data.cpf).to.eq(session.user.cpf);
        expect(response.body.data.wallet).to.have.property('id', session.walletId);
      });
    });
  });

  // CT-API-USER-06 - GET /user sem token
  it('deve retornar 401 ao buscar usuario sem token de autenticacao', () => {
    cy.request({
      method: 'GET',
      url: '/user',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-USER-07 - first-access: fluxo positivo 
  it('deve marcar o primeiro acesso como concluido (firstAccess true -> false)', () => {
    const payload = buildNewUserPayload();

    createUser(payload).then((createResponse) => {
      const userId = createResponse.body.data.id;

      cy.apiLogin(payload.email, payload.loginPassword).then(({ token }) => {
        cy.request({
          method: 'PATCH',
          url: `/user/${userId}/first-access`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.request({
          method: 'GET',
          url: '/user',
          headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
          expect(response.body.data.firstAccess).to.eq(false);
        });
      });
    });
  });

  // CT-API-USER-08 - regressao: chamar first-access duas vezes desfaz a marcacao 
  it('regressao: uma segunda chamada ao first-access desfaz a marcacao (nao e idempotente)', () => {
    const payload = buildNewUserPayload();

    createUser(payload).then((createResponse) => {
      const userId = createResponse.body.data.id;

      cy.apiLogin(payload.email, payload.loginPassword).then(({ token }) => {
        cy.request({
          method: 'PATCH',
          url: `/user/${userId}/first-access`,
          headers: { Authorization: `Bearer ${token}` },
        });

        cy.request({
          method: 'PATCH',
          url: `/user/${userId}/first-access`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.request({
          method: 'GET',
          url: '/user',
          headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
          expect(response.body.data.firstAccess).to.eq(true);
        });
      });
    });
  });

  // CT-API-USER-09 - first-access sem token
  it('deve retornar 401 ao marcar first-access sem token', () => {
    cy.request({
      method: 'PATCH',
      url: '/user/00000000-0000-4000-8000-000000000000/first-access',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-USER-10 - first-access de outro usuario 
  it('deve retornar 401 ao tentar marcar o first-access de outro usuario', () => {
    cy.apiLoginAsSeedUser().then((session) => {
      cy.request({
        method: 'PATCH',
        url: `/user/00000000-0000-4000-8000-000000000000/first-access`,
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.match(/não tem permissão/i);
      });
    });
  });

  function expectFieldRejected(overrides, field) {
    const payload = buildNewUserPayload(overrides);

    return createUser(payload).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === field)).to.be.true;
    });
  }

  // CT-API-USER-11 - name: uma unica palavra (sem espaco)
  it('deve retornar 422 quando o nome tem apenas uma palavra', () => {
    expectFieldRejected({ name: 'Silva' }, 'name');
  });

  // CT-API-USER-12 - name: contem digitos 
  it('deve retornar 422 quando o nome contem digitos', () => {
    expectFieldRejected({ name: 'Ana2 Souza3' }, 'name');
  });

  // CT-API-USER-13 - name: contem simbolos
  it('deve retornar 422 quando o nome contem simbolos', () => {
    expectFieldRejected({ name: 'Ana_Souza' }, 'name');
  });

  // CT-API-USER-14 - name: acima de 150 caracteres
  it('deve retornar 422 quando o nome tem mais de 150 caracteres', () => {
    expectFieldRejected({ name: `${'Ana '.repeat(38)}Souza` }, 'name');
  });

  // CT-API-USER-15 - rg: exatamente 10 caracteres 
  it('deve cadastrar com rg de exatamente 10 caracteres alfanumericos', () => {
    const payload = buildNewUserPayload({ rg: 'AB12345678' });

    createUser(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-16 - rg: exatamente 7 caracteres 
  it('deve cadastrar com rg de exatamente 7 caracteres', () => {
    const payload = buildNewUserPayload({ rg: '1234567' });

    createUser(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-17 - rg: 11 caracteres 
  it('regressao BUG-26: rg de 11 caracteres e rejeitado apesar de o contrato documentar ate 14', () => {
    expectFieldRejected({ rg: '12345678901' }, 'rg');
  });

  // CT-API-USER-18 - rg: caractere nao alfanumerico
  it('deve retornar 422 quando o rg contem caractere nao alfanumerico', () => {
    expectFieldRejected({ rg: '1234-567' }, 'rg');
  });

  // CT-API-USER-19 - loginPassword: sem letra maiuscula
  it('deve retornar 422 quando a senha nao tem letra maiuscula', () => {
    expectFieldRejected({ loginPassword: 'senha@123' }, 'loginPassword');
  });

  // CT-API-USER-20 - loginPassword: sem letra minuscula
  it('deve retornar 422 quando a senha nao tem letra minuscula', () => {
    expectFieldRejected({ loginPassword: 'SENHA@123' }, 'loginPassword');
  });

  // CT-API-USER-21 - loginPassword: sem digito
  it('deve retornar 422 quando a senha nao tem digito', () => {
    expectFieldRejected({ loginPassword: 'SenhaForte@' }, 'loginPassword');
  });

  // CT-API-USER-22 - loginPassword: sem caractere especial
  it('deve retornar 422 quando a senha nao tem caractere especial', () => {
    expectFieldRejected({ loginPassword: 'SenhaForte123' }, 'loginPassword');
  });

  // CT-API-USER-23 - loginPassword: abaixo do minimo 
  it('deve retornar 422 quando a senha tem menos de 8 caracteres', () => {
    expectFieldRejected({ loginPassword: 'Sh1@aaa' }, 'loginPassword');
  });

  // CT-API-USER-24 - loginPassword: exatamente 8 caracteres 
  it('deve cadastrar com loginPassword de exatamente 8 caracteres', () => {
    const payload = buildNewUserPayload({ loginPassword: 'Senha@12' });

    createUser(payload).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  // CT-API-USER-25 - transactionsPassword: 5 digitos
  it('deve retornar 422 quando a senha de transacoes tem 5 digitos', () => {
    expectFieldRejected({ transactionsPassword: '12345' }, 'transactionsPassword');
  });

  // CT-API-USER-26 - transactionsPassword: 7 digitos
  it('deve retornar 422 quando a senha de transacoes tem 7 digitos', () => {
    expectFieldRejected({ transactionsPassword: '1234567' }, 'transactionsPassword');
  });

  // CT-API-USER-27 - transactionsPassword: contem letras
  it('deve retornar 422 quando a senha de transacoes contem letras', () => {
    expectFieldRejected({ transactionsPassword: 'abcdef' }, 'transactionsPassword');
  });
});
