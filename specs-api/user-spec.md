# Especificação de Testes — User / Cadastro (API)

Arquivo de automação correspondente: `api/cypress/e2e/user/user.cy.js`

## CT-API-USER-01 — Cadastro completo com sucesso

```gherkin
Funcionalidade: Cadastro de usuário via API
  Como um cliente da API do AcademyWallet
  Quero me cadastrar informando nome, e-mail, senha, CPF, RG e senha de transações
  Para poder autenticar e usar a carteira digital

  Cenário: deve cadastrar um usuário completo com sucesso
    Dado que não possuo cadastro prévio no sistema
    Quando envio POST /user com nome, e-mail único, senha de login válida, CPF válido, RG válido e senha de transações
    Então devo receber status 201
    E o corpo da resposta deve conter o id e o e-mail do usuário criado
```

## CT-API-USER-02 — E-mail duplicado

```gherkin
  Cenário: deve retornar 409 ao cadastrar com um e-mail já existente
    Dado um usuário já cadastrado
    Quando envio POST /user reaproveitando o e-mail desse usuário (com CPF diferente)
    Então devo receber status 409 com mensagem contendo "E-mail já cadastrado"
```

## CT-API-USER-03 — CPF duplicado

```gherkin
  Cenário: deve retornar 409 ao cadastrar com um CPF já existente
    Dado um usuário já cadastrado
    Quando envio POST /user reaproveitando o CPF desse usuário (com e-mail diferente)
    Então devo receber status 409 com mensagem contendo "CPF já cadastrado"
```

## CT-API-USER-04 — Campo obrigatório faltando

```gherkin
  Cenário: deve retornar 422 quando um campo obrigatório (rg) não é informado
    Dado que vou realizar um cadastro informando todos os demais campos obrigatórios válidos, exceto o RG
    Quando envio POST /user sem o campo rg
    Então devo receber status 422 com uma lista de erros de validação contendo o campo "rg"
```

## CT-API-USER-05 — GET /user autenticado

```gherkin
  Cenário: deve retornar os dados do usuário autenticado
    Dado que estou autenticado com um usuário válido
    Quando envio GET /user com o token desse usuário
    Então devo receber status 200
    E os dados retornados devem corresponder ao usuário do token (e-mail, CPF e carteira)
```

## CT-API-USER-06 — GET /user sem token

```gherkin
  Cenário: deve retornar 401 ao buscar usuário sem token de autenticação
    Dado que não estou autenticado no sistema
    Quando envio GET /user sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-USER-07 — Marcar o primeiro acesso como concluído

```gherkin
  Cenário: deve marcar o primeiro acesso como concluido (firstAccess true -> false)
    Dado um usuário recém-cadastrado, com o primeiro acesso ainda pendente
    Quando envio PATCH /user/{id}/first-access autenticado como esse usuário
    Então devo receber status 200
    E o primeiro acesso do usuário deve passar a constar como concluído
```

## CT-API-USER-08 — Uma segunda chamada a first-access desfaz a marcação

*Skip: aguardando correção do BUG-25 (uma segunda chamada a `PATCH /user/:id/first-access` desfaz a marcação em vez de mantê-la concluída).*

```gherkin
  Cenário: não deve desfazer a marcação de primeiro acesso quando o endpoint é chamado uma segunda vez
    Dado um usuário que já marcou o primeiro acesso como concluído
    Quando envio PATCH /user/{id}/first-access novamente
    Então devo receber status 200
    E o primeiro acesso deve continuar constando como concluído
```

## CT-API-USER-09 — First-access sem token

```gherkin
  Cenário: deve retornar 401 ao marcar first-access sem token
    Dado que não estou autenticado no sistema
    Quando envio PATCH /user/{id}/first-access sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-USER-10 — First-access de outro usuário

```gherkin
  Cenário: deve retornar 401 ao tentar marcar o first-access de outro usuário
    Dado que estou autenticado com um usuário válido
    Quando envio PATCH /user/{id}/first-access informando um id que não é o meu
    Então devo receber status 401 com mensagem de permissão negada
```

## CT-API-USER-11 — Cadastro com apenas um nome, sem sobrenome

```gherkin
  Cenário: deve retornar 422 quando o nome tem apenas uma palavra
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando só um nome, sem sobrenome
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-12 — Cadastro com números no nome

```gherkin
  Cenário: deve retornar 422 quando o nome contém dígitos
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um nome com números
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-13 — Cadastro com símbolos no nome

```gherkin
  Cenário: deve retornar 422 quando o nome contém símbolos
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um nome com símbolos
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-14 — Cadastro com nome muito longo

```gherkin
  Cenário: deve retornar 422 quando o nome tem mais de 150 caracteres
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um nome com mais de 150 caracteres
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-15 — Cadastro com RG de 10 caracteres

```gherkin
  Cenário: deve cadastrar com rg de exatamente 10 caracteres alfanuméricos
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um RG alfanumérico de exatamente 10 caracteres
    Então o cadastro deve ser aceito
```

## CT-API-USER-16 — Cadastro com RG de 7 caracteres

```gherkin
  Cenário: deve cadastrar com rg de exatamente 7 caracteres
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um RG de exatamente 7 caracteres
    Então o cadastro deve ser aceito
```

## CT-API-USER-17 — RG de 11 caracteres não deveria ser rejeitado, mas é

*Skip: aguardando correção do BUG-26 (RG de 11 a 14 caracteres é rejeitado, contrariando o contrato do Swagger).*

```gherkin
  Cenário: não deve rejeitar um RG de 11 caracteres, já que o contrato documenta suporte a até 14 (BUG-26)
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um RG alfanumérico de 11 caracteres
    Então o cadastro deve ser aceito
```

## CT-API-USER-18 — O RG não deve aceitar caracteres não alfanuméricos

```gherkin
  Cenário: deve retornar 422 quando o rg contém caractere não alfanumérico
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando um RG com um caractere que não é letra nem número
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-19 — Cadastro com senha de login sem letra maiúscula

```gherkin
  Cenário: deve retornar 422 quando a senha não tem letra maiúscula
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de login sem nenhuma letra maiúscula
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-20 — Cadastro com senha de login sem letra minúscula

```gherkin
  Cenário: deve retornar 422 quando a senha não tem letra minúscula
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de login sem nenhuma letra minúscula
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-21 — Cadastro com senha de login sem número

```gherkin
  Cenário: deve retornar 422 quando a senha não tem dígito
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de login sem nenhum número
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-22 — Cadastro com senha de login sem caractere especial

```gherkin
  Cenário: deve retornar 422 quando a senha não tem caractere especial
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de login sem nenhum caractere especial
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-23 — Cadastro com senha de login curta demais

```gherkin
  Cenário: deve retornar 422 quando a senha tem menos de 8 caracteres
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de login com apenas 7 caracteres
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-24 — A senha de login deve aceitar exatamente 8 caracteres

```gherkin
  Cenário: deve cadastrar com loginPassword de exatamente 8 caracteres
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de login com exatamente 8 caracteres, cumprindo todos os requisitos
    Então o cadastro deve ser aceito
```

## CT-API-USER-25 — Cadastro com senha de transações de apenas 5 dígitos

```gherkin
  Cenário: deve retornar 422 quando a senha de transações tem 5 dígitos
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de transações com 5 dígitos
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-26 — Cadastro com senha de transações de 7 dígitos

```gherkin
  Cenário: deve retornar 422 quando a senha de transações tem 7 dígitos
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de transações com 7 dígitos
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-27 — Cadastro com senha de transações contendo letras

```gherkin
  Cenário: deve retornar 422 quando a senha de transações contém letras
    Dado que vou realizar um cadastro com os demais dados válidos
    Quando me cadastro informando uma senha de transações com letras
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-28 — Cadastro deve rejeitar RG duplicado

*Skip: aguardando correção do BUG-30 (RG não é validado como único, diferente de e-mail e CPF).*

```gherkin
  Cenário: não deve permitir o cadastro de dois usuários com o mesmo RG
    Dado que já existe um usuário cadastrado com um RG específico
    Quando cadastro um segundo usuário com e-mail e CPF diferentes, mas repetindo o mesmo RG
    Então devo receber status 409 com mensagem informando que o RG já está cadastrado
```
