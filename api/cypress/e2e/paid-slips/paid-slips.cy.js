const BARCODES = {
  sucesso: '34191751243456787123041234560005199890000015000',
  jaPago: '34191751243456787123041234560005199890000015001',
  expirado: '34191751243456787123041234560005199890000015002',
  saldoInsuficiente: '34191751243456787123041234560005199890000015003',
  naoEncontrado: '34191751243456787123041234560005199890000015004',
  agendado: '34191751243456787123041234560005199890000015005',
};

describe('API - Paid Slips (pagamento de boleto)', () => {
  let session;

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
    });
  });

  function payBoleto(barcode, value = 150.75) {
    return cy.encryptTransactionPin(session.token, session.user.pin).then((encryptedPin) => {
      return cy.request({
        method: 'POST',
        url: '/paid-slips',
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${session.token}` },
        body: {
          barcode,
          name: 'Joao Silva',
          transactionPassword: encryptedPin,
          value,
          walletId: session.walletId,
        },
      });
    });
  }

  // CT-API-PAG-01 - Pagamento com sucesso
  it('deve pagar um boleto valido com sucesso (201)', () => {
    payBoleto(BARCODES.sucesso).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  // CT-API-PAG-02 - Boleto ja pago 
  it('deve rejeitar boleto ja pago', () => {
    payBoleto(BARCODES.jaPago).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.message).to.match(/ja esta pago/i);
    });
  });

  // CT-API-PAG-03 - Boleto expirado 
  it('deve rejeitar boleto expirado', () => {
    payBoleto(BARCODES.expirado).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.message).to.match(/expirado/i);
    });
  });

  // CT-API-PAG-04 - Saldo insuficiente
  it('deve rejeitar pagamento com saldo insuficiente', () => {
    payBoleto(BARCODES.saldoInsuficiente).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.match(/saldo insuficiente/i);
    });
  });

  // CT-API-PAG-05 - Boleto nao encontrado
  it('deve retornar erro para codigo de barras nao encontrado', () => {
    payBoleto(BARCODES.naoEncontrado).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
    });
  });

  // CT-API-PAG-06 - Boleto agendado/pendente
  it('deve aceitar boleto agendado/pendente', () => {
    payBoleto(BARCODES.agendado).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  // CT-API-PAG-07 - Codigo de barras invalido 
  it('deve rejeitar codigo de barras com tamanho invalido', () => {
    payBoleto('123456789').then((response) => {
      expect(response.status).to.eq(409);
    });
  });

  // CT-API-PAG-08 - PIN incorreto 
  it('deve rejeitar pagamento quando o PIN transacional esta incorreto', () => {
    cy.encryptTransactionPin(session.token, '000000').then((encryptedPin) => {
      cy.request({
        method: 'POST',
        url: '/paid-slips',
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${session.token}` },
        body: {
          barcode: BARCODES.sucesso,
          name: 'Joao Silva',
          transactionPassword: encryptedPin,
          value: 150.75,
          walletId: session.walletId,
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.match(/senha transacional incorreta/i);
      });
    });
  });

  // CT-API-PAG-09 - Consulta de boleto por codigo de barras (GET)
  it('deve consultar os dados de um boleto valido pelo codigo de barras', () => {
    cy.request({
      method: 'GET',
      url: `/paid-slips/${BARCODES.sucesso}`,
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('valueToPay');
    });
  });

  // CT-API-PAG-09b - Sem token
  it('deve retornar 401 ao consultar um boleto sem token', () => {
    cy.request({
      method: 'GET',
      url: `/paid-slips/${BARCODES.sucesso}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-PAG-10 - GET /pendent: lista vazia para usuario sem boletos pendentes
  it('deve retornar lista vazia de boletos pendentes para um usuario sem pendencias', () => {
    cy.request({
      method: 'GET',
      url: '/paid-slips/pendent',
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length(0);
    });
  });

  // CT-API-PAG-11 - GET /pendent: fluxo positivo, boleto agendado aparece na lista
  it('deve listar um boleto agendado/pendente apos o pagamento', () => {
    payBoleto(BARCODES.agendado).then((payResponse) => {
      expect(payResponse.status).to.be.oneOf([200, 201]);

      cy.request({
        method: 'GET',
        url: '/paid-slips/pendent',
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.length(1);
        expect(response.body.data[0]).to.have.property('barcode', BARCODES.agendado);
      });
    });
  });

  // CT-API-PAG-12 - GET /pendent sem token
  it('deve retornar 401 ao listar boletos pendentes sem token', () => {
    cy.request({
      method: 'GET',
      url: '/paid-slips/pendent',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
