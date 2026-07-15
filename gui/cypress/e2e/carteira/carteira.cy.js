import HomePage from '../../support/pageObjects/HomePage';
import LoginPage from '../../support/pageObjects/LoginPage';
import CadastroPage, {
  generateUniqueEmail,
  generateUniqueValidCpf,
} from '../../support/pageObjects/CadastroPage';

describe('Carteira / Home', () => {
  // CT-CART-01 - Saldo exibido corretamente apos o seed (R$ 10.000,00)
  it('deve exibir o saldo em conta corrente igual ao valor seedado', () => {
    cy.loginAsSeedUser();
    HomePage.visit();
    HomePage.toggleBalanceEye();
    HomePage.expectBalance('R$ 10.000,00');
  });

  // CT-CART-02 - Toggle de mascarar/revelar saldo
  it('deve alternar entre saldo mascarado e saldo revelado', () => {
    cy.loginAsSeedUser();
    HomePage.visit();
    HomePage.expectBalanceMasked();

    HomePage.toggleBalanceEye();
    HomePage.expectBalance('R$ 10.000,00');

    HomePage.toggleBalanceEye();
    HomePage.expectBalanceMasked();
  });

  // CT-CART-03 - o seed compartilhado grava firstAccess=false de proposito 
  it('deve exibir o tour de onboarding no primeiro acesso de um usuario recem-cadastrado', () => {
    const email = generateUniqueEmail();
    const password = 'Teste@123';

    CadastroPage.registerCompleteFlow({
      name: 'Novo Usuario',
      email,
      password,
      cpf: generateUniqueValidCpf(),
      rg: '112233445',
      pin: '123456',
    });
    CadastroPage.expectSuccessToast();

    LoginPage.visit().fillEmail(email).fillPassword(password).submit();
    HomePage.expectOnboardingTourVisible();
  });
});
