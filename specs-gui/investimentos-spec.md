# Especificação de Testes — Investimentos (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/investimentos/investimentos.cy.js`
Módulo classificado como **RBT Alto (20)** — ver `planoDeTestes.md` seção 7.8.

## CT-INV-01 — Listagem de produtos

```gherkin
Funcionalidade: Investimentos
  Como um usuário autenticado
  Quero consultar, investir e resgatar produtos de investimento
  Para gerenciar minha carteira de investimentos

  Cenário: Listagem dos produtos disponíveis
    Dado que estou autenticado e na tela de Investimentos
    Então devo ver os produtos de investimento cadastrados
```

## CT-INV-02 — Busca por nome do fundo

```gherkin
  Cenário: Busca por nome de fundo
    Dado que estou autenticado e na tela de Investimentos
    Quando busco por "ARX" no campo de nome do fundo
    Então devo ver apenas os fundos cujo nome contém "ARX"
    E não devo ver fundos de outros nomes
```

## CT-INV-03 — Filtro por risco

```gherkin
  Cenário: Filtro por nível de risco
    Dado que estou autenticado e na tela de Investimentos
    Quando aplico o filtro de risco "Alto"
    Então devo ver apenas os fundos classificados como risco "Alto"
```

## CT-INV-04 — Investir com sucesso

```gherkin
  Cenário: Investimento com sucesso dentro do saldo disponível
    Dado que estou autenticado e na tela de Investimentos
    Quando escolho um fundo e informo um valor dentro do meu saldo disponível
    E confirmo com o PIN transacional correto
    Então devo ver a mensagem de investimento realizado com sucesso
    E o fundo deve aparecer em "Meus investimentos"
```

## CT-INV-05 — Resgate parcial com sucesso

```gherkin
  Cenário: Resgate parcial de um investimento existente
    Dado que já realizei um investimento em um fundo
    Quando solicito o resgate parcial de um valor menor que o total investido
    E confirmo com o PIN transacional correto
    Então devo ver a mensagem de resgate realizado com sucesso
```

## CT-INV-06 — Investimento acima do saldo disponível

```gherkin
  Cenário: Tentativa de investir um valor maior que o saldo disponível
    Dado que estou autenticado e na tela de Investimentos
    Quando tento investir um valor maior que o meu saldo disponível
    E confirmo com o PIN transacional correto
    Então devo ver a mensagem de saldo insuficiente
```
