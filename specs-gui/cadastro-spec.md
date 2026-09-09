# Especificação de Testes — Cadastro (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/cadastro/cadastro.cy.js`
Módulo classificado como **RBT Alto (16)** — ver `planoDeTestes.md` seção 7.8.

## CT-CAD-01 — Deve concluir o cadastro com sucesso preenchendo as 4 etapas (skip — BUG-20)

*Skip: aguardando correção do BUG-20 (o submit final dispara reload nativo do formulário e aborta a requisição de cadastro).*

```gherkin
Funcionalidade: Cadastro de usuário
  Como um visitante da aplicação
  Quero me cadastrar preenchendo dados pessoais, documentos, senha transacional e revisão
  Para criar uma conta na carteira digital

  Cenário: deve concluir o cadastro com sucesso preenchendo as 4 etapas
    Dado que estou na tela de Cadastro
    Quando preencho a etapa 1 com nome, e-mail (único) e senha válidos
    E preencho a etapa 2 com CPF (único e válido) e RG válidos
    E preencho a etapa 3 com um PIN transacional de 6 dígitos
    E confirmo os dados na etapa 4 de revisão
    Então devo ver a mensagem "Usuário cadastrado com sucesso!"
```

## CT-CAD-02 — Deve rejeitar cadastro com e-mail já cadastrado

```gherkin
  Cenário: deve rejeitar cadastro com e-mail já cadastrado
    Dado que já existe um usuário cadastrado com um determinado e-mail
    Quando tento me cadastrar usando esse mesmo e-mail
    E completo as demais etapas do cadastro
    Então devo ver a mensagem "E-mail, CPF ou RG já cadastrados"
```

## CT-CAD-03 — Deve bloquear o avanço com uma senha fraca

```gherkin
  Cenário: deve bloquear o avanço com uma senha fraca
    Dado que estou na etapa 1 do Cadastro
    Quando preencho uma senha sem letra maiúscula, número e caractere especial
    Então devo ver a mensagem de senha inválida
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-04 — Deve bloquear o avanço com e-mail em formato inválido

```gherkin
  Cenário: deve bloquear o avanço com e-mail em formato inválido
    Dado que estou na etapa 1 do Cadastro
    Quando preencho um e-mail em formato inválido
    Então devo ver a mensagem "Insira um e-mail válido."
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-05 — Deve permitir avançar com nome válido de dois nomes mesmo com a mensagem residual (BUG-06)

```gherkin
  Cenário: deve permitir avançar com nome válido de dois nomes mesmo com a mensagem residual do BUG-06
    Dado que estou na etapa 1 do Cadastro
    Quando preencho o campo Nome apenas com "Ana" e saio do campo
    Então devo ver a mensagem "O nome completo deve conter pelo menos dois nomes."
    Quando completo o campo Nome para "Ana Souza" e preencho e-mail e senha válidos
    Então o botão "Próximo" deve ficar habilitado
    E devo conseguir avançar para a etapa 2 (CPF/RG)
```

## CT-CAD-06 — Deve bloquear o avanço com RG menor que 7 caracteres

```gherkin
  Cenário: deve bloquear o avanço com RG menor que 7 caracteres
    Dado que estou na etapa 2 do Cadastro
    Quando preencho um RG com menos de 7 caracteres
    Então devo ver a mensagem "RG deve ter pelo menos 7 caracteres"
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-07 — Deve bloquear o avanço com CPF de dígitos repetidos

```gherkin
  Cenário: deve bloquear o avanço com CPF de dígitos repetidos
    Dado que estou na etapa 2 do Cadastro
    Quando preencho o CPF com dígitos repetidos (ex.: "11111111111")
    Então devo ver a mensagem "Dados inválidos"
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-08 — Deve bloquear o avanço com CPF de dígito verificador inválido

```gherkin
  Cenário: deve bloquear o avanço com CPF de dígito verificador inválido
    Dado que estou na etapa 2 do Cadastro
    Quando preencho um CPF com dígitos distintos mas dígito verificador incorreto
    Então devo ver a mensagem "Dados inválidos"
    E o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-09 — Deve permitir avançar com senha de exatamente 8 caracteres

```gherkin
  Cenário: deve permitir avançar com senha de exatamente 8 caracteres
    Dado que estou na etapa 1 do Cadastro
    Quando preencho uma senha de exatamente 8 caracteres que atende todos os requisitos
    Então o botão "Próximo" deve ficar habilitado
```

## CT-CAD-10 — Deve bloquear o avanço com senha contendo espaço

```gherkin
  Cenário: deve bloquear o avanço com senha contendo espaço
    Dado que estou na etapa 1 do Cadastro
    Quando preencho uma senha contendo um espaço
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-11 — Deve permitir avançar com RG de exatamente 7 caracteres

```gherkin
  Cenário: deve permitir avançar com RG de exatamente 7 caracteres
    Dado que estou na etapa 2 do Cadastro
    Quando preencho um RG com exatamente 7 caracteres
    Então o botão "Próximo" deve ficar habilitado
```

## CT-CAD-12 — Deve remover automaticamente caracteres não alfanuméricos digitados no RG

```gherkin
  Cenário: deve remover automaticamente caracteres não alfanuméricos digitados no RG
    Dado que estou na etapa 2 do Cadastro
    Quando digito um RG contendo pontos e traços
    Então o valor do campo deve conter apenas os caracteres alfanuméricos digitados
    E o botão "Próximo" deve ficar habilitado
```

## CT-CAD-13 — Deve truncar em 10 caracteres o RG digitado com mais de 10 caracteres

```gherkin
  Cenário: deve truncar em 10 caracteres o RG digitado com mais de 10 caracteres
    Dado que estou na etapa 2 do Cadastro
    Quando digito um RG com mais de 10 caracteres
    Então o valor do campo deve ser truncado em 10 caracteres
    E o botão "Próximo" deve ficar habilitado
```

## CT-CAD-14 — Deve bloquear o avanço da etapa 1 com um nome contendo dígitos (BUG-27)

*Skip: aguardando correção do BUG-27 (etapa 1 aceita nome com números/símbolos e só falha no envio final).*

```gherkin
  Cenário: deve bloquear o avanço da etapa 1 com um nome contendo dígitos (BUG-27)
    Dado que estou na etapa 1 do Cadastro
    Quando preencho o nome com dígitos (ex.: "Ana2 Souza3")
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-15 — Deve bloquear o avanço com a etapa 1 sem preencher

```gherkin
  Cenário: deve bloquear o avanço com a etapa 1 sem preencher
    Dado que estou na etapa 1 do Cadastro
    Quando não preencho nenhum campo
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-16 — Deve bloquear o avanço preenchendo apenas o nome na etapa 1

```gherkin
  Cenário: deve bloquear o avanço preenchendo apenas o nome na etapa 1
    Dado que estou na etapa 1 do Cadastro
    Quando preencho apenas o nome, deixando e-mail e senha vazios
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-17 — Deve bloquear o avanço com CPF e RG vazios na etapa 2

```gherkin
  Cenário: deve bloquear o avanço com CPF e RG vazios na etapa 2
    Dado que estou na etapa 2 do Cadastro
    Quando não preencho o CPF nem o RG
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-18 — Deve bloquear o avanço com o PIN incompleto na etapa 3

```gherkin
  Cenário: deve bloquear o avanço com o PIN incompleto na etapa 3
    Dado que estou na etapa 3 do Cadastro
    Quando preencho menos de 6 dígitos do PIN
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-19 — Deve preservar os dados da etapa 1 ao voltar da etapa 2

```gherkin
  Cenário: deve preservar os dados da etapa 1 ao voltar da etapa 2
    Dado que preenchi a etapa 1 e avancei para a etapa 2
    Quando clico em "Voltar"
    Então devo ver a etapa 1 com o nome, e-mail e senha ainda preenchidos
```

## CT-CAD-20 — Deve exibir os dados preenchidos na etapa de revisao

```gherkin
  Cenário: deve exibir os dados preenchidos na etapa de revisao
    Dado que preenchi todas as etapas do Cadastro
    Quando chego na etapa de revisão
    Então devo ver o nome, e-mail e RG que informei
```

## CT-CAD-21 — Deve bloquear o avanço preenchendo apenas o e-mail na etapa 1

```gherkin
  Cenário: deve bloquear o avanço preenchendo apenas o e-mail na etapa 1
    Dado que estou na etapa 1 do Cadastro
    Quando preencho apenas o e-mail, deixando nome e senha vazios
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-22 — Deve bloquear o avanço preenchendo apenas a senha na etapa 1

```gherkin
  Cenário: deve bloquear o avanço preenchendo apenas a senha na etapa 1
    Dado que estou na etapa 1 do Cadastro
    Quando preencho apenas a senha, deixando nome e e-mail vazios
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-23 — Deve bloquear o avanço preenchendo apenas o CPF na etapa 2

```gherkin
  Cenário: deve bloquear o avanço preenchendo apenas o CPF na etapa 2
    Dado que estou na etapa 2 do Cadastro
    Quando preencho apenas o CPF, deixando o RG vazio
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-24 — Deve bloquear o avanço preenchendo apenas o RG na etapa 2

```gherkin
  Cenário: deve bloquear o avanço preenchendo apenas o RG na etapa 2
    Dado que estou na etapa 2 do Cadastro
    Quando preencho apenas o RG, deixando o CPF vazio
    Então o botão "Próximo" deve permanecer desabilitado
```

## CT-CAD-25 — Deve preservar os dados da etapa 2 ao voltar da etapa 3

```gherkin
  Cenário: deve preservar os dados da etapa 2 ao voltar da etapa 3
    Dado que preenchi as etapas 1 e 2 e avancei para a etapa 3
    Quando clico em "Voltar"
    Então devo ver a etapa 2 com o CPF e o RG ainda preenchidos
```

## CT-CAD-26 — Deve voltar para a etapa 1 ao editar o nome pela tela de revisao

```gherkin
  Cenário: deve voltar para a etapa 1 ao editar o nome pela tela de revisao
    Dado que preenchi todas as etapas e cheguei na revisão
    Quando clico no ícone de editar o nome
    Então devo voltar para a etapa 1 com o nome ainda preenchido
```

## CT-CAD-27 — Não deve quebrar o layout da Home nem do cartão de perfil com um nome comprido sem espaço (skip — BUG-31)

*Skip: aguardando correção do BUG-31 (nome comprido sem espaço quebra o layout da Home e do cartão de perfil).*

```gherkin
  Cenário: não deve quebrar o layout da Home nem do cartão de perfil com um nome comprido sem espaço
    Dado que me cadastrei com um nome cuja primeira palavra tem mais de 100 letras seguidas, sem espaço
    Quando faço login e vou para a Carteira (Home)
    Então o texto "Olá, [nome]" e o cartão do menu de perfil devem permanecer contidos na largura da tela, sem gerar rolagem horizontal
```

## CT-CAD-28 — Não deve aceitar o cadastro de um segundo usuário reutilizando o mesmo RG do primeiro (BUG-30)

*Skip: aguardando correção do BUG-30 (RG não é validado como único; o cadastro aceita RG duplicado em vez de recusar).*

```gherkin
  Cenário: não deve aceitar o cadastro de um segundo usuário reutilizando o mesmo RG do primeiro
    Dado que já existe um usuário cadastrado com um RG específico
    Quando completo um novo cadastro com e-mail e CPF diferentes, mas repetindo o mesmo RG
    Então o cadastro deve ser recusado, do mesmo jeito que acontece com e-mail e CPF duplicados
```
