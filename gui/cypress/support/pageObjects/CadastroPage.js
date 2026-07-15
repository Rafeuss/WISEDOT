const CPF_FIRST_CHECK_WEIGHT = 10;
const CPF_SECOND_CHECK_WEIGHT = 11;

let cpfSequence = 0;

function calculateCpfCheckDigit(digits, weightStart) {
  const sum = digits.reduce(
    (acc, digit, index) => acc + digit * (weightStart - index),
    0
  );
  const remainder = (sum * 10) % 11;
  return remainder === 10 || remainder === 11 ? 0 : remainder;
}

// Mesmo algoritmo de "isValidCPF" em FormRegisterStepTwo.tsx; precisa ser
// unico por chamada por causa da constraint usr_uk_cpf.
export function generateUniqueValidCpf() {
  cpfSequence += 1;
  const base = `${Date.now()}${cpfSequence}`
    .slice(-9)
    .padStart(9, '0')
    .split('')
    .map(Number);

  const firstCheckDigit = calculateCpfCheckDigit(base, CPF_FIRST_CHECK_WEIGHT);
  const secondCheckDigit = calculateCpfCheckDigit(
    [...base, firstCheckDigit],
    CPF_SECOND_CHECK_WEIGHT
  );

  return [...base, firstCheckDigit, secondCheckDigit].join('');
}

// Unico por execucao por causa da constraint usr_uk_email.
export function generateUniqueEmail() {
  return `qa.cadastro.${Date.now()}.${Cypress._.uniqueId()}@academywallet.test`;
}

class CadastroPage {
  visit() {
    cy.visit('/auth/register');
    return this;
  }

  fillStepOne({ name, email, password } = {}) {
    if (name !== undefined) cy.get('#name').clear().type(name).blur();
    if (email !== undefined) cy.get('#email').clear().type(email).blur();
    if (password !== undefined) cy.get('#password').clear().type(password).blur();
    return this;
  }

  // Sem clear() - reproduz o cenario do BUG-06 (correcao incremental do valor).
  typeName(text) {
    cy.get('#name').type(text).blur();
    return this;
  }

  fillStepTwo({ cpf, rg } = {}) {
    if (cpf !== undefined) cy.get('#cpf').clear().type(cpf).blur();
    if (rg !== undefined) cy.get('#rg').clear().type(rg).blur();
    return this;
  }

  // div#password tem 6 inputs individuais, um por digito.
  fillTransactionPin(pin) {
    cy.get('#password input').each((input, index) => {
      cy.wrap(input).type(pin[index]);
    });
    return this;
  }

  nextStep() {
    cy.get('#next-btn').click();
    return this;
  }

  goBack() {
    cy.get('#back-link').click();
    return this;
  }

  // #enter-btn e type="submit" sem onSubmit/preventDefault no <form> (BUG-20):
  // a submissao nativa do form pode vencer a corrida com o fetch do React e
  // abortar o cadastro. O preventDefault abaixo e anexado so no navegador de
  // teste, para exercitar o handleSubmit sem sofrer esse bug de infra do form.
  submit() {
    cy.get('#enter-btn')
      .closest('form')
      .then(($form) => {
        $form.on('submit', (e) => e.preventDefault());
      });
    cy.get('#enter-btn').click();
    return this;
  }

  rgValue() {
    return cy.get('#rg').invoke('val');
  }

  nextButtonShouldBeDisabled() {
    cy.get('#next-btn').should('be.disabled');
    return this;
  }

  nextButtonShouldBeEnabled() {
    cy.get('#next-btn').should('not.be.disabled');
    return this;
  }

  expectInlineError(message) {
    cy.contains(message).should('be.visible');
    return this;
  }

  expectStepTwoVisible() {
    cy.contains('CPF').should('be.visible');
    return this;
  }

  expectReviewStepVisible() {
    cy.contains('Está tudo certinho?').should('be.visible');
    return this;
  }

  // O toast (react-toastify) some sozinho e um cy.intercept pode nunca
  // resolver por causa do BUG-20 (ver submit() acima) - a verificacao usa
  // so o estado final da URL, com timeout generoso.
  expectSuccessToast() {
    cy.url({ timeout: 15000 }).should('eq', `${Cypress.config('baseUrl')}/`);
    return this;
  }

  expectErrorToast() {
    cy.url({ timeout: 15000 }).should('include', '/auth/register');
    return this;
  }

  // Reutilizado por carteira.cy.js (Onboarding) para gerar um usuario com firstAccess=true.
  registerCompleteFlow({ name, email, password, cpf, rg, pin }) {
    this.visit();
    this.fillStepOne({ name, email, password }).nextStep();
    this.fillStepTwo({ cpf, rg }).nextStep();
    this.fillTransactionPin(pin).nextStep();
    this.expectReviewStepVisible();
    this.submit();
    return this;
  }
}

export default new CadastroPage();
