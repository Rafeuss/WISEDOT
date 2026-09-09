# Especificação de Testes — Investimentos (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/investimentos/investimentos.cy.js`
Módulo classificado como **RBT Alto (20)** — ver `planoDeTestes.md` seção 7.8.

## CT-INV-01 — Deve listar os produtos de investimento disponíveis

```gherkin
Funcionalidade: Investimentos
  Como um usuário autenticado
  Quero consultar, investir e resgatar produtos de investimento
  Para gerenciar minha carteira de investimentos

  Cenário: deve listar os produtos de investimento disponíveis
    Dado que estou autenticado e na tela de Investimentos
    Então devo ver os produtos de investimento cadastrados
```

## CT-INV-02 — Deve filtrar corretamente ao buscar por nome do fundo

```gherkin
  Cenário: deve filtrar corretamente ao buscar por nome do fundo
    Dado que estou autenticado e na tela de Investimentos
    Quando busco por "ARX" no campo de nome do fundo
    Então devo ver apenas os fundos cujo nome contém "ARX"
    E não devo ver fundos de outros nomes
```

## CT-INV-03 — Deve filtrar corretamente por risco Alto

```gherkin
  Cenário: deve filtrar corretamente por risco Alto
    Dado que estou autenticado e na tela de Investimentos
    Quando aplico o filtro de risco "Alto"
    Então devo ver apenas os fundos classificados como risco "Alto"
```

## CT-INV-04 — Deve investir com sucesso em um fundo dentro do saldo disponível

*Skip: aguardando correção do BUG-41 (modal de PIN pode fechar sozinho no meio da digitação).*

```gherkin
  Cenário: deve investir com sucesso em um fundo dentro do saldo disponível
    Dado que estou autenticado e na tela de Investimentos
    Quando escolho um fundo e informo um valor dentro do meu saldo disponível
    E confirmo com o PIN transacional correto
    Então devo ver a mensagem de investimento realizado com sucesso
    E o fundo deve aparecer em "Meus investimentos"
```

## CT-INV-05 — Deve resgatar parcialmente um investimento existente

*Skip: aguardando correção do BUG-41 (modal de PIN pode fechar sozinho no meio da digitação).*

```gherkin
  Cenário: deve resgatar parcialmente um investimento existente
    Dado que já realizei um investimento em um fundo
    Quando solicito o resgate parcial de um valor menor que o total investido
    E confirmo com o PIN transacional correto
    Então devo ver a mensagem de resgate realizado com sucesso
```

## CT-INV-06 — Deve exibir mensagem de saldo insuficiente ao investir acima do saldo disponível

*Skip: aguardando correção do BUG-41 (modal de PIN pode fechar sozinho no meio da digitação).*

```gherkin
  Cenário: deve exibir mensagem de saldo insuficiente ao investir acima do saldo disponível
    Dado que estou autenticado e na tela de Investimentos
    Quando tento investir um valor maior que o meu saldo disponível
    E confirmo com o PIN transacional correto
    Então devo ver a mensagem de saldo insuficiente
```

## CT-INV-07 — Deve somar os fundos dos riscos selecionados ao filtrar por mais de um risco

```gherkin
  Cenário: deve somar os fundos dos riscos selecionados ao filtrar por mais de um risco
    Dado que estou na tela de Investimentos com o filtro aberto
    Quando seleciono os riscos "Alto" e "Baixo" e clico em "Aplicar"
    Então o contador do botão "Filtrar" deve mostrar "2"
    E a lista deve mostrar a soma dos fundos de risco "Alto" e "Baixo", não a interseção
```

## CT-INV-08 — Deve desabilitar (ou ocultar) o botao Carregar mais quando não há mais resultados (BUG-12)

*Skip: aguardando correção do BUG-12 (botão "Carregar mais" permanece habilitado mesmo sem mais resultados).*

```gherkin
  Cenário: deve desabilitar (ou ocultar) o botão "Carregar mais" quando não há mais resultados (BUG-12)
    Dado que apliquei uma busca ou filtro cujo resultado cabe todo na primeira página
    Então o botão "Carregar mais" deve ficar desabilitado (ou não deve ser exibido)
```

## CT-INV-09 — Deve aceitar o aporte no valor mínimo exato do fundo

*Skip: aguardando correção do BUG-41 (modal de PIN pode fechar sozinho no meio da digitação).*

```gherkin
  Cenário: deve aceitar o aporte no valor mínimo exato do fundo
    Dado que estou na tela de um fundo cuja aplicação inicial mínima é R$ 5,00
    Quando informo o valor "R$ 5,00" (exatamente o mínimo)
    Então o botão "Investir" deve ficar habilitado
    E o investimento deve ser concluído com sucesso ao confirmar com o PIN
```

## CT-INV-10 — Deve manter o botao Investir desabilitado com aporte abaixo do mínimo

```gherkin
  Cenário: deve manter o botao Investir desabilitado com aporte abaixo do mínimo
    Dado que estou na tela de um fundo cuja aplicação inicial mínima é R$ 5,00
    Quando informo o valor "R$ 4,99" (um centavo abaixo do mínimo)
    Então o botão "Investir" deve permanecer desabilitado
```

## CT-INV-11 — Resgate acima do disponível com múltiplos aportes no mesmo fundo

*Skip: aguardando confirmação do BUG-33 — não reproduzido na última verificação contra a aplicação em execução (ver `bugReport.md`); ver CT-API-INV-15 para o equivalente de API.*

```gherkin
  Cenário: não deve permitir o resgate de um valor maior que a soma dos aportes quando há mais de um aporte no mesmo fundo (BUG-33)
    Dado que investi duas ou mais vezes separadamente no mesmo fundo
    Quando peço um resgate maior que a soma desses aportes e confirmo com o PIN
    Então devo ver uma mensagem de saldo insuficiente
    E o saldo da conta corrente não deve ser alterado
```

## CT-INV-12 — Deve manter o filtro aplicado ao trocar de aba e voltar

```gherkin
  Cenário: deve manter o filtro aplicado ao trocar de aba e voltar
    Dado que apliquei um filtro de risco na aba "Investir"
    Quando clico na aba "Meus investimentos" e depois volto para "Investir"
    Então o filtro continua aplicado (o contador do botão "Filtrar" não é zerado)
```

## CT-INV-13 — Deve exibir o risco previamente selecionado marcado ao reabrir o painel de filtro

```gherkin
  Cenário: deve exibir o risco previamente selecionado marcado ao reabrir o painel de filtro
    Dado que apliquei um filtro de risco (ex.: "Alto") e a lista já está filtrada
    Quando clico novamente no botão "Filtrar" para reabrir o painel
    Então o risco "Alto" aparece marcado/selecionado no painel, refletindo o filtro já aplicado
```

## CT-INV-14 — Deve bloquear a confirmação de aporte com um valor muito acima do razoável (BUG-19)

*Skip: aguardando correção do BUG-19 (formulário de aporte não aplica nenhum limite superior de valor).*

```gherkin
  Cenário: deve bloquear a confirmação de aporte com um valor muito acima do razoável (BUG-19)
    Dado que estou autenticado e na tela de Investimentos
    Quando abro o formulário de aporte de um fundo
    E informo um valor bem acima do razoável (ex.: R$ 1.500,00)
    Então o botão "Investir" deve permanecer desabilitado, sem permitir a confirmação da operação
```
