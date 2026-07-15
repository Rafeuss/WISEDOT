# Especificação de Testes — Acessibilidade (UI, cypress-axe)

Arquivo de automação correspondente: `gui/cypress/e2e/acessibilidade/acessibilidade.cy.js`
Checklist de critérios WCAG monitorados: `gui/wcag-checklist.json`
Referência: WCAG 2.1, nível AA.

## CT-A11Y-01 — Scan de acessibilidade na tela de Login

```gherkin
Funcionalidade: Acessibilidade (WCAG 2.1)
  Como parte da qualidade da aplicação
  Quero garantir que as telas principais não tenham violações de acessibilidade
  Para que a aplicação seja utilizável por pessoas com deficiência

  Cenário: Scan de acessibilidade na tela de Login
    Dado que estou na tela de Login
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-02 — Scan de acessibilidade na Home

```gherkin
  Cenário: Scan de acessibilidade na tela da Carteira (Home)
    Dado que estou autenticado e na tela da Carteira (Home)
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-03 — Scan de acessibilidade em Pagamentos

```gherkin
  Cenário: Scan de acessibilidade na tela de Pagamentos
    Dado que estou autenticado e na tela de Pagamentos
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-04 — Scan de acessibilidade em Cadastro

```gherkin
  Cenário: Scan de acessibilidade na tela de Cadastro
    Dado que estou na tela de Cadastro
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-05 — Scan de acessibilidade em Recuperação de senha

```gherkin
  Cenário: Scan de acessibilidade na tela de Recuperação de senha
    Dado que estou na tela de Recuperação de senha
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-06 — Scan de acessibilidade em Investimentos

```gherkin
  Cenário: Scan de acessibilidade na tela de Investimentos
    Dado que estou autenticado e na tela de Investimentos
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-07 — Scan de acessibilidade em Notificações

```gherkin
  Cenário: Scan de acessibilidade na tela de Notificações
    Dado que estou autenticado e na tela de Notificações
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-08 — Scan de acessibilidade em Extrato completo

```gherkin
  Cenário: Scan de acessibilidade na tela de Extrato completo
    Dado que estou autenticado e na tela de Extrato completo
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-09 — Scan de acessibilidade em Pagamentos, etapa 2

```gherkin
  Cenário: Scan de acessibilidade na etapa "Para quando?" do pagamento
    Dado que estou autenticado e cheguei na etapa 2 do pagamento de boleto
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```

## CT-A11Y-10 — Scan de acessibilidade em Pagamentos, etapa 3

```gherkin
  Cenário: Scan de acessibilidade no resumo do pagamento
    Dado que estou autenticado e cheguei na etapa de resumo do pagamento de boleto
    Quando executo o scan de acessibilidade (axe-core)
    Então não devem existir violações de acessibilidade
```
