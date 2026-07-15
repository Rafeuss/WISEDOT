# Especificação de Testes — Carteira / Home (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/carteira/carteira.cy.js`
Módulo classificado como **RBT Alto (15)** — ver `planoDeTestes.md` seção 7.8.
Onboarding classificado como **RBT Baixo (2)**.

## CT-CART-01 — Saldo exibido corretamente após seed

```gherkin
Funcionalidade: Carteira (Home)
  Como um usuário autenticado
  Quero consultar o saldo da minha conta corrente
  Para acompanhar minha vida financeira na carteira digital

  Cenário: Saldo da conta corrente igual ao valor seedado
    Dado que estou autenticado com o usuário de teste (saldo R$ 10.000,00)
    E estou na tela da Carteira (Home)
    Quando revelo o saldo (clico no ícone de olho)
    Então devo ver o valor "R$ 10.000,00"
```

## CT-CART-02 — Toggle de mascarar/revelar saldo

```gherkin
  Cenário: Alternar entre saldo mascarado e saldo revelado
    Dado que estou autenticado e na tela da Carteira (Home)
    Então o saldo deve iniciar mascarado ("••••••")
    Quando clico no ícone de olho
    Então devo ver o valor do saldo
    Quando clico novamente no ícone de olho
    Então o saldo deve voltar a ficar mascarado
```

## CT-CART-03 — Tour de onboarding no primeiro acesso

```gherkin
  Cenário: Tour de onboarding aparece no primeiro acesso de um usuário novo
    Dado que acabei de concluir o cadastro de um usuário novo
    Quando faço login pela primeira vez com esse usuário
    E sou redirecionado para a Carteira (Home)
    Então devo ver o tour de onboarding guiado (Shepherd.js)
```
