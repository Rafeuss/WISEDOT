# Especificação de Testes — Recuperação de Senha (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/recuperacao-senha/recuperacao-senha.cy.js`
Módulo classificado como **RBT Alto (15)** — ver `planoDeTestes.md` seção 7.8.

## CT-REC-01 — Deve manter o botao Enviar desabilitado com e-mail em formato inválido

```gherkin
Funcionalidade: Recuperação de senha
  Como um usuário cadastrado que esqueceu a senha
  Quero solicitar a recuperação usando meu e-mail
  Para redefinir minha senha de acesso

  Cenário: deve manter o botao Enviar desabilitado com e-mail em formato inválido
    Dado que estou na tela "Esqueceu sua senha?"
    Quando preencho um e-mail em formato inválido
    Então o botão "Enviar" deve permanecer desabilitado
```

## CT-REC-02 — Deve avançar para a etapa de código (OTP) ao informar um e-mail cadastrado (skip — BUG-04)

*Skip: aguardando correção do BUG-04 (request-otp falha com 500 e a tela não avança para a etapa de OTP).*

```gherkin
  Cenário: deve avançar para a etapa de código (OTP) ao informar um e-mail cadastrado
    Dado que estou na tela "Esqueceu sua senha?"
    Quando informo o e-mail de um usuário cadastrado
    E clico em "Enviar"
    Então a tela deve avançar para a etapa de código (OTP), exibindo a confirmação "E-mail enviado"
```

## CT-REC-03 — Deve manter o botao Enviar desabilitado com o campo de e-mail vazio

```gherkin
  Cenário: deve manter o botao Enviar desabilitado com o campo de e-mail vazio
    Dado que estou na tela "Esqueceu sua senha?"
    Então o botão "Enviar" deve estar desabilitado
```

## CT-REC-04 — Deve invalidar o código anterior ao solicitar um novo código para o mesmo e-mail

```gherkin
  Cenário: deve invalidar o código anterior ao solicitar um novo código para o mesmo e-mail
    Dado que já solicitei um código de recuperação para o meu e-mail
    Quando solicito um novo código para o mesmo e-mail antes de usar o primeiro
    Então o código anterior deixa de ser válido (uma tentativa de uso retorna "Token inválido")
    E somente o novo código é aceito
```

## CT-REC-05 — Redefinição de senha deve alterar a senha da própria conta

*Skip: aguardando correção do BUG-28 (change-password não altera de fato a senha de quem solicitou a redefinição) — ver CT-API-AUTH-17 para o equivalente de API.*

```gherkin
  Cenário: deve alterar a senha da própria conta ao concluir o fluxo de recuperação de senha (BUG-28)
    Dado que completei o fluxo de recuperação de senha do meu próprio usuário (código solicitado, validado, nova senha definida)
    Quando tento fazer login com a senha antiga e com a senha nova
    Então o login com a senha antiga deve deixar de funcionar
    E o login com a senha nova deve funcionar
```

## CT-REC-06 — Deve limpar o e-mail digitado ao voltar para o login e retornar para a tela de recuperação

```gherkin
  Cenário: deve limpar o e-mail digitado ao voltar para o login e retornar para a tela de recuperação
    Dado que digitei um e-mail na tela "Esqueceu sua senha?"
    Quando clico em "Voltar para o login" e depois volto para "Esqueceu sua senha?"
    Então o campo de e-mail está vazio novamente
```
