# Especificação de Testes — Carteira / Home (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/carteira/carteira.cy.js`
Módulo classificado como **RBT Alto (15)** — ver `planoDeTestes.md` seção 7.8.
Onboarding classificado como **RBT Baixo (2)**.

## CT-CART-01 — Deve exibir o saldo em conta corrente igual ao valor seedado

```gherkin
Funcionalidade: Carteira (Home)
  Como um usuário autenticado
  Quero consultar o saldo da minha conta corrente
  Para acompanhar minha vida financeira na carteira digital

  Cenário: deve exibir o saldo em conta corrente igual ao valor seedado
    Dado que estou autenticado com o usuário de teste (saldo R$ 10.000,00)
    E estou na tela da Carteira (Home)
    Quando revelo o saldo (clico no ícone de olho)
    Então devo ver o valor "R$ 10.000,00"
```

## CT-CART-02 — Deve alternar entre saldo mascarado e saldo revelado

```gherkin
  Cenário: deve alternar entre saldo mascarado e saldo revelado
    Dado que estou autenticado e na tela da Carteira (Home)
    Então o saldo deve iniciar mascarado ("••••••")
    Quando clico no ícone de olho
    Então devo ver o valor do saldo
    Quando clico novamente no ícone de olho
    Então o saldo deve voltar a ficar mascarado
```

## CT-CART-03 — Deve exibir o tour de onboarding no primeiro acesso de um usuário recém-cadastrado (skip — BUG-20)

*Skip: bloqueado pelo BUG-20 (o cadastro pela UI não conclui; o cenário depende de um usuário recém-cadastrado).*

```gherkin
  Cenário: deve exibir o tour de onboarding no primeiro acesso de um usuário recém-cadastrado
    Dado que acabei de concluir o cadastro de um usuário novo
    Quando faço login pela primeira vez com esse usuário
    E sou redirecionado para a Carteira (Home)
    Então devo ver o tour de onboarding guiado (Shepherd.js)
```

## CT-CART-04 — Deve carregar a tela de extrato completo ao acessar a URL direta

```gherkin
  Cenário: deve carregar a tela de extrato completo ao acessar a URL direta
    Dado que estou autenticado
    Quando acesso diretamente a URL "/wallet/extract-complete"
    Então a tela de extrato completo carrega normalmente, com filtro por período e botão "Exportar"
```

## CT-CART-06 — Deve exibir na Home um acesso (link) para o extrato completo (skip — BUG-05)

*Skip: aguardando correção do BUG-05 (a Home não oferece nenhum acesso ao extrato completo).*

```gherkin
  Cenário: deve exibir na Home um acesso (link) para o extrato completo
    Dado que estou autenticado e na Carteira (Home)
    Então deve existir um link, botão ou "ver mais" apontando para o extrato completo
```

## CT-CART-05 — Não deve reexibir o tour de onboarding após limpar o localStorage e o sessionStorage (skip — BUG-20)

*Skip: bloqueado pelo BUG-20 (o cadastro pela UI não conclui; o cenário depende de um usuário recém-cadastrado).*

```gherkin
  Cenário: não deve reexibir o tour de onboarding após limpar o localStorage e o sessionStorage
    Dado que já completei ou pulei o tour de onboarding uma vez (firstAccess = false)
    Quando limpo o localStorage e o sessionStorage do navegador e recarrego a Carteira (Home)
    Então o tour de onboarding não aparece novamente (o controle é feito pelo backend, não pelo navegador)
```
