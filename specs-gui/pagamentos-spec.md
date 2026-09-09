# Especificação de Testes — Pagamentos de Boleto (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/pagamentos/pagamentos.cy.js`
Módulo classificado como **RBT Crítico (25)** — ver `planoDeTestes.md` seção 7.8.

## CT-PAG-01 — Deve pagar um boleto com sucesso usando o código de barras válido

```gherkin
Funcionalidade: Pagamento de boleto
  Como um usuário autenticado com saldo disponível
  Quero pagar um boleto usando o código de barras
  Para quitar uma conta através da carteira digital

  Cenário: deve pagar um boleto com sucesso usando o código de barras válido
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto válido
    E avanço até o resumo do pagamento
    E confirmo o pagamento informando o PIN transacional correto
    Então devo ver a mensagem de pagamento realizado com sucesso
```

## CT-PAG-02 — Deve rejeitar boleto já pago com mensagem específica

```gherkin
  Cenário: deve rejeitar boleto já pago com mensagem específica
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto já pago
    Então devo ver a mensagem "Este boleto já foi pago"
```

## CT-PAG-03 — Deve rejeitar boleto expirado com mensagem específica

```gherkin
  Cenário: deve rejeitar boleto expirado com mensagem específica
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto expirado
    Então devo ver a mensagem "Este boleto já expirou"
```

## CT-PAG-04 — Deve exibir a mensagem "Saldo insuficiente" ao recusar o pagamento por saldo insuficiente (skip — BUG-36)

*Skip: aguardando correção do BUG-36 (pagamento recusado por saldo insuficiente falha em silêncio, sem nenhuma mensagem).*

```gherkin
  Cenário: deve exibir a mensagem "Saldo insuficiente" ao recusar o pagamento por saldo insuficiente
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto que simula saldo insuficiente
    E confirmo o pagamento com o PIN correto
    Então devo ver a mensagem "Saldo insuficiente"
```

## CT-PAG-05 — Deve rejeitar código de barras não encontrado

```gherkin
  Cenário: deve rejeitar código de barras não encontrado
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo um código de barras que não corresponde a nenhum boleto
    Então devo ver a mensagem "Código de barras inválido"
```

## CT-PAG-06 — Deve aceitar código de barras de boleto agendado e avançar para a etapa 2

```gherkin
  Cenário: deve aceitar código de barras de boleto agendado e avançar para a etapa 2
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo o código de barras de um boleto agendado/pendente
    Então devo avançar normalmente para a etapa de escolha de data
```

## CT-PAG-07 — Deve exigir o preenchimento do código de barras

```gherkin
  Cenário: deve exigir o preenchimento do código de barras
    Dado que estou autenticado e na tela de Pagamentos
    Quando clico em "Continuar" sem preencher o código de barras
    Então devo ver a mensagem "Preencha o código de barras"
```

## CT-PAG-08 — Deve rejeitar código de barras com tamanho inválido

```gherkin
  Cenário: deve rejeitar código de barras com tamanho inválido
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo um código de barras com menos dígitos que o esperado
    Então devo ver a mensagem "Preencha o código de barras"
```

## CT-PAG-09 — Deve aceitar mais de 50 dígitos no campo de código de barras sem truncar

```gherkin
  Cenário: deve aceitar mais de 50 dígitos no campo de código de barras sem truncar
    Dado que estou autenticado e na tela de Pagamentos
    Quando informo 60 dígitos no campo de código de barras
    Então o campo aceita todos os 60 dígitos sem truncar
    E, ao clicar em "Continuar", devo ver a mensagem "Preencha o código de barras" (mesma mensagem genérica de tamanho inválido)
```

## CT-PAG-10 — Deve apagar o código de barras ao voltar da etapa 2 para a etapa 1 (BUG-37)

```gherkin
  Cenário: deve apagar o código de barras ao voltar da etapa 2 para a etapa 1
    Dado que digitei um código de barras válido e avancei para a etapa 2
    Quando clico em "Voltar" (ou uso o botão de voltar do navegador)
    Então volto para a etapa 1 com o campo de código de barras vazio, exigindo redigitação
```
