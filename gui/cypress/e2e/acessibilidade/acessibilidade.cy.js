import LoginPage from '../../support/pageObjects/LoginPage';
import HomePage from '../../support/pageObjects/HomePage';
import PagamentosPage from '../../support/pageObjects/PagamentosPage';
import CadastroPage from '../../support/pageObjects/CadastroPage';
import RecuperacaoSenhaPage from '../../support/pageObjects/RecuperacaoSenhaPage';
import NotificacoesPage from '../../support/pageObjects/NotificacoesPage';

const BARCODE_SUCESSO = '34191751243456787123041234560005199890000015000';

describe('Acessibilidade (WCAG 2.1 AA - cypress-axe)', () => {
  // CT-A11Y-01 - Tela de Login
  it('nao deve ter violacoes de acessibilidade na tela de Login', () => {
    LoginPage.visit();
    cy.runA11yScan();
  });

  // CT-A11Y-02 - Home autenticado
  it('nao deve ter violacoes de acessibilidade na tela da Carteira (Home)', () => {
    cy.loginAsSeedUser();
    HomePage.visit();
    cy.runA11yScan();
  });

  // CT-A11Y-03 - Tela de Pagamentos
  it('nao deve ter violacoes de acessibilidade na tela de Pagamentos', () => {
    cy.loginAsSeedUser();
    PagamentosPage.visit();
    cy.runA11yScan();
  });

  // CT-A11Y-04 - Tela de Cadastro
  it('nao deve ter violacoes de acessibilidade na tela de Cadastro', () => {
    CadastroPage.visit();
    cy.runA11yScan();
  });

  // CT-A11Y-05 - Tela de Recuperacao de senha
  it('nao deve ter violacoes de acessibilidade na tela de Recuperacao de senha', () => {
    RecuperacaoSenhaPage.visit();
    cy.runA11yScan();
  });

  // CT-A11Y-06 - Tela de Investimentos
  it('nao deve ter violacoes de acessibilidade na tela de Investimentos', () => {
    cy.seedMarketShares();
    cy.loginAsSeedUser();
    HomePage.visit();
    HomePage.goToInvestments();
    cy.runA11yScan();
  });

  // CT-A11Y-07 - Tela de Notificacoes
  it('nao deve ter violacoes de acessibilidade na tela de Notificacoes', () => {
    cy.loginAsSeedUser();
    NotificacoesPage.visit();
    cy.runA11yScan();
  });

  // CT-A11Y-08 - Tela de Extrato completo
  it('nao deve ter violacoes de acessibilidade na tela de Extrato completo', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet/extract-complete');
    cy.runA11yScan();
  });

  // CT-A11Y-09 - Pagamentos, etapa 2 
  it('nao deve ter violacoes de acessibilidade na etapa 2 de Pagamentos (Para quando?)', () => {
    cy.loginAsSeedUser();
    PagamentosPage.visit();
    PagamentosPage.fillBarcode(BARCODE_SUCESSO).continueStep();
    cy.contains('Para quando?', { timeout: 10000 }).should('be.visible');
    cy.runA11yScan();
  });

  // CT-A11Y-10 - Pagamentos, etapa 3 
  it('nao deve ter violacoes de acessibilidade na etapa 3 de Pagamentos (Resumo)', () => {
    cy.loginAsSeedUser();
    PagamentosPage.visit();
    PagamentosPage.fillBarcode(BARCODE_SUCESSO).continueStep();
    PagamentosPage.goToSummary();
    cy.runA11yScan();
  });
});
