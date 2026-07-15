const BARCODE_SUCCESS = '34191751243456787123041234560005199890000015000';

describe('API - Transaction', () => {
  let session;

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;

      cy.encryptTransactionPin(session.token, session.user.pin).then(
        (encryptedPin) => {
          cy.request({
            method: 'POST',
            url: '/paid-slips',
            headers: { Authorization: `Bearer ${session.token}` },
            body: {
              barcode: BARCODE_SUCCESS,
              name: 'Joao Silva',
              transactionPassword: encryptedPin,
              value: 150.75,
              walletId: session.walletId,
            },
          });
        },
      );
    });
  });

  // CT-API-TRA-01 - Lista as transacoes existentes
  it('deve listar as transacoes existentes da carteira', () => {
    cy.request({
      method: 'GET',
      url: `/transaction/all/${session.walletId}`,
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length.at.least(1);

      const [transaction] = response.body.data;
      expect(transaction).to.have.property('tcs_st_description');
      expect(transaction).to.have.property('tcs_db_value');
      expect(transaction).to.have.property('tcs_st_type');
    });
  });

  // CT-API-TRA-01b - Sem token
  it('deve retornar 401 ao listar todas as transacoes sem token', () => {
    cy.request({
      method: 'GET',
      url: `/transaction/all/${session.walletId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-02 - Chave publica RSA valida (formato PEM)
  it('deve retornar uma chave publica RSA valida no formato PEM', () => {
    cy.request({
      method: 'GET',
      url: '/transaction/crypt/key',
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.cryptKey).to.match(/^-----BEGIN PUBLIC KEY-----/);
      expect(response.body.data.cryptKey).to.match(/-----END PUBLIC KEY-----/);
    });
  });

  // CT-API-TRA-03 - Sem token
  it('deve retornar 401 ao buscar a chave de criptografia sem token', () => {
    cy.request({
      method: 'GET',
      url: '/transaction/crypt/key',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-04 - Filtro por periodo de dias
  it('deve filtrar corretamente as movimentacoes por periodo de dias (7 dias)', () => {
    cy.request({
      method: 'GET',
      url: `/transaction/filtro/${session.walletId}/7`,
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length.at.least(1);
      response.body.data.forEach((transaction) => {
        const transactionDate = new Date(transaction.tcs_dt_date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        expect(transactionDate.getTime()).to.be.at.least(sevenDaysAgo.getTime());
      });
    });
  });

  // CT-API-TRA-04b - Sem token
  it('deve retornar 401 ao filtrar movimentacoes por periodo sem token', () => {
    cy.request({
      method: 'GET',
      url: `/transaction/filtro/${session.walletId}/7`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-05 - encrypt_password: fluxo positivo
  it('deve criptografar a senha transacional com uma chave publica valida', () => {
    cy.request({
      method: 'GET',
      url: '/transaction/crypt/key',
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((keyResponse) => {
      cy.request({
        method: 'POST',
        url: '/transaction/encrypt_password',
        body: { publicKey: keyResponse.body.data.cryptKey, password: '123456' },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.data.passwordEncrypted).to.be.a('string');
        expect(response.body.data.passwordEncrypted.length).to.be.greaterThan(0);
      });
    });
  });

  // CT-API-TRA-06 - encrypt_password: sem autenticacao 
  it('deve responder mesmo sem token, pois nao depende de sessao autenticada', () => {
    cy.request({
      method: 'GET',
      url: '/transaction/crypt/key',
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((keyResponse) => {
      cy.request({
        method: 'POST',
        url: '/transaction/encrypt_password',
        body: { publicKey: keyResponse.body.data.cryptKey, password: '123456' },
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });
  });

  // CT-API-TRA-07 - edge: publicKey ausente
  it('edge: retorna 500 nao tratado quando publicKey nao e informada', () => {
    cy.request({
      method: 'POST',
      url: '/transaction/encrypt_password',
      failOnStatusCode: false,
      body: { password: '123456' },
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  // CT-API-TRA-08 - edge: password ausente
  it('edge: retorna 500 nao tratado quando password nao e informado', () => {
    cy.request({
      method: 'GET',
      url: '/transaction/crypt/key',
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((keyResponse) => {
      cy.request({
        method: 'POST',
        url: '/transaction/encrypt_password',
        failOnStatusCode: false,
        body: { publicKey: keyResponse.body.data.cryptKey },
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });
  });

  // CT-API-TRA-09 - edge: publicKey em formato invalido 
  it('edge: retorna 500 nao tratado quando publicKey nao esta em formato PEM valido', () => {
    cy.request({
      method: 'POST',
      url: '/transaction/encrypt_password',
      failOnStatusCode: false,
      body: { publicKey: 'nao-e-uma-chave', password: '123456' },
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  function buildTransactionBody(overrides = {}) {
    return {
      type: 'CREDIT',
      value: 100,
      description: 'Deposito teste',
      name: 'Deposito',
      walletId: session.walletId,
      ...overrides,
    };
  }

  function postTransaction(body) {
    return cy.request({
      method: 'POST',
      url: '/transaction',
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${session.token}` },
      body,
    });
  }

  function getBalance() {
    return cy
      .request({
        method: 'GET',
        url: `/wallet/${session.walletId}`,
        headers: { Authorization: `Bearer ${session.token}` },
      })
      .then((response) => response.body.data.balanceCurrentAccount);
  }

  // CT-API-TRA-10 - fluxo positivo: CREDIT (deposito)
  it('deve criar uma transacao CREDIT com sucesso e aumentar o saldo', () => {
    getBalance().then((balanceBefore) => {
      cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
        postTransaction(buildTransactionBody({ transactionsPassword })).then((response) => {
          expect(response.status).to.eq(201);
        });

        getBalance().then((balanceAfter) => {
          expect(balanceAfter).to.eq(balanceBefore + 100);
        });
      });
    });
  });

  // CT-API-TRA-11 - fluxo positivo: DEBIT dentro do saldo disponivel
  it('deve criar uma transacao DEBIT com sucesso e reduzir o saldo', () => {
    getBalance().then((balanceBefore) => {
      cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
        postTransaction(buildTransactionBody({ type: 'DEBIT', value: 50, transactionsPassword })).then(
          (response) => {
            expect(response.status).to.eq(201);
          },
        );

        getBalance().then((balanceAfter) => {
          expect(balanceAfter).to.eq(balanceBefore - 50);
        });
      });
    });
  });

  // CT-API-TRA-12 - DEBIT acima do saldo disponivel
  it('deve rejeitar uma transacao DEBIT acima do saldo disponivel', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
      postTransaction(
        buildTransactionBody({ type: 'DEBIT', value: 999999, transactionsPassword }),
      ).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.match(/saldo insuficiente/i);
      });
    });
  });

  // CT-API-TRA-13 - Sem token
  it('deve retornar 401 ao criar transacao sem token', () => {
    cy.request({
      method: 'POST',
      url: '/transaction',
      failOnStatusCode: false,
      body: buildTransactionBody({ transactionsPassword: 'qualquer' }),
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-14 - valor zero ou negativo
  it('deve rejeitar transacao com valor zero ou negativo', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
      postTransaction(buildTransactionBody({ value: 0, transactionsPassword })).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.match(/nao pode ser negativa/i);
      });

      postTransaction(buildTransactionBody({ value: -10, transactionsPassword })).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  // CT-API-TRA-15 - Contrato: campo obrigatorio faltando
  it('deve retornar 422 quando o campo type nao e informado', () => {
    const body = buildTransactionBody({ transactionsPassword: 'qualquer' });
    delete body.type;

    postTransaction(body).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'type')).to.be.true;
    });
  });

  // CT-API-TRA-16 - walletId inexistente
  it('deve retornar 404 quando o walletId nao existe', () => {
    postTransaction(
      buildTransactionBody({
        walletId: '11111111-1111-4111-8111-111111111111',
        transactionsPassword: 'qualquer',
      }),
    ).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // CT-API-TRA-17 - PIN incorreto
  it('deve retornar 401 quando a senha transacional esta incorreta', () => {
    cy.encryptTransactionPin(session.token, '000000').then((wrongPassword) => {
      postTransaction(buildTransactionBody({ transactionsPassword: wrongPassword })).then(
        (response) => {
          expect(response.status).to.eq(401);
          expect(response.body.message).to.match(/senha transacional incorreta/i);
        },
      );
    });
  });

  // CT-API-TRA-18 - fluxo positivo: ultimas 5 movimentacoes
  it('deve listar as ultimas movimentacoes da carteira', () => {
    cy.request({
      method: 'GET',
      url: `/transaction/${session.walletId}`,
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length.at.least(1);
      expect(response.body.data.length).to.be.at.most(5);
    });
  });

  // CT-API-TRA-19 - Sem token
  it('deve retornar 401 ao listar as ultimas movimentacoes sem token', () => {
    cy.request({
      method: 'GET',
      url: `/transaction/${session.walletId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
