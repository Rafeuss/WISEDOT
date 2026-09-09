# Especificação de Testes — Notification (API)

Arquivo de automação correspondente: `api/cypress/e2e/notification/notification.cy.js`

## CT-API-NOT-01 — Listagem de notificações do usuário autenticado

```gherkin
Funcionalidade: Notificações via API
  Como um cliente autenticado da API
  Quero consultar e marcar como vistas as minhas notificações
  Para acompanhar avisos e eventos da minha conta

  Cenário: deve listar as notificações do usuário autenticado
    Dado que recebi ao menos uma notificação
    Quando envio GET /notification autenticado
    Então devo receber status 200 com a notificação na lista
```

## CT-API-NOT-02 — GET sem token

```gherkin
  Cenário: deve retornar 401 ao listar notificações sem token
    Dado que não estou autenticado
    Quando envio GET /notification sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-NOT-03 — Envio de notificação sem autenticação

*Skip: aguardando correção do BUG-23 (POST /notification aceita e entrega notificação para qualquer usuário sem token).*

```gherkin
  Cenário: não deve permitir o envio de notificações para qualquer usuário sem autenticação
    Dado que não estou autenticado
    Quando envio POST /notification informando o identificador de um usuário qualquer, sem token
    Então devo receber status 401
    E a notificação não deve ser entregue ao usuário informado
```

## CT-API-NOT-04 — Mark-as-seen sem token

```gherkin
  Cenário: deve retornar 401 ao marcar notificação como vista sem token
    Dado que não estou autenticado
    Quando envio PATCH /notification/mark-as-seen sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-NOT-05 — Notificação inexistente

```gherkin
  Cenário: deve responder com sucesso ao marcar como vista uma notificação inexistente, sem alterar nenhum registro
    Dado que estou autenticado
    Quando envio PATCH /notification/mark-as-seen informando o identificador de uma notificação inexistente
    Então devo receber status 200, sem alterar nenhum registro
```

## CT-API-NOT-06 — Marcar como vista uma notificação de outro usuário

```gherkin
  Cenário: não deve permitir que um usuário marque como vista uma notificação de outro usuário (BUG-23)
    Dado dois usuários autenticados, A e B
    E o usuário B recebeu uma notificação
    Quando o usuário A envia PATCH /notification/mark-as-seen informando o identificador da notificação de B
    Então devo receber status 403
    E a notificação de B não deve ser alterada
```
