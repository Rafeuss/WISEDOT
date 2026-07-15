# Especificação de Testes — Current Account (API)

Arquivo de automação correspondente: `api/cypress/e2e/current-account/current-account.cy.js`

## CT-API-CTA-01 — Consulta sem token responde (nenhum guard aplicado)

```gherkin
Funcionalidade: Consulta e alteração de conta corrente via API
  Como um usuário sem autenticação
  Quero verificar se os endpoints de conta corrente respondem sem token
  Para confirmar a ausência de controle de acesso no módulo

  Cenário: Consulta de uma conta corrente sem token
    Quando envio GET /current-account/{id} sem informar o header Authorization
    Então devo receber status 200
```

## CT-API-CTA-02 — Listagem não retorna dados

```gherkin
  Cenário: Listagem de contas correntes
    Quando envio GET /current-account
    Então devo receber status 200, sem nenhum dado retornado
```

## CT-API-CTA-03 — Consulta de uma conta existente também não retorna dados

```gherkin
  Cenário: Consulta de uma conta corrente existente
    Dado o id de uma conta corrente existente
    Quando envio GET /current-account/{id}
    Então devo receber status 200, sem nenhum dado retornado, mesmo o registro existindo
```

## CT-API-CTA-04 — Id inexistente

```gherkin
  Cenário: Consulta com id em formato válido mas inexistente
    Quando envio GET /current-account/{id} com um UUID válido mas inexistente
    Então devo receber status 500 não tratado
```

## CT-API-CTA-05 — Criação não aceita informar o saldo diretamente

```gherkin
  Cenário: Criação de conta corrente
    Quando envio POST /current-account informando um saldo inicial
    Então devo receber status 422, rejeitando a tentativa
```

## CT-API-CTA-06 — Alteração também não aceita informar o saldo diretamente

```gherkin
  Cenário: Alteração de saldo sem autenticação
    Dado o id de uma conta corrente existente
    Quando envio PATCH /current-account/{id} informando um novo saldo, sem token
    Então devo receber status 422
    E o saldo da conta não deve ser alterado
```

## CT-API-CTA-07 — PATCH com corpo vazio

```gherkin
  Cenário: Alteração de conta corrente sem nenhum campo
    Dado o id de uma conta corrente existente
    Quando envio PATCH /current-account/{id} com corpo vazio
    Então devo receber status 500 não tratado
```

## CT-API-CTA-08 — DELETE não remove o registro

```gherkin
  Cenário: Remoção de uma conta corrente
    Dado o id de uma conta corrente existente
    Quando envio DELETE /current-account/{id}
    Então devo receber status 200
    E o registro deve permanecer no banco
```
