// skip: aguardando correcao do BUG-18 (violacoes critical/serious de WCAG em todas as telas)
describe('Acessibilidade (WCAG 2.1 AA - cypress-axe)', () => {
  let BARCODE_SUCESSO;

  before(() => {
    cy.fixture('boletos.json').then((data) => {
      BARCODE_SUCESSO = data.sucesso;
    });
  });

  // CT-A11Y-01 - Tela de Login
  it.skip('não deve ter violações de acessibilidade na tela de Login', () => {
    cy.visit('/');
    cy.runA11yScan();
  });

  // CT-A11Y-02 - Home autenticado
  it.skip('não deve ter violações de acessibilidade na tela da Carteira (Home)', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet');
    cy.runA11yScan();
  });

  // CT-A11Y-03 - Tela de Pagamentos
  it.skip('não deve ter violações de acessibilidade na tela de Pagamentos', () => {
    cy.loginAsSeedUser();
    cy.visit('/payment');
    cy.runA11yScan();
  });

  // CT-A11Y-04 - Tela de Cadastro
  it.skip('não deve ter violações de acessibilidade na tela de Cadastro', () => {
    cy.visit('/auth/register');
    cy.runA11yScan();
  });

  // CT-A11Y-05 - Tela de Recuperacao de senha
  it.skip('não deve ter violações de acessibilidade na tela de Recuperação de senha', () => {
    cy.visit('/auth/forgot-password');
    cy.runA11yScan();
  });

  // CT-A11Y-06 - Tela de Investimentos
  it.skip('não deve ter violações de acessibilidade na tela de Investimentos', () => {
    cy.seedMarketShares();
    cy.loginAsSeedUser();
    cy.visit('/wallet');
    cy.uiHomeGoToInvestments();
    cy.runA11yScan();
  });

  // CT-A11Y-07 - Tela de Notificacoes
  it.skip('não deve ter violações de acessibilidade na tela de Notificações', () => {
    cy.loginAsSeedUser();
    cy.visit('/notification');
    cy.runA11yScan();
  });

  // CT-A11Y-08 - Tela de Extrato completo
  it.skip('não deve ter violações de acessibilidade na tela de Extrato completo', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet/extract-complete');
    cy.runA11yScan();
  });

  // CT-A11Y-09 - Pagamentos, etapa 2
  it.skip('não deve ter violações de acessibilidade na etapa 2 de Pagamentos (Para quando?)', () => {
    cy.loginAsSeedUser();
    cy.visit('/payment');
    cy.uiPagamentosFillBarcode(BARCODE_SUCESSO);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectStepTwoVisible();
    cy.runA11yScan();
  });

  // CT-A11Y-10 - Pagamentos, etapa 3
  it.skip('não deve ter violações de acessibilidade na etapa 3 de Pagamentos (Resumo)', () => {
    cy.loginAsSeedUser();
    cy.visit('/payment');
    cy.uiPagamentosFillBarcode(BARCODE_SUCESSO);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosGoToSummary();
    cy.runA11yScan();
  });
});
