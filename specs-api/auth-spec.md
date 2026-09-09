# Especificação de Testes — Auth (API)

Arquivo de automação correspondente: `api/cypress/e2e/auth/auth.cy.js`

## CT-API-AUTH-01 — Login com sucesso

```gherkin
Funcionalidade: Autenticação via API
  Como um cliente da API do AcademyWallet
  Quero autenticar com e-mail e senha
  Para obter um token JWT de acesso

  Cenário: deve autenticar com credenciais válidas e retornar token
    Dado um usuário cadastrado com e-mail e senha válidos
    Quando envio POST /auth/login com essas credenciais
    Então devo receber status 200
    E o corpo da resposta deve conter um token de acesso, válido por 3600 segundos
```

## CT-API-AUTH-02 — Senha incorreta

```gherkin
  Cenário: deve retornar 401 para senha incorreta
    Dado um usuário cadastrado
    Quando envio POST /auth/login com a senha incorreta
    Então devo receber status 401
```

## CT-API-AUTH-03 — E-mail não cadastrado

```gherkin
  Cenário: deve retornar 401 para e-mail não cadastrado
    Dado que não há usuário cadastrado com o e-mail informado
    Quando envio POST /auth/login com um e-mail não cadastrado
    Então devo receber status 401
```

## CT-API-AUTH-04 — Payload sem senha

```gherkin
  Cenário: deve retornar 422 quando a senha não é informada
    Dado um usuário cadastrado com e-mail e senha válidos
    Quando envio POST /auth/login apenas com o e-mail, sem senha
    Então devo receber status 422
```

## CT-API-AUTH-05 — Recuperação de senha falha com 500

*Skip: aguardando correção do BUG-04 (request-otp retorna 500 não tratado para um e-mail válido).*

```gherkin
  Cenário: não deve falhar com erro 500 ao solicitar recuperação de senha com um e-mail válido (BUG-04)
    Dado um usuário cadastrado com e-mail válido
    Quando envio POST /auth/request-otp com um e-mail válido
    Então devo receber status 200
```

## CT-API-AUTH-06 — Fluxo positivo de redefinição de senha

```gherkin
  Cenário: deve completar o fluxo de redefinicao de senha (OTP -> troca de senha -> novo login)
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
  Cenário: deve retornar 401 ao validar OTP com token incorreto
    Dado um usuário que já solicitou um OTP de recuperação
    Quando envio POST /auth/validate-otp com um token incorreto
    Então devo receber status 401
```

## CT-API-AUTH-08 — Validate-otp para usuário que nunca solicitou OTP

*Skip: aguardando correção do BUG-24 (validate-otp retorna 500 não tratado quando o usuário nunca solicitou um OTP).*

```gherkin
  Cenário: não deve retornar erro 500 ao validar um código OTP para um usuário que nunca solicitou um (BUG-24)
    Dado um usuário que nunca chamou POST /auth/request-otp
    Quando envio POST /auth/validate-otp com qualquer token
    Então devo receber status 401
```

## CT-API-AUTH-09 — Validate-otp com e-mail inexistente

```gherkin
  Cenário: deve retornar 404 ao validar OTP com e-mail não cadastrado
    Dado que não há usuário cadastrado com o e-mail informado
    Quando envio POST /auth/validate-otp com um e-mail não cadastrado
    Então devo receber status 404
```

## CT-API-AUTH-10 — Change-password sem token de recuperação

```gherkin
  Cenário: deve retornar 401 ao trocar a senha sem token de recuperação
    Dado que o endpoint /auth/change-password está disponível
    Quando envio PATCH /auth/change-password sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-AUTH-11 — Token de recuperação deve ser de uso único (skip — BUG-42)

*Skip: aguardando correção do BUG-42 (token de recuperação continua válido após a primeira troca, permitindo reutilização).*

```gherkin
  Cenário: não deve permitir que o token de recuperação de senha seja reutilizado após a primeira troca
    Dado um usuário com um token de recuperação de senha válido
    Quando envio PATCH /auth/change-password uma primeira vez com esse token
    Então a primeira chamada deve retornar status 200
    Quando envio PATCH /auth/change-password uma segunda vez com o mesmo token
    Então a segunda chamada deve retornar status 401 (token já consumido)
```

## CT-API-AUTH-12 — Senha de login abaixo do mínimo (menos de 5 caracteres)

```gherkin
  Cenário: deve retornar 422 quando a senha de login tem menos de 5 caracteres
    Dado um usuário cadastrado com e-mail válido
    Quando faço login informando uma senha com apenas 4 caracteres
    Então o login deve ser rejeitado
```

## CT-API-AUTH-13 — Senha de login acima do máximo (mais de 50 caracteres)

```gherkin
  Cenário: deve retornar 422 quando a senha de login tem mais de 50 caracteres
    Dado um usuário cadastrado com e-mail válido
    Quando faço login informando uma senha com 51 caracteres
    Então o login deve ser rejeitado
```

## CT-API-AUTH-14 — Código de verificação com menos de 4 dígitos

```gherkin
  Cenário: deve retornar 422 ao validar OTP com token de 3 dígitos
    Dado um usuário cadastrado
    Quando valido o código de verificação informando apenas 3 dígitos
    Então a validação deve ser rejeitada
```

## CT-API-AUTH-15 — Código de verificação contendo letras

```gherkin
  Cenário: deve retornar 422 ao validar OTP com token contendo letras
    Dado um usuário cadastrado
    Quando valido o código de verificação informando letras em vez de dígitos
    Então a validação deve ser rejeitada
```

## CT-API-AUTH-16 — Código de verificação com mais de 4 dígitos

```gherkin
  Cenário: deve retornar 422 ao validar OTP com token de 5 dígitos
    Dado um usuário cadastrado
    Quando valido o código de verificação informando 5 dígitos
    Então a validação deve ser rejeitada
```

## CT-API-AUTH-17 — Redefinição de senha deve alterar a senha da própria conta

*Skip: aguardando correção do BUG-28 (change-password não altera de fato a senha de quem solicitou a redefinição).*

```gherkin
  Cenário: deve alterar a senha da própria conta ao concluir o fluxo de recuperação de senha (BUG-28)
    Dado que solicitei e validei um código de recuperação de senha para o meu próprio usuário, e obtive o token de redefinição
    Quando envio PATCH /auth/change-password com o meu token de redefinição e uma nova senha
    Então recebo status 200 "Password changed"
    E o login com a senha antiga do meu usuário deve deixar de funcionar
    E o login com a senha nova do meu usuário deve funcionar
```
