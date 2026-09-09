# Especificação de Testes — Acessibilidade (UI, cypress-axe)

Arquivo de automação correspondente: `gui/cypress/e2e/acessibilidade/acessibilidade.cy.js`
Checklist de critérios WCAG monitorados: `gui/wcag-checklist.json`
Referência: WCAG 2.1, nível AA.

## CT-A11Y-01 — Não deve ter violações de acessibilidade na tela de Login

```gherkin
Funcionalidade: Acessibilidade (WCAG 2.1)
  Como parte da qualidade da aplicação
  Quero garantir que as telas principais não tenham violações de acessibilidade
  Para que a aplicação seja utilizável por pessoas com deficiência

  Cenário: não deve ter violações de acessibilidade na tela de Login
    Dado que estou na tela de Login
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-02 — Não deve ter violações de acessibilidade na tela da Carteira (Home)

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela da Carteira (Home)
    Dado que estou autenticado e na tela da Carteira (Home)
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-03 — Não deve ter violações de acessibilidade na tela de Pagamentos

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela de Pagamentos
    Dado que estou autenticado e na tela de Pagamentos
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-04 — Não deve ter violações de acessibilidade na tela de Cadastro

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela de Cadastro
    Dado que estou na tela de Cadastro
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-05 — Não deve ter violações de acessibilidade na tela de Recuperação de senha

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela de Recuperação de senha
    Dado que estou na tela de Recuperação de senha
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-06 — Não deve ter violações de acessibilidade na tela de Investimentos

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela de Investimentos
    Dado que estou autenticado e na tela de Investimentos
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-07 — Não deve ter violações de acessibilidade na tela de Notificações

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela de Notificações
    Dado que estou autenticado e na tela de Notificações
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-08 — Não deve ter violações de acessibilidade na tela de Extrato completo

```gherkin
  Cenário: não deve ter violações de acessibilidade na tela de Extrato completo
    Dado que estou autenticado e na tela de Extrato completo
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-09 — Não deve ter violações de acessibilidade na etapa 2 de Pagamentos (Para quando?)

```gherkin
  Cenário: não deve ter violações de acessibilidade na etapa 2 de Pagamentos (Para quando?)
    Dado que estou autenticado e cheguei na etapa 2 do pagamento de boleto
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-10 — Não deve ter violações de acessibilidade na etapa 3 de Pagamentos (Resumo)

```gherkin
  Cenário: não deve ter violações de acessibilidade na etapa 3 de Pagamentos (Resumo)
    Dado que estou autenticado e cheguei na etapa de resumo do pagamento de boleto
    Quando realizo a verificação de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```
