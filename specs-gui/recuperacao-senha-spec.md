# Especificação de Testes — Recuperação de Senha (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/recuperacao-senha/recuperacao-senha.cy.js`
Módulo classificado como **RBT Alto (15)** — ver `planoDeTestes.md` seção 7.8.

## CT-REC-01 — E-mail em formato inválido mantém botão desabilitado

```gherkin
Funcionalidade: Recuperação de senha
  Como um usuário cadastrado que esqueceu a senha
  Quero solicitar a recuperação usando meu e-mail
  Para redefinir minha senha de acesso

  Cenário: E-mail em formato inválido
    Dado que estou na tela "Esqueceu sua senha?"
    Quando preencho um e-mail em formato inválido
    Então o botão "Enviar" deve permanecer desabilitado
```

## CT-REC-02 — E-mail válido e cadastrado (BUG-04)

```gherkin
  Cenário: Solicitação de recuperação com e-mail válido e cadastrado
    Dado que estou na tela "Esqueceu sua senha?"
    Quando informo o e-mail de um usuário cadastrado
    E clico em "Enviar"
    Então a tela permanece na etapa 1, sem avançar para a etapa de código (OTP)
    E nenhuma mensagem de erro é exibida ao usuário
```

## CT-REC-03 — Campo de e-mail vazio

```gherkin
  Cenário: Tela sem nenhum campo preenchido
    Dado que estou na tela "Esqueceu sua senha?"
    Então o botão "Enviar" deve estar desabilitado
```
