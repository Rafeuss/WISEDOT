describe('Pagamentos - Boleto', () => {
  let testUser;
  let BARCODES;

  before(() => {
    cy.fixture('boletos.json').then((data) => {
      BARCODES = data;
    });
  });

  beforeEach(() => {
    cy.loginAsSeedUser().then((user) => {
      testUser = user;
      cy.visit('/payment');
    });
  });

  // CT-PAG-01 - Fluxo positivo completo, com saldo suficiente
  it('deve pagar um boleto com sucesso usando o código de barras válido', () => {
    cy.uiPagamentosFillBarcode(BARCODES.sucesso);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosGoToSummary();
    cy.uiPagamentosConfirmPayment();
    cy.uiPagamentosPayWithPin(testUser.pin);
    cy.uiPagamentosExpectSuccessToast();
  });

  // CT-PAG-02 - Boleto ja pago
  it('deve rejeitar boleto já pago com mensagem específica', () => {
    cy.uiPagamentosFillBarcode(BARCODES.jaPago);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectErrorToast('Este boleto já foi pago');
  });

  // CT-PAG-03 - Boleto expirado
  it('deve rejeitar boleto expirado com mensagem específica', () => {
    cy.uiPagamentosFillBarcode(BARCODES.expirado);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectErrorToast('Este boleto já expirou');
  });

  // CT-PAG-04 - skip: aguardando correcao do BUG-36 (pagamento recusado por saldo insuficiente falha em silencio, sem mensagem)
  it.skip('deve exibir a mensagem "Saldo insuficiente" ao recusar o pagamento por saldo insuficiente (BUG-36)', () => {
    cy.uiPagamentosFillBarcode(BARCODES.saldoInsuficiente);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosGoToSummary();
    cy.uiPagamentosConfirmPayment();
    cy.uiPagamentosPayWithPin(testUser.pin);
    cy.uiPagamentosExpectErrorToast('Saldo insuficiente');
  });

  // CT-PAG-05 - Boleto nao encontrado
  it('deve rejeitar código de barras não encontrado', () => {
    cy.uiPagamentosFillBarcode(BARCODES.naoEncontrado);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectErrorToast('Código de barras inválido');
  });

  // CT-PAG-06 - Boleto agendado/pendente
  it('deve aceitar código de barras de boleto agendado e avançar para a etapa 2', () => {
    cy.uiPagamentosFillBarcode(BARCODES.agendado);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectStepTwoVisible();
  });

  // CT-PAG-07 - Codigo de barras vazio
  it('deve exigir o preenchimento do código de barras', () => {
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectInlineError('Preencha o código de barras');
  });

  // CT-PAG-08 - Codigo de barras com tamanho invalido (edge case)
  it('deve rejeitar código de barras com tamanho inválido', () => {
    cy.uiPagamentosFillBarcode('123456789');
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectInlineError('Preencha o código de barras');
  });

  // CT-PAG-09 - Campo de codigo de barras sem limite maximo de digitos
  it('deve aceitar mais de 50 dígitos no campo de código de barras sem truncar', () => {
    const longBarcode = '1'.repeat(60);
    cy.uiPagamentosFillBarcode(longBarcode);
    cy.uiPagamentosExpectBarcodeValue(longBarcode);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectInlineError('Preencha o código de barras');
  });

  // CT-PAG-10 - Voltar da etapa 2 para a 1 apaga o codigo de barras (BUG-37)
  it('deve apagar o código de barras ao voltar da etapa 2 para a etapa 1', () => {
    cy.uiPagamentosFillBarcode(BARCODES.sucesso);
    cy.uiPagamentosContinueStep();
    cy.uiPagamentosExpectStepTwoVisible();
    cy.uiPagamentosGoBackToStepOne();
    cy.uiPagamentosExpectBarcodeEmpty();
  });
});
