# Especificação de Testes — Login (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/login/login.cy.js`

## CT-LOGIN-01 — Deve logar com sucesso usando credenciais válidas

```gherkin
Funcionalidade: Login
  Como um usuário cadastrado
  Quero acessar minha conta com e-mail e senha válidos
  Para gerenciar minha carteira digital

  Cenário: deve logar com sucesso usando credenciais válidas
    Dado que estou na tela de login
    Quando preencho o e-mail e a senha de um usuário cadastrado
    E clico em "Entrar"
    Então devo ser redirecionado para a tela da Carteira ("/wallet")
```

## CT-LOGIN-02 — Deve exibir mensagem genérica para credenciais inválidas

```gherkin
  Cenário: deve exibir mensagem genérica para credenciais inválidas
    Dado que estou na tela de login
    Quando preencho um e-mail cadastrado com uma senha incorreta
    E clico em "Entrar"
    Então devo ver a mensagem "E-mail ou senha inválidos"
    E devo permanecer na tela de login
```

## CT-LOGIN-03 — Deve bloquear submissão com e-mail em formato inválido

```gherkin
  Cenário: deve bloquear submissão com e-mail em formato inválido
    Dado que estou na tela de login
    Quando preencho um e-mail em formato inválido
    Então devo ver a mensagem "Insira um e-mail válido"
    E o botão "Entrar" deve permanecer desabilitado
```

## CT-LOGIN-04 — Deve bloquear submissão com senha menor que 8 caracteres

```gherkin
  Cenário: deve bloquear submissão com senha menor que 8 caracteres
    Dado que estou na tela de login
    Quando preencho uma senha com menos de 8 caracteres
    Então devo ver a mensagem "A senha deve ter pelo menos 8 caracteres"
    E o botão "Entrar" deve permanecer desabilitado
```

## CT-LOGIN-05 — Deve manter o botao Entrar desabilitado com campos vazios

```gherkin
  Cenário: deve manter o botao Entrar desabilitado com campos vazios
    Dado que estou na tela de login
    Então o botão "Entrar" deve estar desabilitado
```

## CT-LOGIN-06 — Deve redirecionar para o login ao acessar rotas protegidas sem sessão

```gherkin
  Cenário: deve redirecionar para o login ao acessar rotas protegidas sem sessão
    Dado que não tenho nenhuma sessão válida (sem cookie, sem localStorage)
    Quando tento acessar diretamente "/wallet", "/investment", "/payment", "/notification" ou "/wallet/extract-complete"
    Então sou redirecionado para a tela de login em todos os casos, sem nenhum dado protegido aparecer antes do redirecionamento
```

## CT-LOGIN-07 — Deve redirecionar para a Carteira ao acessar /auth/register já autenticado

```gherkin
  Cenário: deve redirecionar para a Carteira ao acessar /auth/register já autenticado
    Dado que estou autenticado
    Quando tento acessar "/auth/register" diretamente pela URL
    Então sou redirecionado para "/wallet", em vez de ver a tela de cadastro
```
