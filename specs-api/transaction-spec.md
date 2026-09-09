# Especificação de Testes — Transaction (API)

Arquivo de automação correspondente: `api/cypress/e2e/transaction/transaction.cy.js`

## CT-API-TRA-01 — Lista as transações existentes

```gherkin
Funcionalidade: Consulta de movimentações via API
  Como um cliente autenticado da API
  Quero consultar minhas movimentações financeiras
  Para acompanhar meu extrato

  Cenário: deve listar as transações existentes da carteira
    Dado que já realizei ao menos uma movimentação (ex: pagamento de boleto)
    Quando envio GET /transaction/all/{walletId}
    Então devo receber status 200 com ao menos uma movimentação
```

## CT-API-TRA-02 — Sem token

```gherkin
  Cenário: deve retornar 401 ao listar todas as transações sem token
    Dado que não estou autenticado
    Quando envio GET /transaction/all/{walletId} sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-03 — Chave pública RSA válida

```gherkin
  Cenário: deve retornar uma chave pública RSA válida no formato PEM
    Dado que estou autenticado
    Quando envio GET /transaction/crypt/key
    Então devo receber status 200 com uma chave no formato PEM (-----BEGIN PUBLIC KEY-----)
```

## CT-API-TRA-04 — Sem token

```gherkin
  Cenário: deve retornar 401 ao buscar a chave de criptografia sem token
    Dado que não estou autenticado
    Quando envio GET /transaction/crypt/key sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-05 — Filtro por período de dias

```gherkin
  Cenário: deve filtrar corretamente as movimentações por período de dias (7 dias)
    Dado que já realizei uma movimentação hoje
    Quando envio GET /transaction/filtro/{walletId}/7
    Então devo receber status 200
    E todas as movimentações retornadas devem estar dentro dos últimos 7 dias
```

## CT-API-TRA-06 — Sem token

```gherkin
  Cenário: deve retornar 401 ao filtrar movimentações por período sem token
    Dado que não estou autenticado
    Quando envio GET /transaction/filtro/{walletId}/7 sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-07 — Criptografia da senha transacional (fluxo positivo)

```gherkin
  Cenário: deve criptografar a senha transacional com uma chave pública válida
    Dado que obtive a chave pública de criptografia (GET /transaction/crypt/key)
    Quando envio POST /transaction/encrypt_password com essa chave e uma senha
    Então devo receber status 201 com a senha criptografada
```

## CT-API-TRA-08 — Encrypt_password sem token de autenticação

```gherkin
  Cenário: deve responder mesmo sem token, pois não depende de sessão autenticada
    Dado que não estou autenticado
    Quando envio POST /transaction/encrypt_password sem o header Authorization
    Então devo receber status 201
```

## CT-API-TRA-09 — Encrypt_password sem chave pública informada

*Skip: aguardando correção do BUG-40 (publicKey ausente quebra com 500 não tratado).*

```gherkin
  Cenário: deve retornar 422 quando a chave pública não é informada
    Dado que estou autenticado
    Quando envio POST /transaction/encrypt_password sem informar a chave pública
    Então devo receber status 422
```

## CT-API-TRA-10 — Encrypt_password sem senha informada

*Skip: aguardando correção do BUG-40 (password ausente quebra com 500 não tratado).*

```gherkin
  Cenário: deve retornar 422 quando a senha não é informada
    Dado que estou autenticado
    Quando envio POST /transaction/encrypt_password sem informar a senha a ser criptografada
    Então devo receber status 422
```

## CT-API-TRA-11 — Encrypt_password com chave pública em formato inválido

*Skip: aguardando correção do BUG-40 (publicKey em formato inválido quebra com 500 não tratado).*

```gherkin
  Cenário: deve retornar 422 quando a chave pública não está em um formato PEM válido
    Dado que estou autenticado
    Quando envio POST /transaction/encrypt_password com uma chave pública em formato inválido
    Então devo receber status 422
```

## CT-API-TRA-12 — Criação de transação CREDIT com sucesso

```gherkin
  Cenário: deve criar uma transação CREDIT com sucesso e aumentar o saldo
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com uma movimentação de crédito e um valor válido
    Então devo receber status 201
    E o saldo da carteira deve aumentar exatamente o valor informado
```

## CT-API-TRA-13 — Criação de transação de débito com sucesso

```gherkin
  Cenário: deve criar uma transação DEBIT com sucesso e reduzir o saldo
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com uma movimentação de débito dentro do saldo disponível
    Então devo receber status 201
    E o saldo da carteira deve diminuir exatamente o valor informado
```

## CT-API-TRA-14 — Débito acima do saldo disponível

```gherkin
  Cenário: deve rejeitar uma transação DEBIT acima do saldo disponível
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com uma movimentação de débito acima do saldo disponível
    Então devo receber status 400 com mensagem "saldo insuficiente"
```

## CT-API-TRA-15 — Sem token

```gherkin
  Cenário: deve retornar 401 ao criar transação sem token
    Dado que não estou autenticado
    Quando envio POST /transaction sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-TRA-16 — Valor zero

```gherkin
  Cenário: deve rejeitar transação com valor zero ou negativo
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com value igual a 0
    Então devo receber status 401 com mensagem informando que o valor não pode ser negativo
```

## CT-API-TRA-17 — Valor negativo

```gherkin
  Cenário: deve rejeitar uma transação com valor negativo
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction com value negativo
    Então devo receber status 401
```

## CT-API-TRA-18 — Tipo da movimentação obrigatório

```gherkin
  Cenário: deve retornar 422 quando o campo type não é informado
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction sem informar se é crédito ou débito
    Então devo receber status 422
```

## CT-API-TRA-19 — Carteira inexistente

```gherkin
  Cenário: deve retornar 404 quando o walletId não existe
    Dado que estou autenticado com um usuário com saldo disponível
    E obtive a chave pública de criptografia e criptografei meu PIN
    Quando envio POST /transaction informando uma carteira inexistente
    Então devo receber status 404
```

## CT-API-TRA-20 — PIN transacional incorreto

```gherkin
  Cenário: deve retornar 401 quando a senha transacional esta incorreta
    Dado que criptografei um PIN diferente do PIN cadastrado do usuário
    Quando envio POST /transaction com esse PIN incorreto
    Então devo receber status 401 com mensagem "Senha transacional incorreta"
```

## CT-API-TRA-21 — Últimas movimentações da carteira

```gherkin
  Cenário: deve listar as últimas movimentações da carteira
    Dado que já realizei ao menos uma movimentação
    Quando envio GET /transaction/{walletId}
    Então devo receber status 200 com no máximo 5 movimentações
```

## CT-API-TRA-22 — Sem token

```gherkin
  Cenário: deve retornar 401 ao listar as últimas movimentações sem token
    Dado que não estou autenticado
    Quando envio GET /transaction/{walletId} sem informar o header Authorization
    Então devo receber status 401
```
