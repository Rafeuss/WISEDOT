# Especificação de Testes — Market Share / Produtos de Investimento (API)

Arquivo de automação correspondente: `api/cypress/e2e/market-share/market-share.cy.js`
Endpoints públicos (sem autenticação) — `market-share.controller.ts` não possui `@UseGuards`.

## CT-API-MKT-01 — Lista os produtos seedados

```gherkin
Funcionalidade: Consulta de produtos de investimento via API
  Como um cliente da API do AcademyWallet
  Quero listar, buscar e filtrar produtos de investimento (market shares)
  Para escolher onde investir

  Cenário: deve listar os produtos de investimento seedados
    Dado que os 14 produtos de investimento de teste foram seedados
    Quando envio GET /market-share
    Então devo receber status 200
    E a lista deve conter os produtos seedados (ex: "ARX Denial FIC FIRF CP")
```

## CT-API-MKT-02 — Busca por nome

```gherkin
  Cenário: deve filtrar corretamente por nome (busca parcial "ARX")
    Dado que os produtos de investimento de teste foram seedados, incluindo produtos com "ARX" no nome
    Quando envio GET /market-share/search?query=ARX
    Então devo receber status 200
    E todos os itens retornados devem ter "ARX" no nome
```

## CT-API-MKT-03 — Filtro por risco

```gherkin
  Cenário: deve filtrar corretamente por nível de risco
    Dado que os produtos de investimento de teste foram seedados, incluindo produtos com risco "ALTO"
    Quando envio GET /market-share/filter-by-risk?risk=ALTO
    Então devo receber status 200
    E todos os itens retornados devem ter risco "ALTO"
```

## CT-API-MKT-04 — Produto específico pelo ID

```gherkin
  Cenário: deve retornar um produto específico pelo ID
    Dado o ID de um produto de investimento existente
    Quando envio GET /market-share/{id}
    Então devo receber status 200 com os dados desse produto
```

## CT-API-MKT-05 — ID inexistente

```gherkin
  Cenário: deve retornar 404 para um ID de produto inexistente
    Dado que os produtos de investimento de teste foram seedados
    Quando envio GET /market-share/{id} com um UUID válido mas inexistente
    Então devo receber status 404
```

## CT-API-MKT-06 — Schema de um item da lista

```gherkin
  Cenário: deve respeitar o schema esperado para cada item retornado na listagem
    Dado que os produtos de investimento de teste foram seedados
    Quando envio GET /market-share
    Então cada item retornado deve respeitar o schema esperado (ajv)
```
