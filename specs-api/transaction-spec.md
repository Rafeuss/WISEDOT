# Especificação de Testes — Transaction (API)

Arquivo de automação correspondente: `api/cypress/e2e/transaction/transaction.cy.js`

## CT-API-TRA-01 — Lista as transações existentes

```gherkin
Funcionalidade: Consulta de movimentações via API
  Como um cliente autenticado da API
  Quero consultar minhas movimentações financeiras
  Para acompanhar meu extrato

  Cenário: Listagem de todas as movimentações da carteira
    Dado que já realizei ao menos uma movimentação (ex: pagamento de boleto)
    Quando envio GET /transaction/all/{walletId}
    Então devo receber status 200 com ao menos uma movimentação
```

## CT-API-TRA-01b — Sem token

```gherkin
  Cenário: Listagem de movimentações sem autenticação
    Quando envio GET /transaction/all/{walletId} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-02 — Chave pública RSA válida

```gherkin
  Cenário: Consulta da chave pública de criptografia
    Dado que estou autenticado
    Quando envio GET /transaction/crypt/key
    Então devo receber status 200 com uma chave no formato PEM (-----BEGIN PUBLIC KEY-----)
```

## CT-API-TRA-03 — Sem token

```gherkin
  Cenário: Consulta da chave de criptografia sem autenticação
    Quando envio GET /transaction/crypt/key sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-04 — Filtro por período de dias

```gherkin
  Cenário: Filtro de movimentações por período (7 dias)
    Dado que já realizei uma movimentação hoje
    Quando envio GET /transaction/filtro/{walletId}/7
    Então devo receber status 200
    E todas as movimentações retornadas devem estar dentro dos últimos 7 dias
```

## CT-API-TRA-04b — Sem token

```gherkin
  Cenário: Filtro de movimentações por período sem autenticação
    Quando envio GET /transaction/filtro/{walletId}/7 sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-05 — Criptografia da senha transacional (fluxo positivo)

```gherkin
  Cenário: Criptografar uma senha com uma chave pública válida
    Dado que obtive a chave pública de criptografia (GET /transaction/crypt/key)
    Quando envio POST /transaction/encrypt_password com essa chave e uma senha
    Então devo receber status 201 com a senha criptografada
```

## CT-API-TRA-06 — Encrypt_password sem token de autenticação

```gherkin
  Cenário: Criptografar uma senha sem token de autenticação
    Quando envio POST /transaction/encrypt_password sem o header Authorization
    Então devo receber status 201
```

## CT-API-TRA-07 a 09 — Encrypt_password com campos ausentes ou inválidos

```gherkin
  Cenário: Chave pública não informada
    Quando envio POST /transaction/encrypt_password sem informar a chave pública
    Então devo receber status 500

  Cenário: Senha não informada
    Quando envio POST /transaction/encrypt_password sem informar a senha a ser criptografada
    Então devo receber status 500

  Cenário: Chave pública em formato inválido
    Quando envio POST /transaction/encrypt_password com uma chave pública em formato inválido
    Então devo receber status 500
```

## CT-API-TRA-10 — Criação de transação CREDIT com sucesso

```gherkin
  Cenário: Movimentação de crédito aumenta o saldo da carteira
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com uma movimentação de crédito e um valor válido
    Então devo receber status 201
    E o saldo da carteira deve aumentar exatamente o valor informado
```

## CT-API-TRA-11 — Criação de transação de débito com sucesso

```gherkin
  Cenário: Movimentação de débito dentro do saldo disponível reduz o saldo da carteira
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com uma movimentação de débito dentro do saldo disponível
    Então devo receber status 201
    E o saldo da carteira deve diminuir exatamente o valor informado
```

## CT-API-TRA-12 — Débito acima do saldo disponível

```gherkin
  Cenário: Transação de débito rejeitada por saldo insuficiente
    Quando envio POST /transaction com uma movimentação de débito acima do saldo disponível
    Então devo receber status 400 com mensagem "saldo insuficiente"
```

## CT-API-TRA-13 — Sem token

```gherkin
  Cenário: Criação de transação sem autenticação
    Quando envio POST /transaction sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-14 — Valor zero ou negativo

```gherkin
  Cenário: Transação rejeitada com valor zero
    Quando envio POST /transaction com value igual a 0
    Então devo receber status 401 com mensagem informando que o valor não pode ser negativo

  Cenário: Transação rejeitada com valor negativo
    Quando envio POST /transaction com value negativo
    Então devo receber status 401
```

## CT-API-TRA-15 — Tipo da movimentação obrigatório

```gherkin
  Cenário: Tipo da movimentação não informado
    Quando envio POST /transaction sem informar se é crédito ou débito
    Então devo receber status 422
```

## CT-API-TRA-16 — Carteira inexistente

```gherkin
  Cenário: Carteira informada não existe
    Quando envio POST /transaction informando uma carteira inexistente
    Então devo receber status 404
```

## CT-API-TRA-17 — PIN transacional incorreto

```gherkin
  Cenário: Transação rejeitada por PIN incorreto
    Dado que criptografei um PIN diferente do PIN cadastrado do usuário
    Quando envio POST /transaction com esse PIN incorreto
    Então devo receber status 401 com mensagem "Senha transacional incorreta"
```

## CT-API-TRA-18 — Últimas movimentações da carteira

```gherkin
  Cenário: Listagem das últimas movimentações
    Dado que já realizei ao menos uma movimentação
    Quando envio GET /transaction/{walletId}
    Então devo receber status 200 com no máximo 5 movimentações
```

## CT-API-TRA-19 — Sem token

```gherkin
  Cenário: Listagem das últimas movimentações sem autenticação
    Quando envio GET /transaction/{walletId} sem informar o header Authorization
    Então devo receber status 401
```
