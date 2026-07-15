# Especificação de Testes — Perfil / Logout (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/perfil/perfil.cy.js`
Módulo classificado como **RBT Alto (15)** — ver `planoDeTestes.md` seção 7.8.

## CT-PERF-01 — Dropdown exibe dados da conta

```gherkin
Funcionalidade: Perfil da conta
  Como um usuário autenticado
  Quero consultar os dados da minha conta no dropdown de perfil
  Para saber minha agência, conta e instituição

  Cenário: Dropdown de perfil exibe os rótulos de dados da conta
    Dado que estou autenticado e na tela da Carteira (Home)
    Quando abro o dropdown de perfil (avatar)
    Então devo ver os rótulos "Agência", "Conta" e "Instituição"
```

## CT-PERF-02 — Logout não invalida a sessão (regressão BUG-02)

```gherkin
  Cenário: Sessão permanece válida mesmo após clicar em "Sair"
    Dado que estou autenticado e o cookie "token" existe
    Quando abro o dropdown de perfil e clico em "Sair"
    Então o cookie "token" ainda deve existir
    E uma rota protegida ("/wallet") ainda deve estar acessível
```

Este cenário é um teste de regressão do BUG-02 (severidade Alta/Segurança, 
o botão "Sair" do dropdown de perfil apenas executa,
 sem chamar `AuthContext.logout()` nem qualquer endpoint de logout no
backend. O cookie `token` (JWT, não `HttpOnly`) permanece válido, e o usuário continua
conseguindo acessar rotas autenticadas mesmo depois de clicar em "Sair".
