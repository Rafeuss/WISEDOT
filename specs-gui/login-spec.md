# Especificação de Testes — Login (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/login/login.cy.js`

## CT-LOGIN-01 — Login com sucesso

```gherkin
Funcionalidade: Login
  Como um usuário cadastrado
  Quero acessar minha conta com e-mail e senha válidos
  Para gerenciar minha carteira digital

  Cenário: Login com credenciais válidas
    Dado que estou na tela de login
    Quando preencho o e-mail e a senha de um usuário cadastrado
    E clico em "Entrar"
    Então devo ser redirecionado para a tela da Carteira ("/wallet")
```

## CT-LOGIN-02 — Credenciais inválidas

```gherkin
  Cenário: Login com senha incorreta
    Dado que estou na tela de login
    Quando preencho um e-mail cadastrado com uma senha incorreta
    E clico em "Entrar"
    Então devo ver a mensagem "E-mail ou senha inválidos"
    E devo permanecer na tela de login
```

## CT-LOGIN-03 — E-mail em formato inválido

```gherkin
  Cenário: Tentativa de login com e-mail malformado
    Dado que estou na tela de login
    Quando preencho um e-mail em formato inválido
    Então devo ver a mensagem "Insira um e-mail válido"
    E o botão "Entrar" deve permanecer desabilitado
```

## CT-LOGIN-04 — Senha abaixo do tamanho mínimo

```gherkin
  Cenário: Tentativa de login com senha muito curta
    Dado que estou na tela de login
    Quando preencho uma senha com menos de 8 caracteres
    Então devo ver a mensagem "A senha deve ter pelo menos 8 caracteres"
    E o botão "Entrar" deve permanecer desabilitado
```

## CT-LOGIN-05 — Campos vazios

```gherkin
  Cenário: Tela de login sem nenhum campo preenchido
    Dado que estou na tela de login
    Então o botão "Entrar" deve estar desabilitado
```
