describe('API - Wallet', () => {
  let session;

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
    });
  });

  // CT-API-WAL-01 - Saldo correto para a carteira autenticada
  it('deve retornar o saldo correto da carteira do usuario autenticado', () => {
    cy.request({
      method: 'GET',
      url: `/wallet/${session.walletId}`,
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.balanceCurrentAccount).to.eq(10000);
      expect(response.body.data).to.have.property('name', 'QA Seed Usuario');
    });
  });

  // CT-API-WAL-02 - Sem token
  it('deve retornar 401 ao buscar a carteira sem token', () => {
    cy.request({
      method: 'GET',
      url: `/wallet/${session.walletId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-WAL-03 - walletId de outro usuario / inexistente
  it('deve rejeitar o acesso a uma carteira que nao pertence ao usuario autenticado', () => {
    const otherWalletId = '11111111-1111-4111-8111-111111111111';

    cy.request({
      method: 'GET',
      url: `/wallet/${otherWalletId}`,
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      // OwnershipGuard roda antes do service e lanca 401 sempre que o walletId da URL
      // nao bate com o payload do token - independente de o recurso existir ou nao.
      expect(response.status).to.eq(401);
      expect(response.body.message).to.match(/não tem permissão/i);
    });
  });
});
