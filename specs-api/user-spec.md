# Especificação de Testes — User / Cadastro (API)

Arquivo de automação correspondente: `api/cypress/e2e/user/user.cy.js`

## CT-API-USER-01 — Cadastro completo com sucesso

```gherkin
Funcionalidade: Cadastro de usuário via API
  Como um cliente da API do AcademyWallet
  Quero me cadastrar informando nome, e-mail, senha, CPF, RG e senha de transações
  Para poder autenticar e usar a carteira digital

  Cenário: Cadastro com todos os dados válidos
    Quando envio POST /user com nome, e-mail único, senha de login válida, CPF válido, RG válido e senha de transações
    Então devo receber status 201
    E o corpo da resposta deve conter o id e o e-mail do usuário criado
```

## CT-API-USER-02 — E-mail duplicado

```gherkin
  Cenário: Cadastro com e-mail já existente
    Dado um usuário já cadastrado
    Quando envio POST /user reaproveitando o e-mail desse usuário (com CPF diferente)
    Então devo receber status 409 com mensagem contendo "E-mail já cadastrado"
```

## CT-API-USER-03 — CPF duplicado

```gherkin
  Cenário: Cadastro com CPF já existente
    Dado um usuário já cadastrado
    Quando envio POST /user reaproveitando o CPF desse usuário (com e-mail diferente)
    Então devo receber status 409 com mensagem contendo "CPF já cadastrado"
```

## CT-API-USER-04 — Campo obrigatório faltando

```gherkin
  Cenário: Cadastro sem o campo RG
    Quando envio POST /user sem o campo rg
    Então devo receber status 422 com uma lista de erros de validação contendo o campo "rg"
```

## CT-API-USER-05 — GET /user autenticado

```gherkin
  Cenário: Consulta dos dados do usuário autenticado
    Dado que estou autenticado com um usuário válido
    Quando envio GET /user com o token desse usuário
    Então devo receber status 200
    E os dados retornados devem corresponder ao usuário do token (e-mail, CPF e carteira)
```

## CT-API-USER-06 — GET /user sem token

```gherkin
  Cenário: Consulta dos dados do usuário sem autenticação
    Quando envio GET /user sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-USER-07 — Marcar o primeiro acesso como concluído

```gherkin
  Cenário: Marcar o primeiro acesso como concluído
    Dado um usuário recém-cadastrado, com o primeiro acesso ainda pendente
    Quando envio PATCH /user/{id}/first-access autenticado como esse usuário
    Então devo receber status 200
    E o primeiro acesso do usuário deve passar a constar como concluído
```

## CT-API-USER-08 — Uma segunda chamada a first-access desfaz a marcação

```gherkin
  Cenário: Uma segunda chamada a first-access desfaz a marcação
    Dado um usuário que já marcou o primeiro acesso como concluído
    Quando envio PATCH /user/{id}/first-access novamente
    Então devo receber status 200
    E o primeiro acesso volta a constar como pendente
```

## CT-API-USER-09 — First-access sem token

```gherkin
  Cenário: Marcar first-access sem autenticação
    Quando envio PATCH /user/{id}/first-access sem informar o header Authorization
    Então devo receber status 401
```

## CT-API-USER-10 — First-access de outro usuário

```gherkin
  Cenário: Tentar marcar o first-access de outro usuário
    Dado que estou autenticado com um usuário válido
    Quando envio PATCH /user/{id}/first-access informando um id que não é o meu
    Então devo receber status 401 com mensagem de permissão negada
```

## CT-API-USER-11 a 14 — O nome deve aceitar apenas letras e exigir nome completo

```gherkin
  Cenário: Cadastro com apenas um nome, sem sobrenome
    Quando me cadastro informando só um nome, sem sobrenome
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com números no nome
    Quando me cadastro informando um nome com números
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com símbolos no nome
    Quando me cadastro informando um nome com símbolos
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com nome muito longo
    Quando me cadastro informando um nome com mais de 150 caracteres
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-15 e 16 — O RG deve aceitar até 10 caracteres e no mínimo 7

```gherkin
  Cenário: Cadastro com RG de 10 caracteres
    Quando me cadastro informando um RG alfanumérico de exatamente 10 caracteres
    Então o cadastro deve ser aceito

  Cenário: Cadastro com RG de 7 caracteres
    Quando me cadastro informando um RG de exatamente 7 caracteres
    Então o cadastro deve ser aceito
```

## CT-API-USER-17 — RG de 11 caracteres não deveria ser rejeitado, mas é (ver BUG-26)

```gherkin
  Cenário: Cadastro com RG de 11 caracteres
    Quando me cadastro informando um RG alfanumérico de 11 caracteres
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-18 — O RG não deve aceitar caracteres não alfanuméricos

```gherkin
  Cenário: Cadastro com RG contendo um caractere especial
    Quando me cadastro informando um RG com um caractere que não é letra nem número
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-19 a 23 — A senha de login deve exigir maiúscula, minúscula, número, caractere especial e mínimo de 8 caracteres

```gherkin
  Cenário: Cadastro com senha de login sem letra maiúscula
    Quando me cadastro informando uma senha de login sem nenhuma letra maiúscula
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com senha de login sem letra minúscula
    Quando me cadastro informando uma senha de login sem nenhuma letra minúscula
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com senha de login sem número
    Quando me cadastro informando uma senha de login sem nenhum número
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com senha de login sem caractere especial
    Quando me cadastro informando uma senha de login sem nenhum caractere especial
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com senha de login curta demais
    Quando me cadastro informando uma senha de login com apenas 7 caracteres
    Então o cadastro deve ser rejeitado
```

## CT-API-USER-24 — A senha de login deve aceitar exatamente 8 caracteres

```gherkin
  Cenário: Cadastro com senha de login no tamanho mínimo permitido
    Quando me cadastro informando uma senha de login com exatamente 8 caracteres, cumprindo todos os requisitos
    Então o cadastro deve ser aceito
```

## CT-API-USER-25 a 27 — A senha de transações deve exigir exatamente 6 dígitos numéricos

```gherkin
  Cenário: Cadastro com senha de transações de apenas 5 dígitos
    Quando me cadastro informando uma senha de transações com 5 dígitos
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com senha de transações de 7 dígitos
    Quando me cadastro informando uma senha de transações com 7 dígitos
    Então o cadastro deve ser rejeitado

  Cenário: Cadastro com senha de transações contendo letras
    Quando me cadastro informando uma senha de transações com letras
    Então o cadastro deve ser rejeitado
```
