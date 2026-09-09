import { faker } from '@faker-js/faker';

let cpfSequence = 0;

export function generateValidCpf() {
  const calcDigit = (nums) => {
    let sum = 0;
    let factor = nums.length + 1;
    for (const n of nums) {
      sum += n * factor;
      factor--;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 || rest === 11 ? 0 : rest;
  };

  cpfSequence += 1;
  const base = `${Date.now()}${cpfSequence}`
    .slice(-9)
    .padStart(9, '0')
    .split('')
    .map(Number);
  const d1 = calcDigit(base);
  const d2 = calcDigit([...base, d1]);
  return [...base, d1, d2].join('');
}

function generateValidName() {
  const raw = `${faker.person.firstName()} ${faker.person.lastName()}`;
  return raw.replace(/[^a-zA-ZÀ-ſ´ ]/g, '').replace(/\s+/g, ' ').trim();
}

export function buildValidPayload(overrides = {}) {
  return {
    name: generateValidName(),
    email: `qa.api.user.${faker.string.alphanumeric(12)}@academywallet.test`,
    loginPassword: 'Senha@Forte123',
    cpf: generateValidCpf(),
    rg: faker.string.numeric(9),
    transactionsPassword: '123456',
    ...overrides,
  };
}

export function generateOversizedName(minLength = 151) {
  const words = [];
  while (words.join(' ').length < minLength) {
    const word = faker.person.firstName().replace(/[^a-zA-ZÀ-ſ]/g, '');
    words.push(word);
  }
  return words.join(' ');
}

export function generateSingleWordName() {
  return faker.person.firstName().replace(/[^a-zA-ZÀ-ſ]/g, '');
}

export function generateNameWithDigits() {
  const digit = () => faker.number.int({ min: 0, max: 9 });
  return `${faker.person.firstName()}${digit()} ${faker.person.lastName()}${digit()}`;
}

export function generateNameWithSymbols() {
  return `${faker.person.firstName()}_${faker.person.lastName()}`;
}

export function generateRgOfLength(length) {
  return faker.string.alphanumeric({ length, casing: 'upper' });
}

export function generateRgWithInvalidChar() {
  return `${faker.string.alphanumeric({ length: 6, casing: 'upper' })}-`;
}

export function generateRepeatedDigitsCpf() {
  return String(faker.number.int({ min: 0, max: 9 })).repeat(11);
}

const PASSWORD_SPECIAL_CHARS = ['@', '#', '$', '%', '&', '*'];

export function generateStrongPassword(length = 9) {
  const digit = faker.string.numeric(1);
  const special = faker.helpers.arrayElement(PASSWORD_SPECIAL_CHARS);
  const upper = faker.string.alpha({ length: 1, casing: 'upper' });
  const lower = faker.string.alpha({ length: length - 3, casing: 'lower' });
  return faker.helpers.shuffle(`${upper}${lower}${digit}${special}`.split('')).join('');
}

export function generatePasswordWithoutUppercase(length = 9) {
  const digit = faker.string.numeric(1);
  const special = faker.helpers.arrayElement(PASSWORD_SPECIAL_CHARS);
  const lower = faker.string.alpha({ length: length - 2, casing: 'lower' });
  return faker.helpers.shuffle(`${lower}${digit}${special}`.split('')).join('');
}

export function generatePasswordWithoutLowercase(length = 9) {
  const digit = faker.string.numeric(1);
  const special = faker.helpers.arrayElement(PASSWORD_SPECIAL_CHARS);
  const upper = faker.string.alpha({ length: length - 2, casing: 'upper' });
  return faker.helpers.shuffle(`${upper}${digit}${special}`.split('')).join('');
}

export function generatePasswordWithoutDigit(length = 9) {
  const special = faker.helpers.arrayElement(PASSWORD_SPECIAL_CHARS);
  const upper = faker.string.alpha({ length: 1, casing: 'upper' });
  const lower = faker.string.alpha({ length: length - 2, casing: 'lower' });
  return faker.helpers.shuffle(`${upper}${lower}${special}`.split('')).join('');
}

export function generatePasswordWithoutSpecialChar(length = 9) {
  const digit = faker.string.numeric(1);
  const upper = faker.string.alpha({ length: 1, casing: 'upper' });
  const lower = faker.string.alpha({ length: length - 2, casing: 'lower' });
  return faker.helpers.shuffle(`${upper}${lower}${digit}`.split('')).join('');
}

export function generateNumericTransactionPassword(length) {
  return faker.string.numeric(length);
}

export function generateAlphaTransactionPassword(length = 6) {
  return faker.string.alpha(length);
}
