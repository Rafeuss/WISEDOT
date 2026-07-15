import InvestimentosPage from '../../support/pageObjects/InvestimentosPage';
import HomePage from '../../support/pageObjects/HomePage';
import TransactionPinModal from '../../support/pageObjects/TransactionPinModal';

describe('Investimentos', () => {
  let testUser;

  beforeEach(() => {
    cy.seedMarketShares();
    cy.loginAsSeedUser().then((user) => {
      testUser = user;
      HomePage.goToInvestments();
    });
  });

  // CT-INV-01 - Listagem dos produtos seedados
  it('deve listar os produtos de investimento disponiveis', () => {
    InvestimentosPage.expectFundVisible('ARX Denial FIC FIRF CP');
  });

  // CT-INV-02 - Busca por nome do fundo
  it('deve filtrar corretamente ao buscar por nome do fundo', () => {
    InvestimentosPage.searchByName('ARX');
    InvestimentosPage.expectFundVisible('ARX Denial FIC FIRF CP');
    InvestimentosPage.expectFundVisible('ARX Everest FIC Renda Fixa Crédito Privado');
    InvestimentosPage.expectFundNotVisible('Guepardo Institucional FIC Ações');
  });

  // CT-INV-03 - Filtro por nivel de risco
  it('deve filtrar corretamente por risco Alto', () => {
    InvestimentosPage.filterByRisk('Alto');
    InvestimentosPage.expectFundVisible('ARX Denial FIC FIRF CP');
    InvestimentosPage.expectFundNotVisible('Absolute Alpha Global FIC FIM');
  });

  // CT-INV-04 - Investimento com sucesso
  it('deve investir com sucesso em um fundo dentro do saldo disponivel', () => {
    InvestimentosPage.invest('ARX Denial FIC FIRF CP', '50000');
    TransactionPinModal.enterPin(testUser.pin).confirm();
    InvestimentosPage.expectSuccessToast();
    InvestimentosPage.goToMyInvestments();
    InvestimentosPage.expectInvestmentListed('ARX Denial FIC FIRF CP');
  });

  // CT-INV-05 - Resgate parcial com sucesso
  it('deve resgatar parcialmente um investimento existente', () => {
    InvestimentosPage.invest('ARX Denial FIC FIRF CP', '50000');
    TransactionPinModal.enterPin(testUser.pin).confirm();
    InvestimentosPage.goToMyInvestments();
    InvestimentosPage.withdraw('ARX Denial FIC FIRF CP', '20000');
    TransactionPinModal.enterPin(testUser.pin).confirm();
    InvestimentosPage.expectWithdrawSuccessToast();
  });

  // CT-INV-06 - BUG-19: nenhum limite superior e aplicado no formulario
  it('regressao BUG-19: botao de investir permanece habilitado sem limite superior de valor', () => {
    cy.contains('ARX Denial FIC FIRF CP')
      .parents('div')
      .first()
      .within(() => {
        cy.contains('button', 'Investir').click();
      });
    cy.get('#RedemptionValueInput').clear().type('150000'); // R$ 1.500,00
    cy.get('#investmentButton').should('not.be.disabled');
  });
});
