describe('API - Investment', () => {
  let session;
  let marketShareId;

  before(() => {
    cy.seedMarketShares();
  });

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
    });

    // ARX Denial FIC FIRF CP - minDeposit 100.00, redemption D+0 (disponivel no mesmo dia)
    cy.request('GET', '/market-share/search?query=ARX').then((response) => {
      marketShareId = response.body.data.find((item) => item.name.includes('Denial')).id;
    });
  });

  function encryptSessionPin(pin = session.user.pin) {
    return cy.encryptTransactionPin(session.token, pin);
  }

  function makeInvestment(initialValue, transactionsPassword) {
    return cy.request({
      method: 'POST',
      url: '/investment',
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${session.token}` },
      body: {
        initialValue,
        walletId: session.walletId,
        marketShareId,
        transactionsPassword,
      },
    });
  }

  function withdraw(amount, transactionsPassword) {
    return cy.request({
      method: 'POST',
      url: '/investment/withdraw',
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${session.token}` },
      body: {
        walletId: session.walletId,
        marketShareId,
        amount,
        transactionsPassword,
      },
    });
  }

  // CT-API-INV-01 - Investimento com sucesso
  it('deve criar um investimento com sucesso (201)', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.match(/sucesso/i);
      });
    });
  });

  // CT-API-INV-01b - Sem token
  it('deve retornar 401 ao criar investimento sem token', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((encryptedPin) => {
      cy.request({
        method: 'POST',
        url: '/investment',
        failOnStatusCode: false,
        body: { initialValue: 200, walletId: session.walletId, marketShareId, transactionsPassword: encryptedPin },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  // CT-API-INV-02 - Valor acima do saldo disponivel
  it('deve rejeitar um investimento com valor acima do saldo disponivel (400)', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(999999999, encryptedPin).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.match(/saldo insuficiente/i);
      });
    });
  });

  // CT-API-INV-02b - Fundo (marketShareId) inexistente
  it('deve retornar 404 ao investir em um fundo inexistente', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.request({
        method: 'POST',
        url: '/investment',
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${session.token}` },
        body: {
          initialValue: 200,
          walletId: session.walletId,
          marketShareId: '11111111-1111-4111-8111-111111111111',
          transactionsPassword: encryptedPin,
        },
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.message).to.match(/fundo n[ãa]o encontrado/i);
      });
    });
  });

  // CT-API-INV-03 - Resgate parcial com sucesso
  it('deve resgatar parcialmente um investimento com sucesso', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        encryptSessionPin().then((withdrawPin) => {
          withdraw(50, withdrawPin).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            expect(response.body.message).to.match(/resgate.*sucesso/i);
          });
        });
      });
    });
  });

  // CT-API-INV-04 - Resgate com PIN incorreto
  it('deve rejeitar o resgate quando o PIN transacional esta incorreto (401)', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        cy.encryptTransactionPin(session.token, '000000').then((wrongPin) => {
          withdraw(50, wrongPin).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body.message).to.match(/senha transacional incorreta/i);
          });
        });
      });
    });
  });

  // CT-API-INV-04b - Sem token
  it('deve retornar 401 ao resgatar investimento sem token', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        cy.request({
          method: 'POST',
          url: '/investment/withdraw',
          failOnStatusCode: false,
          body: { walletId: session.walletId, marketShareId, amount: 50, transactionsPassword: encryptedPin },
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  });

  // CT-API-INV-05 - Resumo reflete o total investido apos um aporte
  it('deve refletir o total investido no resumo apos um aporte', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        // GET /investment/summary/:walletId nao tem @UseGuards (investment.controller.ts) -
        // endpoint publico. Enviado sem Authorization de proposito (potencial gap de
        // seguranca, fora do escopo desta suite).
        cy.request('GET', `/investment/summary/${session.walletId}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.totalInvested).to.eq(200);
          expect(response.body.data.totalAvailableForRedemption).to.eq(200);
        });
      });
    });
  });

  // CT-API-INV-06 - Investimento aparece na lista de investimentos da carteira
  it('deve listar o investimento recem-criado em wallet-investments', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        // Mesmo caso de GET /investment/summary: endpoint sem guard no controller.
        cy.request('GET', `/investment/wallet-investments/${session.walletId}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data).to.have.length(1);
          expect(response.body.data[0].totalInvested).to.eq(200);
          expect(response.body.data[0].marketShares).to.have.property('id', marketShareId);
        });
      });
    });
  });

  // CT-API-INV-07 - initialValue com mais de 2 casas decimais
  it('deve retornar 422 quando initialValue tem mais de 2 casas decimais', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(100.123, encryptedPin).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  // CT-API-INV-08 - initialValue igual a zero (viola @Min(0.01))
  it('deve retornar 422 quando initialValue e igual a zero', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(0, encryptedPin).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  // CT-API-INV-09 - initialValue negativo
  it('deve retornar 422 quando initialValue e negativo', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(-100, encryptedPin).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  // CT-API-INV-10 - withdraw amount abaixo do minimo (@Min(1))
  it('deve retornar 422 quando o valor de resgate e menor que 1', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        encryptSessionPin().then((withdrawPin) => {
          withdraw(0.5, withdrawPin).then((response) => {
            expect(response.status).to.eq(422);
          });
        });
      });
    });
  });

  // CT-API-INV-11 - withdraw amount com mais de 2 casas decimais
  it('deve retornar 422 quando o valor de resgate tem mais de 2 casas decimais', () => {
    encryptSessionPin().then((encryptedPin) => {
      makeInvestment(200, encryptedPin).then(() => {
        encryptSessionPin().then((withdrawPin) => {
          withdraw(10.123, withdrawPin).then((response) => {
            expect(response.status).to.eq(422);
          });
        });
      });
    });
  });
});
