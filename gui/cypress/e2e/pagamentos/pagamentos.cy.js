import PagamentosPage from '../../support/pageObjects/PagamentosPage';

const BARCODES = {
  sucesso: '34191751243456787123041234560005199890000015000',
  jaPago: '34191751243456787123041234560005199890000015001',
  expirado: '34191751243456787123041234560005199890000015002',
  saldoInsuficiente: '34191751243456787123041234560005199890000015003',
  naoEncontrado: '34191751243456787123041234560005199890000015004',
  agendado: '34191751243456787123041234560005199890000015005',
};

describe('Pagamentos - Boleto', () => {
  let testUser;

  beforeEach(() => {
    cy.loginAsSeedUser().then((user) => {
      testUser = user;
      PagamentosPage.visit();
    });
  });

  // CT-PAG-01 - Fluxo positivo completo, com saldo suficiente
  it('deve pagar um boleto com sucesso usando o codigo de barras valido', () => {
    PagamentosPage.fillBarcode(BARCODES.sucesso).continueStep();
    PagamentosPage.goToSummary();
    PagamentosPage.confirmPayment();
    PagamentosPage.payWithPin(testUser.pin);
    PagamentosPage.expectSuccessToast();
  });

  // CT-PAG-02 - Boleto ja pago
  it('deve rejeitar boleto ja pago com mensagem especifica', () => {
    PagamentosPage.fillBarcode(BARCODES.jaPago).continueStep();
    PagamentosPage.expectErrorToast('Este boleto já foi pago');
  });

  // CT-PAG-03 - Boleto expirado
  it('deve rejeitar boleto expirado com mensagem especifica', () => {
    PagamentosPage.fillBarcode(BARCODES.expirado).continueStep();
    PagamentosPage.expectErrorToast('Este boleto já expirou');
  });

  // CT-PAG-04 - Saldo insuficiente
  it('deve rejeitar pagamento por saldo insuficiente', () => {
    PagamentosPage.fillBarcode(BARCODES.saldoInsuficiente).continueStep();
    PagamentosPage.goToSummary();
    PagamentosPage.confirmPayment();
    PagamentosPage.payWithPin(testUser.pin);
    PagamentosPage.expectErrorToast('Saldo insuficiente');
  });

  // CT-PAG-05 - Boleto nao encontrado
  it('deve rejeitar codigo de barras nao encontrado', () => {
    PagamentosPage.fillBarcode(BARCODES.naoEncontrado).continueStep();
    PagamentosPage.expectErrorToast('Código de barras inválido');
  });

  // CT-PAG-06 - Boleto agendado/pendente
  it('deve aceitar codigo de barras de boleto agendado e avancar para a etapa 2', () => {
    PagamentosPage.fillBarcode(BARCODES.agendado).continueStep();
    cy.contains('Para quando?').should('be.visible');
  });

  // CT-PAG-07 - Codigo de barras vazio
  it('deve exigir o preenchimento do codigo de barras', () => {
    PagamentosPage.continueStep();
    PagamentosPage.expectInlineError('Preencha o código de barras');
  });

  // CT-PAG-08 - Codigo de barras com tamanho invalido (edge case)
  it('deve rejeitar codigo de barras com tamanho invalido', () => {
    PagamentosPage.fillBarcode('123456789').continueStep();
    PagamentosPage.expectInlineError('Preencha o código de barras');
  });
});
