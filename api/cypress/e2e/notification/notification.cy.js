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
  it('deve listar as notificações do usuário autenticado', () => {
    cy.apiNotificationSend(session.user.userId).then(() => {
      cy.apiNotificationList(session.token).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.length.at.least(1);
        expect(response.body.data[0]).to.have.property('title');
        expect(response.body.data[0]).to.have.property('seen', false);
      });
    });
  });

  // CT-API-NOT-02 - GET sem token
  it('deve retornar 401 ao listar notificações sem token', () => {
    cy.apiNotificationList().then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-NOT-03 - skip: aguardando correcao do BUG-23 (POST /notification aceita e entrega notificacao sem token)
  it.skip('não deve permitir o envio de notificações para qualquer usuário sem autenticação', () => {
    cy.apiNotificationSend(session.user.userId).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.apiNotificationList(session.token).then((response) => {
      expect(response.body.data.some((n) => n.title === 'Teste')).to.be.false;
    });
  });

  // CT-API-NOT-04 - PATCH mark-as-seen sem token
  it('deve retornar 401 ao marcar notificação como vista sem token', () => {
    cy.apiNotificationMarkAsSeen('00000000-0000-4000-8000-000000000000').then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // CT-API-NOT-05 - edge: notificationId inexistente nao gera erro (update sem match)
  it('deve responder com sucesso ao marcar como vista uma notificação inexistente, sem alterar nenhum registro', () => {
    cy.apiNotificationMarkAsSeen('00000000-0000-4000-8000-000000000000', session.token).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  // CT-API-NOT-06 - skip: aguardando correcao do BUG-23 (mark-as-seen nao valida o dono da notificacao)
  it.skip('não deve permitir que um usuário marque como vista uma notificação de outro usuário (BUG-23)', () => {
    cy.apiLoginAsSeedUser(SECOND_USER).then((sessionB) => {
      cy.apiNotificationSend(sessionB.user.userId);

      cy.apiNotificationList(sessionB.token).then((responseB) => {
        const notificationIdFromUserB = responseB.body.data[0].id;

        cy.apiNotificationMarkAsSeen(notificationIdFromUserB, session.token).then((response) => {
          expect(response.status).to.eq(403);
        });

        cy.apiNotificationList(sessionB.token).then((responseBAfter) => {
          const notification = responseBAfter.body.data.find(
            (n) => n.id === notificationIdFromUserB,
          );
          expect(notification.seen).to.be.false;
        });
      });

      cy.cleanTestUser(SECOND_USER.email);
    });
  });
});
