# Especificação de Testes — Paid Slips / Pagamento de Boleto (API)

Arquivo de automação correspondente: `api/cypress/e2e/paid-slips/paid-slips.cy.js`
Módulo classificado como **RBT Crítico (25)** — ver `planoDeTestes.md` seção 7.8.

## CT-API-PAG-01 — Pagamento com sucesso

```gherkin
Funcionalidade: Pagamento de boleto via API
  Como um cliente autenticado da API
  Quero pagar um boleto informando código de barras e PIN transacional
  Para quitar uma conta

  Cenário: Pagamento de boleto válido com saldo suficiente
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /paid-slips com o código de barras de sucesso
    Então devo receber status 200 ou 201
```

## CT-API-PAG-02 a 06 — Cenários de código de barras

```gherkin
  Cenário: Boleto já pago
    Quando envio POST /paid-slips com o código de barras de boleto já pago
    Então devo receber status 409 com mensagem "Boleto ja esta pago"

  Cenário: Boleto expirado
    Quando envio POST /paid-slips com o código de barras de boleto expirado
    Então devo receber status 409 com mensagem "Boleto expirado"

  Cenário: Saldo insuficiente
    Quando envio POST /paid-slips com o código de barras que simula saldo insuficiente
    Então devo receber status 400 com mensagem "saldo insuficiente"

  Cenário: Boleto não encontrado
    Quando envio POST /paid-slips com um código de barras inexistente
    Então devo receber status 400 ou 404

  Cenário: Boleto agendado/pendente
    Quando envio POST /paid-slips com o código de barras de boleto agendado
    Então devo receber status 200 ou 201
```

## CT-API-PAG-07 — Código de barras com tamanho inválido

```gherkin
  Cenário: Código de barras com tamanho incorreto
    Quando envio POST /paid-slips com um código de barras de tamanho inválido
    Então devo receber status 409
```

## CT-API-PAG-08 — PIN transacional incorreto (contrato de segurança)

```gherkin
  Cenário: PIN incorreto rejeitado pelo backend
    Dado que criptografei um PIN diferente do PIN cadastrado do usuário
    Quando envio POST /paid-slips com esse PIN incorreto
    Então devo receber status 401 com mensagem "Senha transacional incorreta"
```

## CT-API-PAG-09 — Consulta de boleto (GET)

```gherkin
  Cenário: Consulta dos dados de um boleto pelo código de barras
    Quando envio GET /paid-slips/{codigoDeBarras} com um código válido
    Então devo receber status 200 com os dados do boleto (valor, beneficiário)
```

## CT-API-PAG-09b — Consulta de boleto sem token

```gherkin
  Cenário: Consulta de boleto sem autenticação
    Quando envio GET /paid-slips/{codigoDeBarras} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-PAG-10 — Boletos pendentes: lista vazia

```gherkin
  Cenário: Consulta de boletos pendentes sem nenhuma pendência
    Dado que estou autenticado e não tenho boletos agendados
    Quando envio GET /paid-slips/pendent
    Então devo receber status 200 com uma lista vazia
```

## CT-API-PAG-11 — Boletos pendentes: fluxo positivo

```gherkin
  Cenário: Boleto agendado aparece na lista de pendentes
    Dado que paguei um boleto com código de barras agendado/pendente
    Quando envio GET /paid-slips/pendent
    Então devo receber status 200 com esse boleto na lista
```

## CT-API-PAG-12 — Boletos pendentes sem token

```gherkin
  Cenário: Consulta de boletos pendentes sem autenticação
    Quando envio GET /paid-slips/pendent sem informar o header Authorization
    Então devo receber status 401
```
