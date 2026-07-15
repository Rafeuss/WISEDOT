# Especificação de Testes — Cadastro (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/cadastro/cadastro.cy.js`
Módulo classificado como **RBT Alto (16)** — ver `planoDeTestes.md` seção 7.8.

## CT-CAD-01 — Cadastro completo com sucesso

```gherkin
Funcionalidade: Cadastro de usuário
  Como um visitante da aplicação
  Quero me cadastrar preenchendo dados pessoais, documentos, senha transacional e revisão
  Para criar uma conta na carteira digital

  Cenário: Cadastro completo com sucesso nas 4 etapas
    Dado que estou na tela de Cadastro
    Quando preencho a etapa 1 com nome, e-mail (único) e senha válidos
    E preencho a etapa 2 com CPF (único e válido) e RG válidos
    E preencho a etapa 3 com um PIN transacional de 6 dígitos
    E confirmo os dados na etapa 4 de revisão
    Então devo ver a mensagem "Usuário cadastrado com sucesso!"
```

## CT-CAD-02 — E-mail duplicado

```gherkin
  Cenário: Tentativa de cadastro com e-mail já cadastrado
    Dado que já existe um usuário cadastrado com um determinado e-mail
    Quando tento me cadastrar usando esse mesmo e-mail
    E completo as demais etapas do cadastro
    Então devo ver a mensagem "E-mail, CPF ou RG já cadastrados"
```

## CT-CAD-03 — Senha fraca

```gherkin
  Cenário: Tentativa de avançar com senha sem os requisitos de complexidade
    Dado que estou na etapa 1 do Cadastro
    Quando preencho uma senha sem letra maiúscula, número e caractere especial
    Então devo ver a mensagem de senha inválida
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-04 — E-mail em formato inválido

```gherkin
  Cenário: Tentativa de avançar com e-mail malformado
    Dado que estou na etapa 1 do Cadastro
    Quando preencho um e-mail em formato inválido
    Então devo ver a mensagem "Insira um e-mail válido."
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-05 — Nome válido com dois nomes (BUG-06)

```gherkin
  Cenário: Corrigir um nome de uma palavra para um nome válido com dois nomes
    Dado que estou na etapa 1 do Cadastro
    Quando preencho o campo Nome apenas com "Ana" e saio do campo
    Então devo ver a mensagem "O nome completo deve conter pelo menos dois nomes."
    Quando completo o campo Nome para "Ana Souza" e preencho e-mail e senha válidos
    Então o botão "Próximo" deve ficar habilitado
    E devo conseguir avançar para a etapa 2 (CPF/RG)
```

## CT-CAD-06 — RG muito curto

```gherkin
  Cenário: Tentativa de avançar com RG menor que o tamanho mínimo
    Dado que estou na etapa 2 do Cadastro
    Quando preencho um RG com menos de 7 caracteres
    Então devo ver a mensagem "RG deve ter pelo menos 7 caracteres"
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-07 — CPF com dígitos repetidos

```gherkin
  Cenário: Tentativa de avançar com CPF de dígitos repetidos
    Dado que estou na etapa 2 do Cadastro
    Quando preencho o CPF com "11111111111"
    Então devo ver a mensagem "Dados inválidos"
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-08 — CPF com dígito verificador inválido

```gherkin
  Cenário: Tentativa de avançar com CPF de dígito verificador inválido
    Dado que estou na etapa 2 do Cadastro
    Quando preencho um CPF com dígitos distintos mas dígito verificador incorreto
    Então devo ver a mensagem "Dados inválidos"
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-09 — Senha no limite mínimo válido

```gherkin
  Cenário: Avançar com senha de exatamente 8 caracteres
    Dado que estou na etapa 1 do Cadastro
    Quando preencho uma senha de exatamente 8 caracteres que atende todos os requisitos
    Então o botão "Próximo" deve ficar habilitado
```

## CT-CAD-10 — Senha com espaço

```gherkin
  Cenário: Tentativa de avançar com senha contendo espaço
    Dado que estou na etapa 1 do Cadastro
    Quando preencho uma senha contendo um espaço
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-11 — RG no limite mínimo válido

```gherkin
  Cenário: Avançar com RG de exatamente 7 caracteres
    Dado que estou na etapa 2 do Cadastro
    Quando preencho um RG com exatamente 7 caracteres
    Então o botão "Próximo" deve ficar habilitado
```

## CT-CAD-12 — RG com caracteres não alfanuméricos

```gherkin
  Cenário: Caracteres não alfanuméricos são removidos durante a digitação do RG
    Dado que estou na etapa 2 do Cadastro
    Quando digito um RG contendo pontos e traços
    Então o valor do campo deve conter apenas os caracteres alfanuméricos digitados
    E o botão "Próximo" deve ficar habilitado
```

## CT-CAD-13 — RG acima do limite de caracteres

```gherkin
  Cenário: Digitação de RG acima de 10 caracteres é truncada
    Dado que estou na etapa 2 do Cadastro
    Quando digito um RG com mais de 10 caracteres
    Então o valor do campo deve ser truncado em 10 caracteres
    E o botão "Próximo" deve ficar habilitado
```

## CT-CAD-14 — Nome com dígitos (BUG-27)

```gherkin
  Cenário: Nome com dígitos avança por todas as etapas e falha só no envio final
    Dado que estou na etapa 1 do Cadastro
    Quando preencho o nome com dígitos (ex.: "Ana2 Souza3")
    Então o botão "Próximo" deve ficar habilitado
    Quando completo as demais etapas do cadastro normalmente e confirmo o envio
    Então devo permanecer na tela de cadastro, sem sucesso
```
