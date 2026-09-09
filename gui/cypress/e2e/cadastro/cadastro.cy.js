import {
  generateUniqueEmail,
  generateUniqueValidCpf,
  generateInvalidEmailFormat,
  generateStrongPassword,
  generateWeakPassword,
  generatePasswordWithSpace,
  generateRgOfLength,
  generateRepeatedDigitsCpf,
  generateMessyRg,
  generateOversizedRg,
  generateOversizedName,
} from '../../support/commands/cadastro';

const VALID_PASSWORD = 'Teste@123';
const VALID_RG = '112233445';
const VALID_PIN = '123456';

describe('Cadastro', () => {
  after(() => {
    cy.cleanTestUsersByPrefix('qa.cadastro.');
  });

  beforeEach(() => {
    cy.visit('/auth/register');
  });

  // CT-CAD-01 - skip: aguardando correcao do BUG-20 (submit final dispara reload nativo e aborta o cadastro)
  it.skip('deve concluir o cadastro com sucesso preenchendo as 4 etapas (BUG-20)', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillTransactionPin(VALID_PIN);
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectReviewStepVisible();
    cy.uiCadastroSubmit();
    cy.uiCadastroExpectSuccessToast();
  });

  // CT-CAD-02 - E-mail duplicado
  it('deve rejeitar cadastro com e-mail já cadastrado', () => {
    cy.seedTestUser().then((seededUser) => {
      cy.uiCadastroFillStepOne({
        name: 'Ana Souza',
        email: seededUser.email,
        password: VALID_PASSWORD,
      });
      cy.uiCadastroNextStep();

      cy.uiCadastroFillStepTwo({
        cpf: generateUniqueValidCpf(),
        rg: VALID_RG,
      });
      cy.uiCadastroNextStep();

      cy.uiCadastroFillTransactionPin(VALID_PIN);
      cy.uiCadastroNextStep();

      cy.uiCadastroExpectReviewStepVisible();
      cy.uiCadastroSubmit();
      cy.uiCadastroExpectErrorToast();
    });
  });

  // CT-CAD-03 - Senha fraca sem maiuscula/numero/caractere especial
  it('deve bloquear o avanço com uma senha fraca', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: generateWeakPassword(),
    });
    cy.uiCadastroExpectInlineError(
      'A senha deve incluir uma letra maiúscula, uma minúscula, um número e um caractere especial.'
    );
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-04 - E-mail em formato invalido
  it('deve bloquear o avanço com e-mail em formato inválido', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateInvalidEmailFormat(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroExpectInlineError('Insira um e-mail válido.');
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-05 - BUG-06: a mensagem de erro do Nome fica presa na tela apesar do valor
  it('deve permitir avançar com nome válido de dois nomes mesmo com a mensagem residual do BUG-06', () => {
    cy.uiCadastroTypeName('Ana');
    cy.uiCadastroExpectInlineError('O nome completo deve conter pelo menos dois nomes.');

    cy.uiCadastroTypeName(' Souza');
    cy.uiCadastroFillStepOne({
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });

    cy.uiCadastroNextButtonShouldBeEnabled();
    cy.uiCadastroNextStep();
    cy.uiCadastroExpectStepTwoVisible();
  });

  // CT-CAD-06 - RG com tamanho menor que o minimo 7 caracteres
  it('deve bloquear o avanço com RG menor que 7 caracteres', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: generateRgOfLength(3),
    });
    cy.uiCadastroExpectInlineError('RG deve ter pelo menos 7 caracteres');
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-07 - CPF com todos os digitos iguais
  it('deve bloquear o avanço com CPF de dígitos repetidos', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateRepeatedDigitsCpf(),
      rg: VALID_RG,
    });
    cy.uiCadastroExpectInlineError('Dados inválidos');
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-08 - CPF com digito verificador invalido
  it('deve bloquear o avanço com CPF de dígito verificador inválido', () => {
    const validCpf = generateUniqueValidCpf();
    const lastDigit = Number(validCpf[10]);
    const invalidCpf = validCpf.slice(0, 10) + ((lastDigit + 1) % 10);

    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: invalidCpf,
      rg: VALID_RG,
    });
    cy.uiCadastroExpectInlineError('Dados inválidos');
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-09 - Senha no limite minimo valido 8 caracteres
  it('deve permitir avançar com senha de exatamente 8 caracteres', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: generateStrongPassword(8),
    });
    cy.uiCadastroNextButtonShouldBeEnabled();
  });

  // CT-CAD-10 - Senha com espaco ou caractere nao-ASCII
  it('deve bloquear o avanço com senha contendo espaço', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: generatePasswordWithSpace(),
    });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-11 - RG no limite minimo valido exatamente 7 caracteres
  it('deve permitir avançar com RG de exatamente 7 caracteres', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: generateRgOfLength(7),
    });
    cy.uiCadastroNextButtonShouldBeEnabled();
  });

  // CT-CAD-12 - RG: caracteres nao alfanumericos sao removidos durante a digitacao
  it('deve remover automaticamente caracteres não alfanuméricos digitados no RG', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    const { typed, expected } = generateMessyRg();
    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: typed,
    });
    cy.uiCadastroRgValue().should('eq', expected);
    cy.uiCadastroNextButtonShouldBeEnabled();
  });

  // CT-CAD-13 - RG: digitacao acima de 10 caracteres e truncada pelo campo
  it('deve truncar em 10 caracteres o RG digitado com mais de 10 caracteres', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    const { typed, expected } = generateOversizedRg();
    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: typed,
    });
    cy.uiCadastroRgValue().should('eq', expected);
    cy.uiCadastroNextButtonShouldBeEnabled();
  });

  // CT-CAD-14 - skip: aguardando correcao do BUG-27 (etapa 1 aceita nome com digitos que so falha no backend)
  it.skip('deve bloquear o avanço da etapa 1 com um nome contendo dígitos (BUG-27)', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana2 Souza3',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-15 - Etapa 1 sem preenchimento
  it('deve bloquear o avanço com a etapa 1 sem preencher', () => {
    cy.uiCadastroExpectStepOneVisible();
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-16 - Etapa 1 apenas com o nome preenchido
  it('deve bloquear o avanço preenchendo apenas o nome na etapa 1', () => {
    cy.uiCadastroFillStepOne({ name: 'Ana Souza' });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-17 - Etapa 2 com CPF e RG vazios
  it('deve bloquear o avanço com CPF e RG vazios na etapa 2', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectStepTwoVisible();
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-18 - Etapa 3 com PIN incompleto
  it('deve bloquear o avanço com o PIN incompleto na etapa 3', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectStepThreeVisible();
    cy.uiCadastroFillPartialPin('123');
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-19 - Navegacao: Voltar preserva os dados da etapa 1
  it('deve preservar os dados da etapa 1 ao voltar da etapa 2', () => {
    const email = generateUniqueEmail();

    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email,
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectStepTwoVisible();
    cy.uiCadastroGoBack();

    cy.uiCadastroExpectStepOneVisible();
    cy.uiCadastroExpectFieldValue('name', 'Ana Souza');
    cy.uiCadastroExpectFieldValue('email', email);
    cy.uiCadastroExpectFieldValue('password', VALID_PASSWORD);
  });

  // CT-CAD-20 - Etapa de revisao exibe os dados preenchidos
  it('deve exibir os dados preenchidos na etapa de revisao', () => {
    const email = generateUniqueEmail();

    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email,
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillTransactionPin(VALID_PIN);
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectReviewStepVisible();
    cy.uiCadastroExpectFieldValue('name', 'Ana Souza');
    cy.uiCadastroExpectFieldValue('email', email);
    cy.uiCadastroExpectFieldValue('rg', VALID_RG);
  });

  // CT-CAD-21 - Etapa 1 apenas com o e-mail preenchido
  it('deve bloquear o avanço preenchendo apenas o e-mail na etapa 1', () => {
    cy.uiCadastroFillStepOne({ email: generateUniqueEmail() });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-22 - Etapa 1 apenas com a senha preenchida
  it('deve bloquear o avanço preenchendo apenas a senha na etapa 1', () => {
    cy.uiCadastroFillStepOne({ password: VALID_PASSWORD });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-23 - Etapa 2 apenas com o CPF preenchido
  it('deve bloquear o avanço preenchendo apenas o CPF na etapa 2', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectStepTwoVisible();
    cy.uiCadastroFillStepTwo({ cpf: generateUniqueValidCpf() });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-24 - Etapa 2 apenas com o RG preenchido
  it('deve bloquear o avanço preenchendo apenas o RG na etapa 2', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectStepTwoVisible();
    cy.uiCadastroFillStepTwo({ rg: VALID_RG });
    cy.uiCadastroNextButtonShouldBeDisabled();
  });

  // CT-CAD-25 - Navegacao: Voltar preserva os dados da etapa 2
  it('deve preservar os dados da etapa 2 ao voltar da etapa 3', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectStepThreeVisible();
    cy.uiCadastroGoBack();

    cy.uiCadastroExpectStepTwoVisible();
    cy.uiCadastroExpectFieldValue('rg', VALID_RG);
    cy.uiCadastroExpectFieldNotEmpty('cpf');
  });

  // CT-CAD-26 - Revisao: editar um campo volta para a etapa correspondente
  it('deve voltar para a etapa 1 ao editar o nome pela tela de revisao', () => {
    cy.uiCadastroFillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    });
    cy.uiCadastroNextStep();

    cy.uiCadastroFillTransactionPin(VALID_PIN);
    cy.uiCadastroNextStep();

    cy.uiCadastroExpectReviewStepVisible();
    cy.uiCadastroEditField('name');

    cy.uiCadastroExpectStepOneVisible();
    cy.uiCadastroExpectFieldValue('name', 'Ana Souza');
  });

  // CT-CAD-27 - skip: aguardando correcao do BUG-31 (nome comprido sem espaco quebra o layout da Home e do cartao de perfil)
  it.skip('não deve quebrar o layout da Home nem do cartão de perfil com um nome comprido sem espaço (BUG-31)', () => {
    const email = generateUniqueEmail();

    cy.uiCadastroRegisterCompleteFlow({
      name: generateOversizedName(),
      email,
      password: VALID_PASSWORD,
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
      pin: VALID_PIN,
    });
    cy.uiCadastroExpectSuccessToast();

    cy.visit('/');
    cy.uiLoginFillEmail(email);
    cy.uiLoginFillPassword(VALID_PASSWORD);
    cy.uiLoginSubmit();
    cy.url().should('include', '/wallet');

    cy.uiHomeExpectGreetingDoesNotOverflow();

    cy.uiPerfilOpenProfileMenu();
    cy.uiPerfilExpectProfileCardDoesNotOverflow();
  });

  // CT-CAD-28 - skip: aguardando correcao do BUG-30 (cadastro aceita RG duplicado em vez de recusar)
  it.skip('não deve aceitar o cadastro de um segundo usuário reutilizando o mesmo RG do primeiro', () => {
    cy.uiCadastroRegisterCompleteFlow({
      name: 'Bruno Lima',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
      pin: VALID_PIN,
    });
    cy.uiCadastroExpectSuccessToast();

    cy.uiCadastroRegisterCompleteFlow({
      name: 'Carla Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
      pin: VALID_PIN,
    });
    cy.uiCadastroExpectErrorToast();
  });
});
