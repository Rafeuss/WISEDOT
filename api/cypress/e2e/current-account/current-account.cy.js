describe('API - Current Account', () => {
  let session;
  let currentAccountId;

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
      return cy.currentAccountByWalletId(session.walletId).then((cta) => {
        currentAccountId = cta.id;
      });
    });
  });

  // CT-API-CTA-01 - regressao: nenhum endpoint deste modulo exige autenticacao
  it('regressao: GET /current-account/:id responde sem token (nenhum guard aplicado)', () => {
    cy.request({
      method: 'GET',
      url: `/current-account/${currentAccountId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  // CT-API-CTA-02 - contrato: findAll nunca retorna a lista de contas
  it('contrato: GET /current-account nao retorna dados de conta nenhuma', () => {
    cy.request({
      method: 'GET',
      url: '/current-account',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.null;
    });
  });

  // CT-API-CTA-03 - contrato: findOne com id existente tambem retorna data: null (ver BUG-22)
  it('contrato: GET /current-account/:id de um registro existente ainda retorna data: null', () => {
    cy.request({
      method: 'GET',
      url: `/current-account/${currentAccountId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.null;
    });
  });

  // CT-API-CTA-04 - edge: id inexistente (mesmo formato UUID) quebra com 500
  it('edge: GET /current-account/:id com id inexistente retorna 500 nao tratado', () => {
    cy.request({
      method: 'GET',
      url: '/current-account/00000000-0000-4000-8000-000000000000',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  // CT-API-CTA-05 - contrato: POST rejeita o unico payload que faz sentido para o endpoint
  it('contrato: POST /current-account rejeita balance e wallet por whitelist (422)', () => {
    cy.request({
      method: 'POST',
      url: '/current-account',
      failOnStatusCode: false,
      body: { balance: 500 },
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.map((e) => e.field)).to.include('balance');
    });
  });

  // CT-API-CTA-06 - regressao: PATCH sem token tambem rejeita balance por whitelist (ver BUG-22)
  it('regressao: PATCH /current-account/:id sem token rejeita o campo balance (422), nao altera saldo', () => {
    cy.request({
      method: 'PATCH',
      url: `/current-account/${currentAccountId}`,
      failOnStatusCode: false,
      body: { balance: 999999.99 },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });

    cy.currentAccountByWalletId(session.walletId).then((cta) => {
      expect(Number(cta.balance)).to.eq(10000);
    });
  });

  // CT-API-CTA-07 - edge: PATCH com corpo vazio quebra com 500 (TypeORM nao aceita update sem campos)
  it('edge: PATCH /current-account/:id com corpo vazio retorna 500 nao tratado', () => {
    cy.request({
      method: 'PATCH',
      url: `/current-account/${currentAccountId}`,
      failOnStatusCode: false,
      body: {},
    }).then((response) => {
      expect(response.status).to.eq(500);
    });
  });

  // CT-API-CTA-08 - regressao: DELETE responde sucesso mas nao remove o registro
  it('regressao: DELETE /current-account/:id responde 200 mas nao remove o registro do banco', () => {
    cy.request({
      method: 'DELETE',
      url: `/current-account/${currentAccountId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.currentAccountByWalletId(session.walletId).then((cta) => {
      expect(cta).to.not.be.undefined;
      expect(cta.id).to.eq(currentAccountId);
    });
  });
});
