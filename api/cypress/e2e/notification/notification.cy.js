const SECOND_USER = {
  email: 'qa.seed.user.b@academywallet.test',
  cpf: '52998224725',
  rg: '112233445',
};

describe('API - Notification', () => {
  let session;

  beforeEach(() => {
    cy.apiLoginAsSeedUser().then((s) => {
      session = s;
    });
  });

  // CT-API-NOT-01 - fluxo positivo: usuario autenticado consegue listar suas notificacoes
  it('deve listar as notificacoes do usuario autenticado', () => {
    cy.request({
      method: 'POST',
      url: '/notification',
      body: { userId: session.user.userId },
    }).then(() => {
      cy.request({
        method: 'GET',
        url: '/notification',
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.length.at.least(1);
        expect(response.body.data[0]).to.have.property('title');
        expect(response.body.data[0]).to.have.property('seen', false);
      });
    });
  });

  // CT-API-NOT-02 - GET sem token
  it('deve retornar 401 ao listar notificacoes sem token', () => {
    cy.request({
      method: 'GET',
      url: '/notification',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-NOT-03 - regressao: POST /notification aceita qualquer userId sem token (ver BUG-23)
  it('regressao: POST /notification sem token entrega notificacao para qualquer userId informado', () => {
    cy.request({
      method: 'POST',
      url: '/notification',
      failOnStatusCode: false,
      body: { userId: session.user.userId },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      method: 'GET',
      url: '/notification',
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((response) => {
      expect(response.body.data.some((n) => n.title === 'Teste')).to.be.true;
    });
  });

  // CT-API-NOT-04 - PATCH mark-as-seen sem token
  it('deve retornar 401 ao marcar notificacao como vista sem token', () => {
    cy.request({
      method: 'PATCH',
      url: '/notification/mark-as-seen',
      failOnStatusCode: false,
      body: { notificationId: '00000000-0000-4000-8000-000000000000' },
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-NOT-05 - edge: notificationId inexistente nao gera erro (update sem match)
  it('edge: marcar como vista um notificationId inexistente retorna 200 mesmo sem alterar nada', () => {
    cy.request({
      method: 'PATCH',
      url: '/notification/mark-as-seen',
      headers: { Authorization: `Bearer ${session.token}` },
      body: { notificationId: '00000000-0000-4000-8000-000000000000' },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  // CT-API-NOT-06 - regressao (IDOR): mark-as-seen nao valida o dono da notificacao (ver BUG-23)
  it('regressao (IDOR): usuario autenticado consegue marcar como vista uma notificacao de outro usuario', () => {
    cy.apiLoginAsSeedUser(SECOND_USER).then((sessionB) => {
      cy.request({
        method: 'POST',
        url: '/notification',
        body: { userId: sessionB.user.userId },
      });

      cy.request({
        method: 'GET',
        url: '/notification',
        headers: { Authorization: `Bearer ${sessionB.token}` },
      }).then((responseB) => {
        const notificationIdFromUserB = responseB.body.data[0].id;

        cy.request({
          method: 'PATCH',
          url: '/notification/mark-as-seen',
          headers: { Authorization: `Bearer ${session.token}` },
          body: { notificationId: notificationIdFromUserB },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.request({
          method: 'GET',
          url: '/notification',
          headers: { Authorization: `Bearer ${sessionB.token}` },
        }).then((responseBAfter) => {
          const notification = responseBAfter.body.data.find(
            (n) => n.id === notificationIdFromUserB,
          );
          expect(notification.seen).to.be.true;
        });
      });

      cy.cleanTestUser(SECOND_USER.email);
    });
  });
});
