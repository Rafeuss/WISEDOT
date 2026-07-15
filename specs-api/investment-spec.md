# Especificação de Testes — Investment (API)

Arquivo de automação correspondente: `api/cypress/e2e/investment/investment.cy.js`

## CT-API-INV-01 — Investimento com sucesso

```gherkin
Funcionalidade: Investimento via API
  Como um cliente autenticado da API
  Quero investir em um fundo informando valor e senha transacional
  Para aplicar meu dinheiro

  Cenário: Aporte válido com saldo suficiente
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /investment com um valor válido e o ID de um fundo existente
    Então devo receber status 201
```

## CT-API-INV-01b — Sem token

```gherkin
  Cenário: Investimento sem autenticação
    Quando envio POST /investment sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-INV-02 — Valor acima do saldo disponível

```gherkin
  Cenário: Aporte com valor acima do saldo em conta corrente
    Quando envio POST /investment com um valor superior ao saldo disponível
    Então devo receber status 400 com mensagem "Saldo insuficiente"
```

## CT-API-INV-02b — Fundo inexistente

```gherkin
  Cenário: Aporte em um fundo inexistente
    Quando envio POST /investment informando um fundo que não existe
    Então devo receber status 404 com mensagem "Fundo não encontrado"
```

## CT-API-INV-03 — Resgate parcial com sucesso

```gherkin
  Cenário: Resgate parcial de um investimento já realizado
    Dado que já realizei um aporte em um fundo
    Quando envio POST /investment/withdraw com um valor menor que o total investido
    Então devo receber status 200 ou 201
```

## CT-API-INV-04 — Resgate com PIN incorreto

```gherkin
  Cenário: Resgate rejeitado por PIN transacional incorreto
    Dado que já realizei um aporte em um fundo
    Quando envio POST /investment/withdraw com um PIN transacional incorreto
    Então devo receber status 401 com mensagem "Senha transacional incorreta"
```

## CT-API-INV-04b — Sem token

```gherkin
  Cenário: Resgate sem autenticação
    Quando envio POST /investment/withdraw sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-INV-05 — Resumo reflete o total investido

```gherkin
  Cenário: Resumo de investimentos após um aporte
    Dado que já realizei um aporte em um fundo
    Quando envio GET /investment/summary/{walletId}
    Então o total investido retornado deve refletir o valor do aporte
```

## CT-API-INV-06 — Investimento aparece na lista da carteira

```gherkin
  Cenário: Listagem dos investimentos da carteira
    Dado que já realizei um aporte em um fundo
    Quando envio GET /investment/wallet-investments/{walletId}
    Então o investimento realizado deve aparecer na lista, com o fundo correto
```

## CT-API-INV-07 a 09 — O valor investido deve aceitar no máximo 2 casas decimais e ser maior que zero

```gherkin
  Cenário: Aporte com mais de 2 casas decimais no valor
    Quando faço um aporte informando um valor com mais de 2 casas decimais
    Então o aporte deve ser rejeitado

  Cenário: Aporte com valor igual a zero
    Quando faço um aporte informando valor igual a zero
    Então o aporte deve ser rejeitado

  Cenário: Aporte com valor negativo
    Quando faço um aporte informando um valor negativo
    Então o aporte deve ser rejeitado
```

## CT-API-INV-10 e 11 — O valor de resgate deve aceitar no máximo 2 casas decimais e ter um mínimo permitido

```gherkin
  Cenário: Resgate abaixo do valor mínimo permitido
    Quando faço um resgate informando um valor abaixo do mínimo permitido
    Então o resgate deve ser rejeitado

  Cenário: Resgate com mais de 2 casas decimais no valor
    Quando faço um resgate informando um valor com mais de 2 casas decimais
    Então o resgate deve ser rejeitado
```

