class NotificacoesPage {
  visit() {
    cy.visit('/notification');
    return this;
  }

  expectTitleVisible() {
    cy.contains('Notificações').should('be.visible');
    return this;
  }

  // BUG-03: useNotifications.tsx monta a URL com uma env var nao configurada no
  // frontend, a chamada falha e a lista nunca e populada (item .container-not nunca aparece).
  expectNoNotificationItemsListed() {
    cy.contains('Carregando notificações...').should('not.exist');
    cy.get('.container-not').should('not.exist');
    return this;
  }
}

export default new NotificacoesPage();
