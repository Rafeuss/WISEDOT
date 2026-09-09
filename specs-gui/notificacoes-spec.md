# Especificação de Testes — Notificações (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/notificacoes/notificacoes.cy.js`
Módulo classificado como **RBT Médio (10)** — ver `planoDeTestes.md` seção 7.8.

*Ambos os casos abaixo estão em skip, aguardando correção do BUG-03 (a chamada de notificações vai para `/undefined/notification`).*

## CT-NOT-01 — Não deve disparar a chamada de notificações para o endereço quebrado "/undefined/notification" (skip — BUG-03)

```gherkin
Funcionalidade: Notificações
  Como um usuário autenticado
  Quero consultar minhas notificações
  Para acompanhar avisos e eventos da minha conta

  Cenário: não deve disparar a chamada de notificações para o endereço quebrado "/undefined/notification"
    Dado que estou autenticado
    Quando acesso a tela de Notificações
    Então a chamada de notificações deve ser feita para o endereço real do backend
    E nenhuma requisição deve ser disparada para "/undefined/notification"
```

## CT-NOT-02 — Deve exibir a lista de notificações do usuário (ou o estado vazio legítimo) (skip — BUG-03)

```gherkin
  Cenário: deve exibir a lista de notificações do usuário (ou o estado vazio legítimo), sem ficar presa em carregamento
    Dado que estou autenticado
    Quando acesso a tela de Notificações
    Então devo ver o título "Notificações"
    E a tela deve sair do estado de "Carregando notificações..."
    E deve renderizar a lista de notificações (ou uma mensagem legítima de "nenhuma notificação")
```

**Nota para a Fase 3:** os demais cenários deste módulo (marcar como vista, múltiplas notificações, erro de rede) só podem ser escritos como testes de fluxo positivo depois que o BUG-03 for corrigido — o módulo está inoperante na tela hoje. Uma vez corrigida a causa raiz acima, esses cenários devem ser adicionados e os dois casos acima reativados.
