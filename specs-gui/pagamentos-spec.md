# Especificação de Testes — Pagamentos de Boleto (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/pagamentos/pagamentos.cy.js`
Módulo classificado como **RBT Crítico (25)** — ver `planoDeTestes.md` seção 7.8.

## CT-PAG-01 — Pagamento com sucesso

```gherkin
Funcionalidade: Pagamento de boleto
  Como um usuário autenticado com saldo disponível
  Quero pagar um boleto usando o código de barras
  Para quitar uma conta através da carteira digital

  Cenário: Pagamento de boleto válido com saldo suficiente
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto válido
    E avanço até o resumo do pagamento
    E confirmo o pagamento informando o PIN transacional correto
    Então devo ver a mensagem de pagamento realizado com sucesso
```

## CT-PAG-02 — Boleto já pago

```gherkin
  Cenário: Tentativa de pagamento de boleto já quitado
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto já pago
    Então devo ver a mensagem "Este boleto já foi pago"
```

## CT-PAG-03 — Boleto expirado

```gherkin
  Cenário: Tentativa de pagamento de boleto expirado
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto expirado
    Então devo ver a mensagem "Este boleto já expirou"
```

## CT-PAG-04 — Saldo insuficiente

```gherkin
  Cenário: Pagamento com saldo insuficiente na conta
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto que simula saldo insuficiente
    E confirmo o pagamento com o PIN correto
    Então devo ver a mensagem de saldo insuficiente
```

## CT-PAG-05 — Boleto não encontrado

```gherkin
  Cenário: Código de barras não localizado
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo um código de barras que não corresponde a nenhum boleto
    Então devo ver a mensagem "Código de barras inválido"
```

## CT-PAG-06 — Boleto agendado/pendente

```gherkin
  Cenário: Código de barras de boleto agendado
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto agendado/pendente
    Então devo avançar normalmente para a etapa de escolha de data
```

## CT-PAG-07 — Código de barras vazio

```gherkin
  Cenário: Tentativa de avançar sem informar o código de barras
    Dado que estou autenticado e na tela de Pagamentos
    Quando clico em "Continuar" sem preencher o código de barras
    Então devo ver a mensagem "Preencha o código de barras"
```

## CT-PAG-08 — Código de barras com tamanho inválido

```gherkin
  Cenário: Código de barras preenchido com tamanho inválido
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo um código de barras com menos dígitos que o esperado
    Então devo ver a mensagem "Preencha o código de barras"
```
