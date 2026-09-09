import { faker } from '@faker-js/faker';

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

export function generateUniqueEmail() {
  return `qa.cadastro.${faker.string.alphanumeric(12)}@academywallet.test`;
}

export function generateInvalidEmailFormat() {
  return faker.string.alpha(10);
}

const PASSWORD_SPECIAL_CHARS = ['@', '#', '$', '%', '&', '*'];

export function generateStrongPassword(length = 9) {
  const digit = faker.string.numeric(1);
  const special = faker.helpers.arrayElement(PASSWORD_SPECIAL_CHARS);
  const upper = faker.string.alpha({ length: 1, casing: 'upper' });
  const lower = faker.string.alpha({ length: length - 3, casing: 'lower' });
  return faker.helpers.shuffle(`${upper}${lower}${digit}${special}`.split('')).join('');
}

export function generateWeakPassword(length = 8) {
  return faker.string.alpha({ length, casing: 'lower' });
}

export function generatePasswordWithSpace() {
  return `${generateStrongPassword(6)} ${faker.string.numeric(3)}`;
}

export function generateRgOfLength(length) {
  return faker.string.alphanumeric({ length, casing: 'upper' });
}

export function generateRepeatedDigitsCpf() {
  return String(faker.number.int({ min: 0, max: 9 })).repeat(11);
}

export function generateMessyRg(cleanLength = 8) {
  const clean = faker.string.alphanumeric({ length: cleanLength, casing: 'upper' });
  const typed = clean.split('').join(faker.helpers.arrayElement(['-', '.', '/', ' ']));
  return { typed, expected: clean };
}

export function generateOversizedRg(typedLength = 15, maxLength = 10) {
  const typed = faker.string.alphanumeric({ length: typedLength, casing: 'upper' });
  return { typed, expected: typed.slice(0, maxLength) };
}

export function generateOversizedName(blockLength = 140) {
  const block = faker.string.alpha({ length: blockLength, casing: 'mixed' });
  const secondWord = faker.person.lastName().replace(/[^a-zA-ZÀ-ſ]/g, '');
  return `${block} ${secondWord}`;
}

Cypress.Commands.add('uiCadastroFillStepOne', ({ name, email, password } = {}) => {
  if (name !== undefined) cy.get('#name').clear().type(name).blur();
  if (email !== undefined) cy.get('#email').clear().type(email).blur();
  if (password !== undefined) cy.get('#password').clear().type(password).blur();
});

Cypress.Commands.add('uiCadastroTypeName', (text) => {
  cy.get('#name').type(text).blur();
});

Cypress.Commands.add('uiCadastroFillStepTwo', ({ cpf, rg } = {}) => {
  if (cpf !== undefined) cy.get('#cpf').clear().type(cpf).blur();
  if (rg !== undefined) cy.get('#rg').clear().type(rg).blur();
});

Cypress.Commands.add('uiCadastroFillTransactionPin', (pin) => {
  cy.get('#password input').each((input, index) => {
    cy.wrap(input).type(pin[index]);
  });
});

Cypress.Commands.add('uiCadastroNextStep', () => {
  cy.get('#next-btn').click();
});

Cypress.Commands.add('uiCadastroGoBack', () => {
  cy.get('#back-link').click();
});

Cypress.Commands.add('uiCadastroSubmit', () => {
  cy.get('#enter-btn').click();
});

Cypress.Commands.add('uiCadastroRgValue', () => {
  return cy.get('#rg').invoke('val');
});

Cypress.Commands.add('uiCadastroFillPartialPin', (digits) => {
  [...digits].forEach((digit, index) => {
    cy.get('#password input').eq(index).type(digit);
  });
});

Cypress.Commands.add('uiCadastroExpectFieldValue', (fieldId, value) => {
  cy.get(`#${fieldId}`).should('have.value', value);
});

Cypress.Commands.add('uiCadastroExpectStepOneVisible', () => {
  cy.contains('seja bem-vindo').should('be.visible');
});

Cypress.Commands.add('uiCadastroExpectStepThreeVisible', () => {
  cy.contains('Hora de criar uma senha').should('be.visible');
});

Cypress.Commands.add('uiCadastroExpectFieldNotEmpty', (fieldId) => {
  cy.get(`#${fieldId}`).invoke('val').should('not.be.empty');
});

Cypress.Commands.add('uiCadastroEditField', (fieldId) => {
  cy.get(`#edit-${fieldId}`).click();
});

Cypress.Commands.add('uiCadastroNextButtonShouldBeDisabled', () => {
  cy.get('#next-btn').should('be.disabled');
});

Cypress.Commands.add('uiCadastroNextButtonShouldBeEnabled', () => {
  cy.get('#next-btn').should('not.be.disabled');
});

Cypress.Commands.add('uiCadastroExpectInlineError', (message) => {
  cy.contains(message).should('be.visible');
});

Cypress.Commands.add('uiCadastroExpectStepTwoVisible', () => {
  cy.contains('CPF').should('be.visible');
});

Cypress.Commands.add('uiCadastroExpectReviewStepVisible', () => {
  cy.contains('Está tudo certinho?').should('be.visible');
});

Cypress.Commands.add('uiCadastroExpectSuccessToast', () => {
  cy.url({ timeout: 15000 }).should('eq', `${Cypress.config('baseUrl')}/`);
});

Cypress.Commands.add('uiCadastroExpectErrorToast', () => {
  cy.url({ timeout: 15000 }).should('include', '/auth/register');
});

Cypress.Commands.add('uiCadastroRegisterCompleteFlow', ({ name, email, password, cpf, rg, pin }) => {
  cy.visit('/auth/register');
  cy.uiCadastroFillStepOne({ name, email, password });
  cy.uiCadastroNextStep();
  cy.uiCadastroFillStepTwo({ cpf, rg });
  cy.uiCadastroNextStep();
  cy.uiCadastroFillTransactionPin(pin);
  cy.uiCadastroNextStep();
  cy.uiCadastroExpectReviewStepVisible();
  cy.uiCadastroSubmit();
});
