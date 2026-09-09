# Especificação de Testes — Paid Slips / Pagamento de Boleto (API)

Arquivo de automação correspondente: `api/cypress/e2e/paid-slips/paid-slips.cy.js`
Módulo classificado como **RBT Crítico (25)** — ver `planoDeTestes.md` seção 7.8.

## CT-API-PAG-01 — Pagamento com sucesso

```gherkin
Funcionalidade: Pagamento de boleto via API
  Como um cliente autenticado da API
  Quero pagar um boleto informando código de barras e PIN transacional
  Para quitar uma conta

  Cenário: deve pagar um boleto válido com sucesso
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /paid-slips com o código de barras de sucesso
    Então devo receber status 200 ou 201
```

## CT-API-PAG-02 — Boleto já pago

```gherkin
  Cenário: deve rejeitar boleto já pago
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /paid-slips com o código de barras de boleto já pago
    Então devo receber status 409 com mensagem "Boleto ja esta pago"
```

## CT-API-PAG-03 — Boleto expirado

```gherkin
  Cenário: deve rejeitar boleto expirado
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /paid-slips com o código de barras de boleto expirado
    Então devo receber status 409 com mensagem "Boleto expirado"
```

## CT-API-PAG-04 — Saldo insuficiente

```gherkin
  Cenário: deve rejeitar pagamento com saldo insuficiente
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /paid-slips com o código de barras que simula saldo insuficiente
    Então devo receber status 400 com mensagem "saldo insuficiente"
```

## CT-API-PAG-05 — Boleto não encontrado

```gherkin
  Cenário: deve retornar erro para código de barras não encontrado
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /paid-slips com um código de barras inexistente
    Então devo receber status 400 ou 404
```

## CT-API-PAG-06 — Boleto agendado/pendente

```gherkin
  Cenário: deve aceitar boleto agendado/pendente
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /paid-slips com o código de barras de boleto agendado
    Então devo receber status 200 ou 201
```

## CT-API-PAG-07 — Código de barras com tamanho inválido

```gherkin
  Cenário: deve rejeitar código de barras com tamanho inválido
    Dado que estou autenticado com um usuário com saldo disponível
    Quando envio POST /paid-slips com um código de barras de tamanho inválido
    Então devo receber status 409
```

## CT-API-PAG-08 — PIN transacional incorreto (contrato de segurança)

```gherkin
  Cenário: deve rejeitar pagamento quando o PIN transacional esta incorreto
    Dado que criptografei um PIN diferente do PIN cadastrado do usuário
    Quando envio POST /paid-slips com esse PIN incorreto
    Então devo receber status 401 com mensagem "Senha transacional incorreta"
```

## CT-API-PAG-09 — Consulta de boleto (GET)

```gherkin
  Cenário: deve consultar os dados de um boleto válido pelo código de barras
    Dado que estou autenticado com um usuário válido
    Quando envio GET /paid-slips/{codigoDeBarras} com um código válido
    Então devo receber status 200 com os dados do boleto (valor, beneficiário)
```

## CT-API-PAG-10 — Consulta de boleto sem token

```gherkin
  Cenário: deve retornar 401 ao consultar um boleto sem token
    Dado que não estou autenticado (não possuo token de acesso)
    Quando envio GET /paid-slips/{codigoDeBarras} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-PAG-11 — Boletos pendentes: lista vazia

```gherkin
  Cenário: deve retornar lista vazia de boletos pendentes para um usuário sem pendências
    Dado que estou autenticado e não tenho boletos agendados
    Quando envio GET /paid-slips/pendent
    Então devo receber status 200 com uma lista vazia
```

## CT-API-PAG-12 — Boletos pendentes: fluxo positivo

```gherkin
  Cenário: deve listar um boleto agendado/pendente após o pagamento
    Dado que paguei um boleto com código de barras agendado/pendente
    Quando envio GET /paid-slips/pendent
    Então devo receber status 200 com esse boleto na lista
```

## CT-API-PAG-13 — Boletos pendentes sem token

```gherkin
  Cenário: deve retornar 401 ao listar boletos pendentes sem token
    Dado que não estou autenticado (não possuo token de acesso)
    Quando envio GET /paid-slips/pendent sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-PAG-14 — Pagamento de boleto debitando a carteira de outro usuário

*Skip: aguardando correção do BUG-29 (pagamento de boleto aceita o walletId de outro usuário e debita a conta dele).*

```gherkin
  Cenário: não deve permitir que o pagamento de um boleto debite a conta corrente de outro usuário
    Dado que estou autenticado com um usuário A com senha transacional válida
    E conheço o walletId de um usuário B diferente de mim, com saldo suficiente para o boleto
    Quando envio POST /paid-slips usando o walletId do usuário B no corpo da requisição, autenticado como usuário A
    Então a operação deve ser rejeitada com status 401
    E o saldo da conta corrente do usuário B não deve ser alterado
```
