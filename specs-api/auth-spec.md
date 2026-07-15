# Especificação de Testes — Auth (API)

Arquivo de automação correspondente: `api/cypress/e2e/auth/auth.cy.js`

## CT-API-AUTH-01 — Login com sucesso

```gherkin
Funcionalidade: Autenticação via API
  Como um cliente da API do AcademyWallet
  Quero autenticar com e-mail e senha
  Para obter um token JWT de acesso

  Cenário: Login com credenciais válidas
    Dado um usuário cadastrado com e-mail e senha válidos
    Quando envio POST /auth/login com essas credenciais
    Então devo receber status 200
    E o corpo da resposta deve conter um token de acesso, válido por 3600 segundos
```

## CT-API-AUTH-02 — Senha incorreta

```gherkin
  Cenário: Login com senha incorreta
    Dado um usuário cadastrado
    Quando envio POST /auth/login com a senha incorreta
    Então devo receber status 401
```

## CT-API-AUTH-03 — E-mail não cadastrado

```gherkin
  Cenário: Login com e-mail inexistente
    Quando envio POST /auth/login com um e-mail não cadastrado
    Então devo receber status 401
```

## CT-API-AUTH-04 — Payload sem senha

```gherkin
  Cenário: Requisição de login sem o campo senha
    Quando envio POST /auth/login apenas com o e-mail, sem senha
    Então devo receber status 422
```

## CT-API-AUTH-05 — Recuperação de senha falha com 500

```gherkin
  Cenário: Endpoint de recuperação de senha falha com erro não tratado
    Quando envio POST /auth/request-otp com um e-mail válido
    Então devo receber status 500
```

## CT-API-AUTH-06 — Fluxo positivo de redefinição de senha

```gherkin
  Cenário: Redefinição de senha completa (OTP -> troca de senha -> novo login)
    Dado um usuário cadastrado que solicitou um OTP de recuperação
    Quando envio POST /auth/validate-otp com o token OTP correto
    Então devo receber status 200 com um token de recuperação de senha
    Quando envio PATCH /auth/change-password com esse token e uma nova senha
    Então devo receber status 200 com a mensagem "Password changed"
    Quando envio POST /auth/login com a nova senha
    Então devo receber status 200
```

## CT-API-AUTH-07 — Validate-otp com token incorreto

```gherkin
  Cenário: Validação de OTP com token incorreto
    Dado um usuário que já solicitou um OTP de recuperação
    Quando envio POST /auth/validate-otp com um token incorreto
    Então devo receber status 401
```

## CT-API-AUTH-07b — Validate-otp para usuário que nunca solicitou OTP

```gherkin
  Cenário: Validação de OTP para usuário que nunca solicitou um
    Dado um usuário que nunca chamou POST /auth/request-otp
    Quando envio POST /auth/validate-otp com qualquer token
    Então devo receber status 500
```

## CT-API-AUTH-08 — Validate-otp com e-mail inexistente

```gherkin
  Cenário: Validação de OTP para e-mail não cadastrado
    Quando envio POST /auth/validate-otp com um e-mail não cadastrado
    Então devo receber status 404
```

## CT-API-AUTH-09 — Change-password sem token de recuperação

```gherkin
  Cenário: Troca de senha sem token de recuperação
    Quando envio PATCH /auth/change-password sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-AUTH-10 — Token de recuperação reutilizável

```gherkin
  Cenário: Um mesmo token de recuperação troca a senha mais de uma vez
    Dado um usuário com um token de recuperação de senha válido
    Quando envio PATCH /auth/change-password duas vezes seguidas com o mesmo token
    Então ambas as chamadas devem retornar status 200
```

## CT-API-AUTH-11 e 12 — A senha de login deve aceitar entre 5 e 50 caracteres

```gherkin
  Cenário: Login com senha curta demais
    Quando faço login informando uma senha com apenas 4 caracteres
    Então o login deve ser rejeitado

  Cenário: Login com senha longa demais
    Quando faço login informando uma senha com 51 caracteres
    Então o login deve ser rejeitado
```

## CT-API-AUTH-13 a 15 — O código de verificação (OTP) deve aceitar exatamente 4 dígitos

```gherkin
  Cenário: Validação de código de verificação com menos de 4 dígitos
    Quando valido o código de verificação informando apenas 3 dígitos
    Então a validação deve ser rejeitada

  Cenário: Validação de código de verificação contendo letras
    Quando valido o código de verificação informando letras em vez de dígitos
    Então a validação deve ser rejeitada

  Cenário: Validação de código de verificação com mais de 4 dígitos
    Quando valido o código de verificação informando 5 dígitos
    Então a validação deve ser rejeitada
```
