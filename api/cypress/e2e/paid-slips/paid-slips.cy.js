const SECOND_USER = {
  email: 'qa.seed.user.b.pag@academywallet.test',
  cpf: '52998224727',
  rg: '112233447',
};

describe('API - Paid Slips (pagamento de boleto)', () => {
  let session;
  let BARCODES;

  before(() => {
    cy.fixture('boletos.json').then((data) => {
      BARCODES = data;
    });
  });

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
    });
  });

  // CT-API-PAG-01 - Pagamento com sucesso
  it('deve pagar um boleto válido com sucesso', () => {
    cy.apiPaidSlipsPay(session, BARCODES.sucesso).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  // CT-API-PAG-02 - Boleto ja pago
  it('deve rejeitar boleto já pago', () => {
    cy.apiPaidSlipsPay(session, BARCODES.jaPago).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.message).to.match(/ja esta pago/i);
    });
  });

  // CT-API-PAG-03 - Boleto expirado
  it('deve rejeitar boleto expirado', () => {
    cy.apiPaidSlipsPay(session, BARCODES.expirado).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.message).to.match(/expirado/i);
    });
  });

  // CT-API-PAG-04 - Saldo insuficiente
  it('deve rejeitar pagamento com saldo insuficiente', () => {
    cy.apiPaidSlipsPay(session, BARCODES.saldoInsuficiente).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.match(/saldo insuficiente/i);
    });
  });

  // CT-API-PAG-05 - Boleto nao encontrado
  it('deve retornar erro para código de barras não encontrado', () => {
    cy.apiPaidSlipsPay(session, BARCODES.naoEncontrado).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
    });
  });

  // CT-API-PAG-06 - Boleto agendado/pendente
  it('deve aceitar boleto agendado/pendente', () => {
    cy.apiPaidSlipsPay(session, BARCODES.agendado).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  // CT-API-PAG-07 - Codigo de barras invalido
  it('deve rejeitar código de barras com tamanho inválido', () => {
    cy.apiPaidSlipsPay(session, '123456789').then((response) => {
      expect(response.status).to.eq(409);
    });
  });

  // CT-API-PAG-08 - PIN incorreto
  it('deve rejeitar pagamento quando o PIN transacional esta incorreto', () => {
    cy.encryptTransactionPin(session.token, '000000').then((encryptedPin) => {
      cy.apiPaidSlipsPayRequest({
        token: session.token,
        walletId: session.walletId,
        barcode: BARCODES.sucesso,
        name: 'Joao Silva',
        transactionPassword: encryptedPin,
        value: 150.75,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.match(/senha transacional incorreta/i);
      });
    });
  });

  // CT-API-PAG-09 - Consulta de boleto por codigo de barras (GET)
  it('deve consultar os dados de um boleto válido pelo código de barras', () => {
    cy.apiPaidSlipsGetByCode(BARCODES.sucesso, session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('valueToPay');
    });
  });

  // CT-API-PAG-10 - Sem token
  it('deve retornar 401 ao consultar um boleto sem token', () => {
    cy.apiPaidSlipsGetByCode(BARCODES.sucesso).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-PAG-11 - GET /pendent: lista vazia para usuario sem boletos pendentes
  it('deve retornar lista vazia de boletos pendentes para um usuário sem pendências', () => {
    cy.apiPaidSlipsGetPending(session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length(0);
    });
  });

  // CT-API-PAG-12 - GET /pendent: fluxo positivo, boleto agendado aparece na lista
  it('deve listar um boleto agendado/pendente após o pagamento', () => {
    cy.apiPaidSlipsPay(session, BARCODES.agendado).then((payResponse) => {
      expect(payResponse.status).to.be.oneOf([200, 201]);

      cy.apiPaidSlipsGetPending(session.token).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.length(1);
        expect(response.body.data[0]).to.have.property('barcode', BARCODES.agendado);
      });
    });
  });

  // CT-API-PAG-13 - GET /pendent sem token
  it('deve retornar 401 ao listar boletos pendentes sem token', () => {
    cy.apiPaidSlipsGetPending().then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-PAG-14 - skip: aguardando correcao do BUG-29 (pagamento de boleto aceita a carteira de outro usuario)
  it.skip('não deve permitir que o pagamento de um boleto debite a conta corrente de outro usuário', () => {
    cy.seedTestUser(SECOND_USER).then((victim) => {
      cy.currentAccountByWalletId(victim.walletId).then((victimBefore) => {
        cy.encryptTransactionPin(session.token, session.user.pin).then((encryptedPin) => {
          cy.apiPaidSlipsPayRequest({
            token: session.token,
            walletId: victim.walletId,
            barcode: BARCODES.sucesso,
            name: 'Joao Silva',
            transactionPassword: encryptedPin,
            value: 150.75,
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
