# Especificação de Testes — Current Account (API)

Arquivo de automação correspondente: `api/cypress/e2e/current-account/current-account.cy.js`

## CT-API-CTA-01 — Consulta sem token responde (nenhum guard aplicado)

*Skip: aguardando correção do BUG-22 (nenhum endpoint deste módulo exige autenticação).*

```gherkin
Funcionalidade: Consulta e alteração de conta corrente via API
  Como um usuário sem autenticação
  Quero verificar se os endpoints de conta corrente respondem sem token
  Para confirmar a ausência de controle de acesso no módulo

  Cenário: não deve responder a uma consulta de conta corrente sem token de autenticação
    Dado o id de uma conta corrente existente
    Quando envio GET /current-account/{id} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-CTA-02 — Listagem não retorna dados

*Skip: aguardando correção do BUG-22 (GET /current-account sempre retorna `data: null`).*

```gherkin
  Cenário: deve retornar a listagem de contas correntes com os dados reais das contas cadastradas
    Dado que existem contas correntes cadastradas no sistema, e estou autenticado
    Quando envio GET /current-account
    Então devo receber status 200 com os dados reais das contas
```

## CT-API-CTA-03 — Consulta de uma conta existente também não retorna dados

*Skip: aguardando correção do BUG-22 (findOne retorna `data: null` mesmo com o registro existindo).*

```gherkin
  Cenário: não deve retornar dados nulos ao consultar uma conta corrente existente pelo id
    Dado o id de uma conta corrente existente
    Quando envio GET /current-account/{id}
    Então devo receber status 200 com os dados reais da conta corrente
```

## CT-API-CTA-04 — Id inexistente

*Skip: aguardando correção do BUG-22 (id inexistente retorna 500 em vez de 404).*

```gherkin
  Cenário: deve retornar 404 ao consultar uma conta corrente com id inexistente
    Dado um UUID em formato válido que não corresponde a nenhuma conta corrente cadastrada, e estou autenticado
    Quando envio GET /current-account/{id} com um UUID válido mas inexistente
    Então devo receber status 404
```

## CT-API-CTA-05 — Criação sem token

*Skip: aguardando correção do BUG-22 (POST sem token só é barrado pela whitelist do DTO, não por exigir autenticação).*

```gherkin
  Cenário: não deve responder a uma criação de conta corrente sem token de autenticação
    Dado os dados para criação de uma nova conta corrente
    Quando envio POST /current-account sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-CTA-06 — Alteração também não aceita informar o saldo diretamente

*Skip: aguardando correção do BUG-22 (PATCH sem token só é barrado pela whitelist do DTO, não por exigir autenticação).*

```gherkin
  Cenário: deve rejeitar a alteração de uma conta corrente quando o saldo é informado diretamente, sem alterar o saldo real
    Dado o id de uma conta corrente existente
    Quando envio PATCH /current-account/{id} informando um novo saldo, sem token
    Então devo receber status 401, por falta de autenticação
    E o saldo da conta não deve ser alterado
```

## CT-API-CTA-07 — PATCH com corpo vazio

*Skip: aguardando correção do BUG-22 (PATCH com corpo vazio quebra com 500).*

```gherkin
  Cenário: deve retornar 400 ao alterar uma conta corrente com corpo vazio
    Dado o id de uma conta corrente existente, e estou autenticado
    Quando envio PATCH /current-account/{id} com corpo vazio
    Então devo receber status 400
```

## CT-API-CTA-08 — DELETE não remove o registro

*Skip: aguardando correção do BUG-22 (DELETE responde sucesso mas não remove o registro).*

```gherkin
  Cenário: deve remover de fato o registro do banco de dados ao excluir uma conta corrente
    Dado o id de uma conta corrente existente, e estou autenticado
    Quando envio DELETE /current-account/{id}
    Então devo receber status 200
    E o registro não deve mais existir no banco
```
