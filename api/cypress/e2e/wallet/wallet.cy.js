describe('API - Wallet', () => {
  let session;

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
    });
  });

  // CT-API-WAL-01 - Saldo correto para a carteira autenticada
  it('deve retornar o saldo correto da carteira do usuário autenticado', () => {
    cy.apiWalletGetByWalletId(session.walletId, session.token).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.balanceCurrentAccount).to.eq(10000);
      expect(response.body.data).to.have.property('name', 'QA Seed Usuario');
    });
  });

  // CT-API-WAL-02 - Sem token
  it('deve retornar 401 ao buscar a carteira sem token', () => {
    cy.apiWalletGetByWalletId(session.walletId).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-WAL-03 - walletId de outro usuario / inexistente
  it('deve rejeitar o acesso a uma carteira que não pertence ao usuário autenticado', () => {
    const otherWalletId = '11111111-1111-4111-8111-111111111111';

    cy.apiWalletGetByWalletId(otherWalletId, session.token).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.match(/não tem permissão/i);
    });
  });
});
