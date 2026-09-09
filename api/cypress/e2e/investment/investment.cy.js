const SECOND_USER = {
  email: 'qa.seed.user.b.inv@academywallet.test',
  cpf: '52998224726',
  rg: '112233446',
};

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

    cy.apiMarketShareSearch('ARX').then((response) => {
      marketShareId = response.body.data.find((item) => item.name.includes('Denial')).id;
    });
  });

  function encryptSessionPin(pin = session.user.pin) {
    return cy.encryptTransactionPin(session.token, pin);
  }

  // CT-API-INV-01 - Investimento com sucesso
  it('deve criar um investimento com sucesso', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.match(/sucesso/i);
      });
    });
  });

  // CT-API-INV-02 - Sem token
  it('deve retornar 401 ao criar investimento sem token', () => {
    cy.encryptTransactionPin(session.token, session.user.pin).then((encryptedPin) => {
      cy.apiInvestmentInvest({
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  // CT-API-INV-03 - Valor acima do saldo disponivel
  it('deve rejeitar um investimento com valor acima do saldo disponível', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 999999999,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.match(/saldo insuficiente/i);
      });
    });
  });

  // CT-API-INV-04 - Fundo (marketShareId) inexistente
  it('deve retornar 404 ao investir em um fundo inexistente', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId: '11111111-1111-4111-8111-111111111111',
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.message).to.match(/fundo n[ãa]o encontrado/i);
      });
    });
  });

  // CT-API-INV-05 - Resgate parcial com sucesso
  it('deve resgatar parcialmente um investimento com sucesso', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        encryptSessionPin().then((withdrawPin) => {
          cy.apiInvestmentWithdraw({
            token: session.token,
            walletId: session.walletId,
            marketShareId,
            amount: 50,
            transactionsPassword: withdrawPin,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            expect(response.body.message).to.match(/resgate.*sucesso/i);
          });
        });
      });
    });
  });

  // CT-API-INV-06 - Resgate com PIN incorreto
  it('deve rejeitar o resgate quando o PIN transacional está incorreto', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        cy.encryptTransactionPin(session.token, '000000').then((wrongPin) => {
          cy.apiInvestmentWithdraw({
            token: session.token,
            walletId: session.walletId,
            marketShareId,
            amount: 50,
            transactionsPassword: wrongPin,
          }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body.message).to.match(/senha transacional incorreta/i);
          });
        });
      });
    });
  });

  // CT-API-INV-07 - Sem token
  it('deve retornar 401 ao resgatar investimento sem token', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        cy.apiInvestmentWithdraw({
          walletId: session.walletId,
          marketShareId,
          amount: 50,
          transactionsPassword: encryptedPin,
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  });

  // CT-API-INV-08 - Resumo reflete o total investido apos um aporte
  it('deve refletir o total investido no resumo após um aporte', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        cy.apiInvestmentGetSummary(session.walletId).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.totalInvested).to.eq(200);
          expect(response.body.data.totalAvailableForRedemption).to.eq(200);
        });
      });
    });
  });

  // CT-API-INV-09 - Investimento aparece na lista de investimentos da carteira
  it('deve listar o investimento recém-criado em wallet-investments', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        cy.apiInvestmentGetWalletInvestments(session.walletId).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data).to.have.length(1);
          expect(response.body.data[0].totalInvested).to.eq(200);
          expect(response.body.data[0].marketShares).to.have.property('id', marketShareId);
        });
      });
    });
  });

  // CT-API-INV-10 - initialValue com mais de 2 casas decimais
  it('deve retornar 422 quando initialValue tem mais de 2 casas decimais', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 100.123,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.some((e) => e.field === 'initialValue')).to.be.true;
      });
    });
  });

  // CT-API-INV-11 - initialValue igual a zero (viola @Min(0.01))
  it('deve retornar 422 quando initialValue é igual a zero', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 0,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.some((e) => e.field === 'initialValue')).to.be.true;
      });
    });
  });

  // CT-API-INV-12 - initialValue negativo
  it('deve retornar 422 quando initialValue é negativo', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: -100,
        transactionsPassword: encryptedPin,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.some((e) => e.field === 'initialValue')).to.be.true;
      });
    });
  });

  // CT-API-INV-13 - withdraw amount abaixo do minimo (@Min(1))
  it('deve retornar 422 quando o valor de resgate é menor que 1', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        encryptSessionPin().then((withdrawPin) => {
          cy.apiInvestmentWithdraw({
            token: session.token,
            walletId: session.walletId,
            marketShareId,
            amount: 0.5,
            transactionsPassword: withdrawPin,
          }).then((response) => {
            expect(response.status).to.eq(422);
            expect(response.body.errors.some((e) => e.field === 'amount')).to.be.true;
          });
        });
      });
    });
  });

  // CT-API-INV-14 - withdraw amount com mais de 2 casas decimais
  it('deve retornar 422 quando o valor de resgate tem mais de 2 casas decimais', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 200,
        transactionsPassword: encryptedPin,
      }).then(() => {
        encryptSessionPin().then((withdrawPin) => {
          cy.apiInvestmentWithdraw({
            token: session.token,
            walletId: session.walletId,
            marketShareId,
            amount: 10.123,
            transactionsPassword: withdrawPin,
          }).then((response) => {
            expect(response.status).to.eq(422);
            expect(response.body.errors.some((e) => e.field === 'amount')).to.be.true;
          });
        });
      });
    });
  });

  // CT-API-INV-15 - skip: aguardando confirmacao do BUG-33 (nao reproduzido na ultima verificacao)
  it.skip('não deve permitir que o resgate exceda o valor disponível quando há mais de um aporte no mesmo fundo', () => {
    const firstDeposit = 5;
    const secondDeposit = 5;
    const withdrawAmount = firstDeposit + secondDeposit + 10;

    cy.apiMarketShareSearch('Ibiuna').then((shareResponse) => {
      const lowMinDepositShareId = shareResponse.body.data[0].id;

      encryptSessionPin().then((firstPin) => {
        cy.apiInvestmentInvest({
          token: session.token,
          walletId: session.walletId,
          marketShareId: lowMinDepositShareId,
          initialValue: firstDeposit,
          transactionsPassword: firstPin,
        }).then(() => {
          encryptSessionPin().then((secondPin) => {
            cy.apiInvestmentInvest({
              token: session.token,
              walletId: session.walletId,
              marketShareId: lowMinDepositShareId,
              initialValue: secondDeposit,
              transactionsPassword: secondPin,
            }).then(() => {
              cy.currentAccountByWalletId(session.walletId).then((accountBefore) => {
                encryptSessionPin().then((withdrawPin) => {
                  cy.apiInvestmentWithdraw({
                    token: session.token,
                    walletId: session.walletId,
                    marketShareId: lowMinDepositShareId,
                    amount: withdrawAmount,
                    transactionsPassword: withdrawPin,
                  }).then((response) => {
                    expect(response.status).to.eq(400);

                    cy.currentAccountByWalletId(session.walletId).then((accountAfter) => {
                      expect(Number(accountAfter.balance)).to.eq(Number(accountBefore.balance));
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  // CT-API-INV-16 - skip: aguardando correcao do BUG-29 (resumo de investimentos responde com dados reais sem token)
  it.skip('não deve retornar o resumo de investimentos sem token de autenticação', () => {
    cy.apiInvestmentGetSummary(session.walletId).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-INV-17 - skip: aguardando correcao do BUG-29 (listagem de investimentos responde com dados reais sem token)
  it.skip('não deve listar os investimentos de uma carteira sem token de autenticação', () => {
    encryptSessionPin().then((encryptedPin) => {
      cy.apiInvestmentInvest({
        token: session.token,
        walletId: session.walletId,
        marketShareId,
        initialValue: 100,
        transactionsPassword: encryptedPin,
      }).then(() => {
        cy.apiInvestmentGetWalletInvestments(session.walletId).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  });

  // CT-API-INV-18 - skip: aguardando correcao do BUG-29 (investir aceita a carteira de outro usuario)
  it.skip('não deve permitir que um investimento debite a conta corrente de outro usuário', () => {
    cy.seedTestUser(SECOND_USER).then((victim) => {
      cy.currentAccountByWalletId(victim.walletId).then((victimBefore) => {
        encryptSessionPin().then((encryptedPin) => {
          cy.apiInvestmentInvest({
            token: session.token,
            walletId: victim.walletId,
            marketShareId,
            initialValue: 100,
            transactionsPassword: encryptedPin,
          }).then((response) => {
            expect(response.status).to.eq(401);

            cy.currentAccountByWalletId(victim.walletId).then((victimAfter) => {
              expect(Number(victimAfter.balance)).to.eq(Number(victimBefore.balance));
            });
          });
        });
      });

      cy.cleanTestUser(SECOND_USER.email);
    });
  });
});
