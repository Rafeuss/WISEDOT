# Especificação de Testes — Investment (API)

Arquivo de automação correspondente: `api/cypress/e2e/investment/investment.cy.js`

## CT-API-INV-01 — Investimento com sucesso

```gherkin
Funcionalidade: Investimento via API
  Como um cliente autenticado da API
  Quero investir em um fundo informando valor e senha transacional
  Para aplicar meu dinheiro

  Cenário: deve criar um investimento com sucesso
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /investment com um valor válido e o ID de um fundo existente
    Então devo receber status 201
```

## CT-API-INV-02 — Investimento sem token

```gherkin
  Cenário: deve retornar 401 ao criar investimento sem token
    Dado que não estou autenticado na API
    Quando envio POST /investment sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-INV-03 — Valor acima do saldo disponível

```gherkin
  Cenário: deve rejeitar um investimento com valor acima do saldo disponível
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /investment com um valor superior ao saldo disponível
    Então devo receber status 400 com mensagem "Saldo insuficiente"
```

## CT-API-INV-04 — Fundo inexistente

```gherkin
  Cenário: deve retornar 404 ao investir em um fundo inexistente
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /investment informando um fundo que não existe
    Então devo receber status 404 com mensagem "Fundo não encontrado"
```

## CT-API-INV-05 — Resgate parcial com sucesso

```gherkin
  Cenário: deve resgatar parcialmente um investimento com sucesso
    Dado que já realizei um aporte em um fundo
    Quando envio POST /investment/withdraw com um valor menor que o total investido
    Então devo receber status 200 ou 201
```

## CT-API-INV-06 — Resgate com PIN incorreto

```gherkin
  Cenário: deve rejeitar o resgate quando o PIN transacional está incorreto
    Dado que já realizei um aporte em um fundo
    Quando envio POST /investment/withdraw com um PIN transacional incorreto
    Então devo receber status 401 com mensagem "Senha transacional incorreta"
```

## CT-API-INV-07 — Resgate sem token

```gherkin
  Cenário: deve retornar 401 ao resgatar investimento sem token
    Dado que já realizei um aporte em um fundo
    Quando envio POST /investment/withdraw sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-INV-08 — Resumo reflete o total investido

```gherkin
  Cenário: deve refletir o total investido no resumo após um aporte
    Dado que já realizei um aporte em um fundo
    Quando envio GET /investment/summary/{walletId}
    Então o total investido retornado deve refletir o valor do aporte
```

## CT-API-INV-09 — Investimento aparece na lista da carteira

```gherkin
  Cenário: deve listar o investimento recém-criado em wallet-investments
    Dado que já realizei um aporte em um fundo
    Quando envio GET /investment/wallet-investments/{walletId}
    Então o investimento realizado deve aparecer na lista, com o fundo correto
```

## CT-API-INV-10 — Aporte com mais de 2 casas decimais no valor

```gherkin
  Cenário: deve retornar 422 quando initialValue tem mais de 2 casas decimais
    Dado que estou autenticado com um usuário com saldo disponível
    Quando faço um aporte informando um valor com mais de 2 casas decimais
    Então o aporte deve ser rejeitado
```

## CT-API-INV-11 — Aporte com valor igual a zero

```gherkin
  Cenário: deve retornar 422 quando initialValue é igual a zero
    Dado que estou autenticado com um usuário com saldo disponível
    Quando faço um aporte informando valor igual a zero
    Então o aporte deve ser rejeitado
```

## CT-API-INV-12 — Aporte com valor negativo

```gherkin
  Cenário: deve retornar 422 quando initialValue é negativo
    Dado que estou autenticado com um usuário com saldo disponível
    Quando faço um aporte informando um valor negativo
    Então o aporte deve ser rejeitado
```

## CT-API-INV-13 — Resgate abaixo do valor mínimo permitido

```gherkin
  Cenário: deve retornar 422 quando o valor de resgate é menor que 1
    Dado que já realizei um aporte em um fundo
    Quando faço um resgate informando um valor abaixo do mínimo permitido
    Então o resgate deve ser rejeitado
```

## CT-API-INV-14 — Resgate com mais de 2 casas decimais no valor

```gherkin
  Cenário: deve retornar 422 quando o valor de resgate tem mais de 2 casas decimais
    Dado que já realizei um aporte em um fundo
    Quando faço um resgate informando um valor com mais de 2 casas decimais
    Então o resgate deve ser rejeitado
```

## CT-API-INV-15 — Resgate acima do disponível com múltiplos aportes no mesmo fundo

*Skip: aguardando confirmação do BUG-33 — não reproduzido na última verificação contra a aplicação em execução (ver `bugReport.md`).*

```gherkin
  Cenário: não deve permitir que o resgate exceda o valor disponível quando há mais de um aporte no mesmo fundo
    Dado que realizei dois ou mais aportes separados no mesmo fundo, somando um total investido conhecido
    Quando envio POST /investment/withdraw pedindo um valor maior que a soma dos aportes nesse fundo
    Então devo receber status 400 com mensagem de saldo insuficiente
    E a conta corrente não deve ser alterada
```

## CT-API-INV-16 — Resumo de investimentos sem autenticação

*Skip: aguardando correção do BUG-29 (resumo de investimentos responde com dados reais mesmo sem token).*

```gherkin
  Cenário: não deve retornar o resumo de investimentos sem token de autenticação
    Dado o walletId de uma carteira existente
    Quando envio GET /investment/summary/{walletId} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-INV-17 — Listagem de investimentos da carteira sem autenticação

*Skip: aguardando correção do BUG-29 (listagem de investimentos da carteira responde com dados reais mesmo sem token).*

```gherkin
  Cenário: não deve listar os investimentos de uma carteira sem token de autenticação
    Dado o walletId de uma carteira existente
    Quando envio GET /investment/wallet-investments/{walletId} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-INV-18 — Investir usando a carteira de outro usuário

*Skip: aguardando correção do BUG-29 (investir aceita o walletId de outro usuário e debita a conta dele).*

```gherkin
  Cenário: não deve permitir que um investimento debite a conta corrente de outro usuário
    Dado que estou autenticado com um usuário A com saldo disponível e senha transacional válida
    E conheço o walletId de um usuário B diferente de mim
    Quando envio POST /investment usando o walletId do usuário B no corpo da requisição, autenticado como usuário A
    Então a operação deve ser rejeitada com status 401
    E o saldo da conta corrente do usuário B não deve ser alterado
```
