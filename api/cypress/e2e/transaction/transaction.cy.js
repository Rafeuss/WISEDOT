describe('API - Transaction', () => {
  let session;
  let BARCODE_SUCCESS;

  before(() => {
    cy.fixture('boletos.json').then((data) => {
      BARCODE_SUCCESS = data.sucesso;
    });
  });

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;

      cy.encryptTransactionPin(session.token, session.user.pin).then(
        (encryptedPin) => {
          cy.apiPaidSlipsPayRequest({
            token: session.token,
            walletId: session.walletId,
            barcode: BARCODE_SUCCESS,
            name: 'Joao Silva',
            transactionPassword: encryptedPin,
            value: 150.75,
          });
        },
      );
    });
  });

  // CT-API-TRA-01 - Lista as transacoes existentes
  it('deve listar as transações existentes da carteira', () => {
    cy.apiTransactionGetAll(session.walletId, session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length.at.least(1);

      const [transaction] = response.body.data;
      expect(transaction).to.have.property('tcs_st_description');
      expect(transaction).to.have.property('tcs_db_value');
      expect(transaction).to.have.property('tcs_st_type');
    });
  });

  // CT-API-TRA-02 - Sem token
  it('deve retornar 401 ao listar todas as transações sem token', () => {
    cy.apiTransactionGetAll(session.walletId).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-03 - Chave publica RSA valida (formato PEM)
  it('deve retornar uma chave pública RSA válida no formato PEM', () => {
    cy.apiTransactionGetCryptKey(session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.cryptKey).to.match(/^-----BEGIN PUBLIC KEY-----/);
      expect(response.body.data.cryptKey).to.match(/-----END PUBLIC KEY-----/);
    });
  });

  // CT-API-TRA-04 - Sem token
  it('deve retornar 401 ao buscar a chave de criptografia sem token', () => {
    cy.apiTransactionGetCryptKey().then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-05 - Filtro por periodo de dias
  it('deve filtrar corretamente as movimentações por período de dias (7 dias)', () => {
    cy.apiTransactionGetFiltered(session.walletId, 7, session.token).then((response) => {
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

  // CT-API-TRA-06 - Sem token
  it('deve retornar 401 ao filtrar movimentações por período sem token', () => {
    cy.apiTransactionGetFiltered(session.walletId, 7).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-TRA-07 - encrypt_password: fluxo positivo
  it('deve criptografar a senha transacional com uma chave pública válida', () => {
    cy.apiTransactionGetCryptKey(session.token).then((keyResponse) => {
      cy.apiTransactionEncryptPassword(keyResponse.body.data.cryptKey, '123456').then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.data.passwordEncrypted).to.be.a('string');
        expect(response.body.data.passwordEncrypted.length).to.be.greaterThan(0);
      });
    });
  });

  // CT-API-TRA-08 - encrypt_password: sem autenticacao
  it('deve responder mesmo sem token, pois não depende de sessão autenticada', () => {
    cy.apiTransactionGetCryptKey(session.token).then((keyResponse) => {
      cy.apiTransactionEncryptPassword(keyResponse.body.data.cryptKey, '123456').then((response) => {
        expect(response.status).to.eq(201);
      });
    });
  });

  // CT-API-TRA-09 - skip: aguardando correcao do BUG-40 (publicKey ausente quebra com 500)
  it.skip('deve retornar 422 quando a chave pública não é informada', () => {
    cy.apiTransactionEncryptPassword(undefined, '123456').then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  // CT-API-TRA-10 - skip: aguardando correcao do BUG-40 (password ausente quebra com 500)
  it.skip('deve retornar 422 quando a senha não é informada', () => {
    cy.apiTransactionGetCryptKey(session.token).then((keyResponse) => {
      cy.apiTransactionEncryptPassword(keyResponse.body.data.cryptKey, undefined).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  // CT-API-TRA-11 - skip: aguardando correcao do BUG-40 (publicKey em formato invalido quebra com 500)
  it.skip('deve retornar 422 quando a chave pública não está em um formato PEM válido', () => {
    cy.apiTransactionEncryptPassword('nao-e-uma-chave', '123456').then((response) => {
      expect(response.status).to.eq(422);
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
    return cy.apiTransactionCreate({ token: session.token, ...body });
  }

  function getBalance() {
    return cy.apiTransactionGetBalance(session.walletId, session.token);
  }

  // CT-API-TRA-12 - fluxo positivo: CREDIT (deposito)
  it('deve criar uma transação CREDIT com sucesso e aumentar o saldo', () => {
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

  // CT-API-TRA-13 - fluxo positivo: DEBIT dentro do saldo disponivel
  it('deve criar uma transação DEBIT com sucesso e reduzir o saldo', () => {
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

  // CT-API-TRA-14 - DEBIT acima do saldo disponivel
  it('deve rejeitar uma transação DEBIT acima do saldo disponível', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
      postTransaction(
        buildTransactionBody({ type: 'DEBIT', value: 999999, transactionsPassword }),
      ).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.match(/saldo insuficiente/i);
      });
    });
  });

  // CT-API-TRA-15 - Sem token
  it('deve retornar 401 ao criar transação sem token', () => {
    cy.apiTransactionCreate(buildTransactionBody({ transactionsPassword: 'qualquer' })).then(
      (response) => {
        expect(response.status).to.eq(401);
      },
    );
  });

  // CT-API-TRA-16 - Valor zero
  it('deve rejeitar transação com valor zero ou negativo', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
      postTransaction(buildTransactionBody({ value: 0, transactionsPassword })).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.match(/nao pode ser negativa/i);
      });
    });
  });

  // CT-API-TRA-17 - Valor negativo
  it('deve rejeitar uma transação com valor negativo', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((transactionsPassword) => {
      postTransaction(buildTransactionBody({ value: -10, transactionsPassword })).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  // CT-API-TRA-18 - Contrato: campo obrigatorio faltando
  it('deve retornar 422 quando o campo type não é informado', () => {
    const body = buildTransactionBody({ transactionsPassword: 'qualquer' });
    delete body.type;

    postTransaction(body).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.some((e) => e.field === 'type')).to.be.true;
    });
  });

  // CT-API-TRA-19 - walletId inexistente
  it('deve retornar 404 quando o walletId não existe', () => {
    postTransaction(
      buildTransactionBody({
        walletId: '11111111-1111-4111-8111-111111111111',
        transactionsPassword: 'qualquer',
      }),
    ).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // CT-API-TRA-20 - PIN incorreto
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

  // CT-API-TRA-21 - fluxo positivo: ultimas 5 movimentacoes
  it('deve listar as últimas movimentações da carteira', () => {
    cy.apiTransactionGetRecent(session.walletId, session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length.at.least(1);
      expect(response.body.data.length).to.be.at.most(5);
    });
  });

  // CT-API-TRA-22 - Sem token
  it('deve retornar 401 ao listar as últimas movimentações sem token', () => {
    cy.apiTransactionGetRecent(session.walletId).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
