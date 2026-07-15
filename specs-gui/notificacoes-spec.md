# Especificação de Testes — Notificações (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/notificacoes/notificacoes.cy.js`
Módulo classificado como **RBT Médio (10)** — ver `planoDeTestes.md` seção 7.8.

## CT-NOT-01 — Regressão do BUG-03 (módulo inoperante)

```gherkin
Funcionalidade: Notificações
  Como um usuário autenticado
  Quero consultar minhas notificações
  Para acompanhar avisos e eventos da minha conta

  Cenário: Tela de notificações não exibe nenhum conteúdo (bug conhecido BUG-03)
    Dado que estou autenticado
    Quando acesso a tela de Notificações
    Então devo ver apenas o título "Notificações"
    E não devo ver nenhuma notificação listada
```
