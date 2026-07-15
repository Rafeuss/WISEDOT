import NotificacoesPage from '../../support/pageObjects/NotificacoesPage';

describe('Notificações', () => {
  beforeEach(() => {
    cy.loginAsSeedUser();
  });

  // CT-NOT-01 - regressao do BUG-03: valida o estado quebrado
  it('deve exibir apenas o titulo da tela, sem nenhuma notificacao listada (bug conhecido BUG-03)', () => {
    NotificacoesPage.visit();
    NotificacoesPage.expectTitleVisible();
    NotificacoesPage.expectNoNotificationItemsListed();
  });
});
