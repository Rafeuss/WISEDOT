# Especificação de Testes — Wallet (API)

Arquivo de automação correspondente: `api/cypress/e2e/wallet/wallet.cy.js`

## CT-API-WAL-01 — Saldo correto da carteira autenticada

```gherkin
Funcionalidade: Consulta de carteira via API
  Como um cliente autenticado da API
  Quero consultar os dados da minha carteira
  Para ver meu saldo em conta corrente e em investimentos

  Cenário: deve retornar o saldo correto da carteira do usuário autenticado
    Dado que estou autenticado com um usuário com carteira recém-criada (saldo de R$ 10.000,00)
    Quando envio GET /wallet/{walletId} com o walletId dessa carteira
    Então devo receber status 200
    E o saldo em conta corrente retornado deve ser R$ 10.000,00
```

## CT-API-WAL-02 — Sem token

```gherkin
  Cenário: deve retornar 401 ao buscar a carteira sem token
    Dado que existe uma carteira cadastrada com um walletId válido
    Quando envio GET /wallet/{walletId} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-WAL-03 — Carteira de outro usuário / inexistente

```gherkin
  Cenário: deve rejeitar o acesso a uma carteira que não pertence ao usuário autenticado
    Dado que estou autenticado com um usuário válido
    Quando envio GET /wallet/{walletId} informando um walletId que não é o meu
    Então devo receber status 401 com mensagem de permissão negada
```
