describe('Notificações', () => {
  beforeEach(() => {
    cy.loginAsSeedUser();
  });

  // CT-NOT-01 - skip: aguardando correcao do BUG-03 (a tela dispara a chamada para "/undefined/notification")
  it.skip('não deve disparar a chamada de notificações para o endereço quebrado "/undefined/notification" (BUG-03)', () => {
    cy.uiNotificacoesInterceptNotificationCall();
    cy.visit('/notification');
    cy.uiNotificacoesExpectNotificationCallNotBroken();
  });

  // CT-NOT-02 - skip: aguardando correcao do BUG-03 (a tela fica sem conteudo por causa da chamada quebrada)
  it.skip('deve exibir a lista de notificações do usuário (ou o estado vazio legítimo), sem ficar presa em carregamento (BUG-03)', () => {
    cy.visit('/notification');
    cy.uiNotificacoesExpectTitleVisible();
    cy.uiNotificacoesExpectNotificationsRendered();
  });
});
