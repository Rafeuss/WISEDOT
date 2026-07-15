import CadastroPage, {
  generateUniqueEmail,
  generateUniqueValidCpf,
} from '../../support/pageObjects/CadastroPage';

const VALID_PASSWORD = 'Teste@123';
const VALID_RG = '112233445';
const VALID_PIN = '123456';

describe('Cadastro', () => {
  beforeEach(() => {
    CadastroPage.visit();
  });

  // CT-CAD-01 - Fluxo positivo completo 
  it('deve concluir o cadastro com sucesso preenchendo as 4 etapas', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    }).nextStep();

    CadastroPage.fillTransactionPin(VALID_PIN).nextStep();

    CadastroPage.expectReviewStepVisible();
    CadastroPage.submit();
    CadastroPage.expectSuccessToast();
  });

  // CT-CAD-02 - E-mail duplicado 
  it('deve rejeitar cadastro com e-mail ja cadastrado', () => {
    cy.seedTestUser().then((seededUser) => {
      CadastroPage.fillStepOne({
        name: 'Ana Souza',
        email: seededUser.email,
        password: VALID_PASSWORD,
      }).nextStep();

      CadastroPage.fillStepTwo({
        cpf: generateUniqueValidCpf(),
        rg: VALID_RG,
      }).nextStep();

      CadastroPage.fillTransactionPin(VALID_PIN).nextStep();

      CadastroPage.expectReviewStepVisible();
      CadastroPage.submit();
      CadastroPage.expectErrorToast();
    });
  });

  // CT-CAD-03 - Senha fraca sem maiuscula/numero/caractere especial
  it('deve bloquear o avanco com uma senha fraca', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: 'abcdefgh',
    });
    CadastroPage.expectInlineError(
      'A senha deve incluir uma letra maiúscula, uma minúscula, um número e um caractere especial.'
    );
    CadastroPage.nextButtonShouldBeDisabled();
  });

  // CT-CAD-04 - E-mail em formato invalido
  it('deve bloquear o avanco com e-mail em formato invalido', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: 'emailinvalido',
      password: VALID_PASSWORD,
    });
    CadastroPage.expectInlineError('Insira um e-mail válido.');
    CadastroPage.nextButtonShouldBeDisabled();
  });

  // CT-CAD-05 - BUG-06: a mensagem de erro do Nome fica presa na tela apesar do valor
  it('deve permitir avancar com nome valido de dois nomes mesmo com a mensagem residual do BUG-06', () => {
    CadastroPage.typeName('Ana');
    CadastroPage.expectInlineError('O nome completo deve conter pelo menos dois nomes.');

    CadastroPage.typeName(' Souza');
    CadastroPage.fillStepOne({
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });

    CadastroPage.nextButtonShouldBeEnabled();
    CadastroPage.nextStep();
    CadastroPage.expectStepTwoVisible();
  });

  // CT-CAD-06 - RG com tamanho menor que o minimo 7 caracteres
  it('deve bloquear o avanco com RG menor que 7 caracteres', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: '123',
    });
    CadastroPage.expectInlineError('RG deve ter pelo menos 7 caracteres');
    CadastroPage.nextButtonShouldBeDisabled();
  });

  // CT-CAD-07 - CPF com todos os digitos iguais
  it('deve bloquear o avanco com CPF de digitos repetidos', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: '11111111111',
      rg: VALID_RG,
    });
    CadastroPage.expectInlineError('Dados inválidos');
    CadastroPage.nextButtonShouldBeDisabled();
  });

  // CT-CAD-08 - CPF com digito verificador invalido
  it('deve bloquear o avanco com CPF de digito verificador invalido', () => {
    const validCpf = generateUniqueValidCpf();
    const lastDigit = Number(validCpf[10]);
    const invalidCpf = validCpf.slice(0, 10) + ((lastDigit + 1) % 10);

    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: invalidCpf,
      rg: VALID_RG,
    });
    CadastroPage.expectInlineError('Dados inválidos');
    CadastroPage.nextButtonShouldBeDisabled();
  });

  // CT-CAD-09 - Senha no limite minimo valido 8 caracteres
  it('deve permitir avancar com senha de exatamente 8 caracteres', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: 'Teste@12',
    });
    CadastroPage.nextButtonShouldBeEnabled();
  });

  // CT-CAD-10 - Senha com espaco ou caractere nao-ASCII
  it('deve bloquear o avanco com senha contendo espaco', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: 'Teste@ 123',
    });
    CadastroPage.nextButtonShouldBeDisabled();
  });

  // CT-CAD-11 - RG no limite minimo valido exatamente 7 caracteres
  it('deve permitir avancar com RG de exatamente 7 caracteres', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: '1234567',
    });
    CadastroPage.nextButtonShouldBeEnabled();
  });

  // CT-CAD-12 - RG: caracteres nao alfanumericos sao removidos durante a digitacao
  it('deve remover automaticamente caracteres nao alfanumericos digitados no RG', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: '12-345.678',
    });
    CadastroPage.rgValue().should('eq', '12345678');
    CadastroPage.nextButtonShouldBeEnabled();
  });

  // CT-CAD-13 - RG: digitacao acima de 10 caracteres e truncada pelo campo
  it('deve truncar em 10 caracteres o RG digitado com mais de 10 caracteres', () => {
    CadastroPage.fillStepOne({
      name: 'Ana Souza',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    }).nextStep();

    CadastroPage.fillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: '123456789012345',
    });
    CadastroPage.rgValue().should('eq', '1234567890');
    CadastroPage.nextButtonShouldBeEnabled();
  });

  // CT-CAD-14 - regressao BUG-27: nome com digitos passa na etapa 1 e so falha no envio final
  it('regressao BUG-27: nome com digitos avanca por todas as etapas e falha so no envio final', () => {
    CadastroPage.fillStepOne({
      name: 'Ana2 Souza3',
      email: generateUniqueEmail(),
      password: VALID_PASSWORD,
    });
    CadastroPage.nextButtonShouldBeEnabled();
    CadastroPage.nextStep();

    CadastroPage.fillStepTwo({
      cpf: generateUniqueValidCpf(),
      rg: VALID_RG,
    }).nextStep();

    CadastroPage.fillTransactionPin(VALID_PIN).nextStep();

    CadastroPage.expectReviewStepVisible();
    CadastroPage.submit();
    CadastroPage.expectErrorToast();
  });
});
