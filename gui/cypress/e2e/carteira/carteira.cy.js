import { generateUniqueEmail, generateUniqueValidCpf } from '../../support/commands/cadastro';

describe('Carteira / Home', () => {
  // CT-CART-01 - Saldo exibido corretamente apos o seed (R$ 10.000,00)
  it('deve exibir o saldo em conta corrente igual ao valor seedado', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet');
    cy.uiHomeToggleBalanceEye();
    cy.uiHomeExpectBalance('R$ 10.000,00');
  });

  // CT-CART-02 - Toggle de mascarar/revelar saldo
  it('deve alternar entre saldo mascarado e saldo revelado', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet');
    cy.uiHomeExpectBalanceMasked();

    cy.uiHomeToggleBalanceEye();
    cy.uiHomeExpectBalance('R$ 10.000,00');

    cy.uiHomeToggleBalanceEye();
    cy.uiHomeExpectBalanceMasked();
  });

  // CT-CART-03 - skip: bloqueado pelo BUG-20 (o cadastro pela UI nao conclui; este cenario depende de um usuario recem-cadastrado)
  it.skip('deve exibir o tour de onboarding no primeiro acesso de um usuário recém-cadastrado (BUG-20)', () => {
    const email = generateUniqueEmail();
    const password = 'Teste@123';

    cy.uiCadastroRegisterCompleteFlow({
      name: 'Novo Usuario',
      email,
      password,
      cpf: generateUniqueValidCpf(),
      rg: '112233445',
      pin: '123456',
    });
    cy.uiCadastroExpectSuccessToast();

    cy.visit('/');
    cy.uiLoginFillEmail(email);
    cy.uiLoginFillPassword(password);
    cy.uiLoginSubmit();
    cy.uiHomeExpectOnboardingTourVisible();
  });

  // CT-CART-04 - deve carregar a tela de extrato completo ao acessar a URL direta (comportamento correto, funciona hoje)
  it('deve carregar a tela de extrato completo ao acessar a URL direta', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet/extract-complete');
    cy.uiHomeExpectExtractCompleteLoaded();
  });

  // CT-CART-06 - skip: aguardando correcao do BUG-05 (a Home nao oferece nenhum acesso ao extrato completo)
  it.skip('deve exibir na Home um acesso (link) para o extrato completo (BUG-05)', () => {
    cy.loginAsSeedUser();
    cy.visit('/wallet');
    cy.uiHomeExpectLinkToExtractComplete();
  });

  // CT-CART-05 - skip: bloqueado pelo BUG-20 (o cadastro pela UI nao conclui; este cenario depende de um usuario recem-cadastrado)
  it.skip('não deve reexibir o tour de onboarding após limpar o localStorage e o sessionStorage (BUG-20)', () => {
    const email = generateUniqueEmail();
    const password = 'Teste@123';

    cy.uiCadastroRegisterCompleteFlow({
      name: 'Novo Usuario',
      email,
      password,
      cpf: generateUniqueValidCpf(),
      rg: '112233445',
      pin: '123456',
    });
    cy.uiCadastroExpectSuccessToast();

    cy.visit('/');
    cy.uiLoginFillEmail(email);
    cy.uiLoginFillPassword(password);
    cy.uiLoginSubmit();
    cy.uiHomeExpectOnboardingTourVisible();
    cy.uiHomeSkipOnboardingTour();
    cy.uiHomeExpectOnboardingTourNotVisible();

    cy.clearLocalStorage();
    cy.window().then((win) => win.sessionStorage.clear());
    cy.reload();

    cy.uiHomeExpectOnboardingTourNotVisible();
  });
});
