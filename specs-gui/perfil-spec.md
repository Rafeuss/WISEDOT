# Especificação de Testes — Perfil / Logout (UI)

Arquivo de automação correspondente: `gui/cypress/e2e/perfil/perfil.cy.js`
Módulo classificado como **RBT Alto (15)** — ver `planoDeTestes.md` seção 7.8.

## CT-PERF-01 — Deve exibir os rótulos de dados da conta no dropdown de perfil

```gherkin
Funcionalidade: Perfil da conta
  Como um usuário autenticado
  Quero consultar os dados da minha conta no dropdown de perfil
  Para saber minha agência, conta e instituição

  Cenário: deve exibir os rótulos de dados da conta no dropdown de perfil
    Dado que estou autenticado e na tela da Carteira (Home)
    Quando abro o dropdown de perfil (avatar)
    Então devo ver os rótulos "Agência", "Conta" e "Instituição"
```

## CT-PERF-02 — Deve invalidar o cookie de sessão e bloquear a rota protegida após o logout (BUG-02)

*Skip: aguardando correção do BUG-02 (logout não invalida a sessão; o token JWT continua válido).*

```gherkin
  Cenário: deve invalidar o cookie de sessão e bloquear o acesso à rota protegida após o logout (BUG-02)
    Dado que estou autenticado e o cookie "token" existe
    Quando abro o dropdown de perfil e clico em "Sair"
    Então o cookie "token" não deve mais existir (ou deve estar invalidado)
    E uma rota protegida ("/wallet") não deve mais estar acessível
```

Este cenário é um teste de regressão do BUG-02 (severidade Alta/Segurança, 
o botão "Sair" do dropdown de perfil apenas executa,
 sem chamar `AuthContext.logout()` nem qualquer endpoint de logout no
backend. O cookie `token` (JWT, não `HttpOnly`) permanece válido, e o usuário continua
conseguindo acessar rotas autenticadas mesmo depois de clicar em "Sair".

## CT-PERF-03 — Deve invalidar o cookie de sessão e bloquear a rota protegida ao clicar apenas no ícone de porta (BUG-32)

*Skip: aguardando correção do BUG-02 (logout não invalida a sessão) — este cenário reproduz o mesmo problema clicando apenas no ícone duplicado do botão "Sair" (BUG-32).*

```gherkin
  Cenário: deve invalidar o cookie de sessão e bloquear o acesso à rota protegida ao clicar apenas no ícone de porta (BUG-32)
    Dado que estou autenticado e abri o dropdown de perfil
    Quando clico apenas no ícone de porta, sem tocar no texto "Sair"
    Então também sou deslogado, com o cookie "token" invalidado e a rota protegida bloqueada (mesmo comportamento esperado do botão de texto "Sair")
```

## CT-PERF-04 — Deve copiar o valor correto de cada campo da conta ao clicar no respectivo botao de copiar

```gherkin
  Cenário: deve copiar o valor correto de cada campo da conta ao clicar no respectivo botao de copiar
    Dado que estou autenticado e abri o dropdown de perfil
    Quando clico no botão de copiar do e-mail, e depois no da agência, e depois no da conta, e depois no da instituição, nessa ordem
    Então a área de transferência contém, a cada clique, o valor correspondente ao botão clicado (cada novo clique sobrescreve o anterior)
    E nenhuma confirmação visual (tipo "copiado!") aparece em nenhum dos cliques
```
