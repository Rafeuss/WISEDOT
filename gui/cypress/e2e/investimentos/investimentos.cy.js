describe('Investimentos', () => {
  let testUser;

  beforeEach(() => {
    cy.seedMarketShares();
    cy.loginAsSeedUser().then((user) => {
      testUser = user;
      cy.uiHomeGoToInvestments();
    });
  });

  // CT-INV-01 - Listagem dos produtos seedados
  it('deve listar os produtos de investimento disponíveis', () => {
    cy.uiInvestimentosExpectFundVisible('ARX Denial FIC FIRF CP');
  });

  // CT-INV-02 - Busca por nome do fundo
  it('deve filtrar corretamente ao buscar por nome do fundo', () => {
    cy.uiInvestimentosSearchByName('ARX');
    cy.uiInvestimentosExpectFundVisible('ARX Denial FIC FIRF CP');
    cy.uiInvestimentosExpectFundVisible('ARX Everest FIC Renda Fixa Crédito Privado');
    cy.uiInvestimentosExpectFundNotVisible('Guepardo Institucional FIC Ações');
  });

  // CT-INV-03 - Filtro por nivel de risco
  it('deve filtrar corretamente por risco Alto', () => {
    cy.uiInvestimentosFilterByRisk('Alto');
    cy.uiInvestimentosExpectFundVisible('ARX Denial FIC FIRF CP');
    cy.uiInvestimentosExpectFundNotVisible('Absolute Alpha Global FIC FIM');
  });

  // CT-INV-04 - skip: aguardando correcao do BUG-41 (modal de PIN pode fechar sozinho no meio da digitacao)
  it.skip('deve investir com sucesso em um fundo dentro do saldo disponível', () => {
    cy.uiInvestimentosInvest('ARX Denial FIC FIRF CP', '50000');
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectSuccessToast();
    cy.uiInvestimentosGoToMyInvestments();
    cy.uiInvestimentosExpectInvestmentListed('ARX Denial FIC FIRF CP');
  });

  // CT-INV-05 - skip: aguardando correcao do BUG-41 (modal de PIN pode fechar sozinho no meio da digitacao)
  it.skip('deve resgatar parcialmente um investimento existente', () => {
    cy.uiInvestimentosInvest('ARX Denial FIC FIRF CP', '50000');
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosGoToMyInvestments();
    cy.uiInvestimentosWithdraw('ARX Denial FIC FIRF CP', '20000');
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectWithdrawSuccessToast();
  });

  // CT-INV-06 - skip: aguardando correcao do BUG-41 (modal de PIN pode fechar sozinho no meio da digitacao)
  it.skip('deve exibir mensagem de saldo insuficiente ao investir acima do saldo disponível', () => {
    cy.uiInvestimentosOpenInvestForm('ARX Denial FIC FIRF CP');
    cy.uiInvestimentosFillInvestAmount('2000000');
    cy.uiInvestimentosConfirmInvestment();
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectInsufficientBalanceError();
  });

  // CT-INV-07 - Filtro por multiplos niveis de risco
  it('deve somar os fundos dos riscos selecionados ao filtrar por mais de um risco', () => {
    cy.uiInvestimentosFilterByRisks(['Alto', 'Baixo']);
    cy.uiInvestimentosExpectFilterCount(2);
    cy.uiInvestimentosExpectFundVisible('ARX Denial FIC FIRF CP');
    cy.uiInvestimentosExpectFundVisible('Ibiuna Long Blased FIC FIM');
    cy.uiInvestimentosExpectFundNotVisible('Absolute Alpha Global FIC FIM');
  });

  // CT-INV-08 - skip: aguardando correcao do BUG-12 (Carregar mais permanece habilitado sem mais resultados)
  it.skip('deve desabilitar (ou ocultar) o botao Carregar mais quando não há mais resultados (BUG-12)', () => {
    cy.uiInvestimentosSearchByName('ARX');
    cy.uiInvestimentosExpectFundVisible('ARX Denial FIC FIRF CP');
    cy.uiInvestimentosExpectFundVisible('ARX Everest FIC Renda Fixa Crédito Privado');
    cy.contains('button', 'Carregar mais').should('be.disabled');
  });

  // CT-INV-09 - skip: aguardando correcao do BUG-41 (modal de PIN pode fechar sozinho no meio da digitacao)
  it.skip('deve aceitar o aporte no valor mínimo exato do fundo', () => {
    cy.uiInvestimentosOpenInvestForm('Sulamérica Inflatie FI RF LP');
    cy.uiInvestimentosFillInvestAmount('500');
    cy.uiInvestimentosExpectInvestmentButtonEnabled();
    cy.uiInvestimentosConfirmInvestment();
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectSuccessToast();
  });

  // CT-INV-10 - Aporte abaixo do minimo mantem o botao desabilitado
  it('deve manter o botao Investir desabilitado com aporte abaixo do mínimo', () => {
    cy.uiInvestimentosOpenInvestForm('Sulamérica Inflatie FI RF LP');
    cy.uiInvestimentosFillInvestAmount('499');
    cy.uiInvestimentosExpectInvestmentButtonDisabled();
  });

  // CT-INV-11 - skip: aguardando confirmacao do BUG-33 (nao reproduzido na ultima verificacao)
  it.skip('não deve permitir o resgate de um valor maior que a soma dos aportes quando há mais de um aporte no mesmo fundo (BUG-33)', () => {
    cy.uiInvestimentosInvest('Sulamérica Inflatie FI RF LP', '500');
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectSuccessToast();

    cy.uiInvestimentosInvest('Sulamérica Inflatie FI RF LP', '500');
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectSuccessToast();

    cy.uiInvestimentosGoToMyInvestments();
    cy.uiInvestimentosWithdraw('Sulamérica Inflatie FI RF LP', '1500');
    cy.uiTransactionPinModalEnterPin(testUser.pin);
    cy.uiTransactionPinModalConfirm();
    cy.uiInvestimentosExpectInsufficientBalanceError();
  });

  // CT-INV-12 - Trocar de aba mantem o filtro aplicado
  it('deve manter o filtro aplicado ao trocar de aba e voltar', () => {
    cy.uiInvestimentosFilterByRisk('Alto');
    cy.uiInvestimentosExpectFilterCount(1);
    cy.uiInvestimentosGoToMyInvestments();
    cy.uiInvestimentosGoToInvestTab();
    cy.uiInvestimentosExpectFilterCount(1);
  });

  // CT-INV-13 - Painel de filtro reaberto mantem a selecao visual
  it('deve exibir o risco previamente selecionado marcado ao reabrir o painel de filtro', () => {
    cy.uiInvestimentosFilterByRisk('Alto');
    cy.uiInvestimentosOpenRiskFilterPanel();
    cy.uiInvestimentosExpectRiskFilterSelected('Alto');
  });

  // CT-INV-14 - skip: aguardando correcao do BUG-19 (formulario de aporte nao aplica nenhum limite superior de valor)
  it.skip('deve bloquear a confirmação de aporte com um valor muito acima do razoável (BUG-19)', () => {
    cy.uiInvestimentosOpenInvestForm('ARX Denial FIC FIRF CP');
    cy.uiInvestimentosFillInvestAmount('150000');
    cy.uiInvestimentosExpectInvestmentButtonDisabled();
  });
});
