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

  // CT-API-CTA-01 - skip: aguardando correcao do BUG-22 (nenhum endpoint deste modulo exige autenticacao)
  it.skip('não deve responder a uma consulta de conta corrente sem token de autenticação', () => {
    cy.apiCurrentAccountGetById(currentAccountId).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-CTA-02 - skip: aguardando correcao do BUG-22 (GET /current-account sempre retorna data: null)
  it.skip('deve retornar a listagem de contas correntes com os dados reais das contas cadastradas', () => {
    cy.apiCurrentAccountList(session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.not.be.null;
    });
  });

  // CT-API-CTA-03 - skip: aguardando correcao do BUG-22 (findOne com id existente retorna data: null)
  it.skip('não deve retornar dados nulos ao consultar uma conta corrente existente pelo id', () => {
    cy.apiCurrentAccountGetById(currentAccountId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.not.be.null;
      expect(response.body.data).to.have.property('id', currentAccountId);
    });
  });

  // CT-API-CTA-04 - skip: aguardando correcao do BUG-22 (id inexistente retorna 500 em vez de 404)
  it.skip('deve retornar 404 ao consultar uma conta corrente com id inexistente', () => {
    cy.apiCurrentAccountGetById('00000000-0000-4000-8000-000000000000', session.token).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // CT-API-CTA-05 - skip: aguardando correcao do BUG-22 (POST sem token so e barrado pela whitelist, nao por autenticacao)
  it.skip('não deve responder a uma criação de conta corrente sem token de autenticação', () => {
    cy.apiCurrentAccountCreate({ balance: 500 }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-CTA-06 - skip: aguardando correcao do BUG-22 (PATCH sem token so e barrado pela whitelist, nao por autenticacao)
  it.skip('deve rejeitar a alteração de uma conta corrente quando o saldo é informado diretamente, sem alterar o saldo real', () => {
    cy.apiCurrentAccountUpdate(currentAccountId, { balance: 999999.99 }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.currentAccountByWalletId(session.walletId).then((cta) => {
      expect(Number(cta.balance)).to.eq(10000);
    });
  });

  // CT-API-CTA-07 - skip: aguardando correcao do BUG-22 (PATCH com corpo vazio quebra com 500)
  it.skip('deve retornar 400 ao alterar uma conta corrente com corpo vazio', () => {
    cy.apiCurrentAccountUpdate(currentAccountId, {}, session.token).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // CT-API-CTA-08 - skip: aguardando correcao do BUG-22 (DELETE responde sucesso mas nao remove o registro)
  it.skip('deve remover de fato o registro do banco de dados ao excluir uma conta corrente', () => {
    cy.apiCurrentAccountRemove(currentAccountId, session.token).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.currentAccountByWalletId(session.walletId).then((cta) => {
      expect(cta).to.be.undefined;
    });
  });
});
