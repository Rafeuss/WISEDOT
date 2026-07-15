# Relatório de Bugs — AcademyWallet

**Formato baseado em:** ISO/IEC/IEEE 29119-3 (Test Incident Report)
**Ambiente:** Backend NestJS (`http://localhost:3000`) + Frontend Next.js (`https://localhost:3001`, cert self-signed) + PostgreSQL 16, via Docker local
**Usuário de teste:** `qa.seed.user@academywallet.test` (seed com saldo R$ 10.000,00 e 14 produtos de investimento)

**Escala de severidade:** Crítica (bloqueia/compromete uso ou segurança), Alta (funcionalidade importante quebrada, sem workaround razoável), Média (funcionalidade degradada, com workaround), Baixa (cosmético/UX menor).

**Campos de cada registro:** Severidade, Passos para reproduzir, Resultado esperado, Resultado observado, Evidência. A investigação de causa e a definição da correção ficam com o time de desenvolvimento.

---

## BUG-01 — Teclado numérico do PIN de transação não oferece confirmação visual ao usuário

- **Severidade:** Alta, clicando no botão cujo par contém o dígito desejado, a confirmação funciona; o problema de UX permanece
- **Passos para reproduzir:**
  1. Iniciar qualquer fluxo que exija confirmação por PIN (pagamento de boleto, investimento, resgate).
  2. Ao chegar na etapa final, abrir o modal "Senha".
  3. Observar o teclado numérico exibido e tentar digitar um PIN específico sem conhecimento prévio do mecanismo.
- **Resultado esperado:** O usuário deveria ter alguma forma de confirmar visualmente que o dígito correto foi registrado a cada clique (mesmo que o teclado use pares ofuscados por segurança).
- **Resultado observado:** O teclado exibe 5 botões (+ apagar), cada um rotulado com um par de dígitos gerado aleatoriamente a cada abertura do modal (ex.: "5 ou 9"). O input mascara todo valor com "•", sem qualquer feedback de qual dígito do par foi considerado. Em reteste, a confirmação é aceita quando se clica, para cada dígito, no botão cujo par o contém; sem nenhuma instrução na tela, porém, o usuário só descobre isso por tentativa e erro.
- **Evidência:** `evidencias/exploracao-manual/pagamento-modal-senha-pin-teclado.png`, `pagamento-pin-apos-clique-5ou9.png`

---

## BUG-02 — Logout não invalida a sessão (token JWT continua válido)

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Login normal na aplicação.
  2. Abrir o dropdown de perfil (avatar) e clicar em "Sair".
  3. Inspecionar `document.cookie` (DevTools) e tentar navegar para `/auth/register` ou recarregar `/wallet`.
- **Resultado esperado:** Ao sair, o token de sessão deve ser revogado/invalidado (no backend e/ou removido do cliente), impedindo acesso a rotas autenticadas.
- **Resultado observado:** Nenhuma chamada de API de logout é disparada. O cookie `token` (JWT, não HttpOnly) permanece intacto e válido; ao navegar manualmente para `/auth/register`, o app redireciona de volta para `/wallet`, provando que a sessão antiga ainda é aceita. O token só perde validade pela expiração natural de 1 hora.
- **Evidência:** `evidencias/exploracao-manual/perfil-dropdown-conta.png`

---

## BUG-03 — Módulo de Notificações inoperante no frontend

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Login na aplicação.
  2. Clicar no ícone de sino (ou navegar para `/notification`).
- **Resultado esperado:** Lista de notificações do usuário (ou mensagem de "nenhuma notificação").
- **Resultado observado:** Tela renderiza apenas o título "Notificações", sem conteúdo e sem feedback. Toda chamada do hook de notificações dispara `GET https://localhost:3001/undefined/notification` → 404 (o `undefined` no caminho é visível no DevTools). O erro se repete em toda navegação do app, poluindo o console. Chamado diretamente, `GET /notification` do backend responde normalmente (ver BUG-23 para um problema distinto do mesmo módulo), o que restringe o defeito ao frontend.
- **Evidência:** `evidencias/exploracao-manual/notificacoes-pagina.png`

---

## BUG-04 — Recuperação de senha falha com 500 não tratado (conta de e-mail de demonstração)

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Ir em "Esqueci minha senha".
  2. Informar um e-mail válido (cadastrado ou não) e clicar em "Enviar".
  3. Reproduzido também diretamente via `POST /auth/request-otp`.
- **Resultado esperado:** E-mail de recuperação enviado e feedback de sucesso ao usuário (ou mensagem de erro tratada, caso o envio falhe).
- **Resultado observado:** Na exploração manual via UI, a chamada aparentava retornar 404, sem nenhum toast ou mensagem de erro ao usuário. Reproduzindo direto na API, `POST /auth/request-otp` retorna 500 Internal Server Error; os logs do container do backend registram a rejeição do envio do e-mail pelo provedor (conta de demonstração do Mailtrap só aceita o próprio dono como destinatário), sem nenhum tratamento dessa falha.
- **Evidência:** `evidencias/exploracao-manual/esqueci-senha-bug-404-sem-feedback.png`; reproduzido via `api/cypress/e2e/auth/auth.cy.js` (CT-API-AUTH-05) e logs do container `backend-api-1`.

---

## BUG-05 — Não existe tela de extrato completo de transações

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Com transações já existentes na conta (ex.: após pagar um boleto), observar a seção "Últimas movimentações" na Home.
  2. Procurar por uma forma de ver o histórico completo; testar diretamente as rotas `/statement` e `/extract`.
- **Resultado esperado:** Deveria existir uma tela de extrato completo, com paginação/filtro por período, acessível a partir da Home (conforme sugerido no protótipo Figma).
- **Resultado observado:** Nenhum link "ver mais"/"ver extrato" aparece mesmo com transações existentes na conta. As rotas `/statement` e `/extract` retornam 404. A única visualização de histórico é o widget "Últimas movimentações" da Home, sem paginação nem detalhe por transação. O backend já expõe endpoints de listagem completa e filtro por período (`/transaction/all`, `/transaction/filtro`, ver Swagger), então a lacuna está restrita ao frontend.
- **Evidência:** `evidencias/exploracao-manual/CT-EXT-005-boleto-pago-sucesso-extrato.png`

---

## BUG-06 — Mensagens de validação inline ficam obsoletas (fora de sincronia com o campo)

- **Severidade:** Média
- **Passos para reproduzir:**
  1. No Login ou Cadastro, digitar um valor inválido em um campo (ex.: senha curta) até ver a mensagem de erro.
  2. Corrigir o valor até ele se tornar válido (ex.: completar 8+ caracteres), digitando via teclado (não colar).
- **Resultado esperado:** A mensagem de erro deve desaparecer assim que o valor do campo se tornar válido.
- **Resultado observado:** A mensagem de erro permanece visível mesmo com o campo já válido (e o botão de submit já habilitado); ela só desaparece quando outro campo do formulário é alterado. Reproduzido também no campo "Nome Completo" do Cadastro.
- **Evidência:** `evidencias/exploracao-manual/cadastro-bug-validacao-nome-completo.png`, `cadastro-etapa2-bug-msg-rg-persistente.png`, `login-validacao-email-senha-invalidos.png`

---

## BUG-07 — Chamada de API redundante retorna 500 em toda navegação

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Logar na aplicação.
  2. Observar as requisições de rede (DevTools) em qualquer navegação de página, incluindo `/investment`.
- **Resultado esperado:** Apenas as chamadas necessárias e bem-sucedidas para exibir os dados (ex.: `GET /api/wallet/{userId}`).
- **Resultado observado:** Além da chamada correta `GET /api/wallet/{userId}`, que responde com sucesso, o app dispara em paralelo um `GET /api/wallet` sem ID de usuário, que retorna 500 Internal Server Error em toda navegação. O mesmo padrão ocorre no carregamento inicial da rota `/investment`.
- **Evidência:** observado na aba Network do DevTools durante a exploração manual, em toda navegação autenticada

---

## BUG-08 — Rótulo "Juros" duplicado na tela de resumo do pagamento

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Completar um pagamento de boleto até a tela "Resumo do pagamento" (etapa 3).
- **Resultado esperado:** Exibição de todos os componentes do valor (valor original, juros, multa, desconto, valor total), cada um com rótulo único.
- **Resultado observado:** O rótulo "Juros" aparece duplicado — uma vez na primeira coluna de valores, outra na segunda coluna, que muito provavelmente deveria exibir "Desconto" (campo presente na etapa 2, mas ausente/substituído incorretamente na etapa 3).
- **Evidência:** `evidencias/exploracao-manual/pagamento-etapa3-resumo-bug-juros-duplicado.png`

---

## BUG-09 — Cards de resumo de Investimentos ficam desatualizados após concluir um aporte

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Realizar um investimento com sucesso.
  2. Sem dar F5, navegar de volta para a lista de produtos (`/investment`) pelo breadcrumb.
- **Resultado esperado:** Os cards "Total investido" / "Total de resgate" no topo da página devem refletir o valor recém-investido.
- **Resultado observado:** Os cards mostram R$ 0,00, mesmo com o investimento já visível corretamente na aba "Meus investimentos" logo abaixo. Um reload completo (F5) corrige os valores exibidos.
- **Evidência:** `evidencias/exploracao-manual/CT-EXT-018-investment-page-reload-totais.png`

---

## BUG-10 — Mensagem de validação do código de barras não diferencia campo vazio de valor inválido

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Na tela de pagamento, deixar o campo de código de barras vazio e clicar em "Continuar".
  2. Preencher com um valor curto (ex.: 9 dígitos) e tentar novamente.
- **Resultado esperado:** Mensagens diferentes para "campo obrigatório" e para "formato/tamanho inválido".
- **Resultado observado:** Ambos os casos exibem a mesma mensagem genérica "Preencha o código de barras", mesmo quando o campo está de fato preenchido (só que com valor inválido).
- **Evidência:** `evidencias/exploracao-manual/pagamento-bug-msg-codigo-barras-curto.png`

---

## BUG-11 — Botão "Próximo" do Cadastro (etapa 1) às vezes exige dois cliques

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Preencher corretamente todos os campos da etapa 1 do cadastro.
  2. Clicar em "Próximo".
- **Resultado esperado:** Avançar imediatamente para a etapa 2.
- **Resultado observado:** Em algumas execuções, o primeiro clique não produz nenhum efeito visível (nem erro, nem avanço); um segundo clique avança normalmente.
- **Evidência:** `evidencias/exploracao-manual/cadastro-apos-clicar-proximo-sem-avancar.png`

---

## BUG-12 — Botão "Carregar mais" permanece ativo mesmo sem mais resultados

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Buscar por um termo que retorne poucos resultados (ex.: "ARX", que retorna apenas 2 dos 14 fundos).
- **Resultado esperado:** O botão "Carregar mais" deveria ficar desabilitado/oculto quando não há mais páginas de resultado.
- **Resultado observado:** O botão continua visível e clicável mesmo quando todos os resultados disponíveis já foram exibidos.
- **Evidência:** observado durante o reteste com a massa de dados do seed (14 produtos de investimento)

---

## BUG-13 — Inconsistência de sinal entre tipos de débito nas movimentações

- **Severidade:** Baixa 
- **Passos para reproduzir:**
  1. Realizar um pagamento de boleto e um investimento.
  2. Comparar como cada um aparece na lista de "Últimas movimentações".
- **Resultado esperado:** Todas as saídas de caixa (débitos) devem ser exibidas de forma consistente (ex.: sempre com sinal negativo).
- **Resultado observado:** "Boleto pago" aparece com sinal negativo (ex.: "R$ -150,75"), enquanto "Investimento realizado" aparece sem sinal (ex.: "R$ 500,00"), apesar de ambos serem débitos da conta corrente.
- **Evidência:** observado durante o reteste com a massa de dados do seed (14 produtos de investimento)

---

## BUG-14 — Caractere solto `;` renderizado na tela de "Esqueci minha senha"

- **Severidade:** Baixa 
- **Passos para reproduzir:**
  1. Acessar a tela "Esqueci minha senha".
- **Resultado esperado:** Nenhum caractere solto/órfão deve aparecer na tela.
- **Resultado observado:** Um caractere `;` aparece renderizado visualmente logo abaixo do campo de e-mail, fora de qualquer texto.
- **Evidência:** `evidencias/exploracao-manual/esqueci-senha-pagina.png`

---

## BUG-15 — Tela "Esqueci minha senha" não valida formato de e-mail com feedback inline

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Digitar um e-mail em formato inválido no campo da tela "Esqueci minha senha".
- **Resultado esperado:** Mensagem inline "Insira um e-mail válido", consistente com o padrão usado em Login e Cadastro.
- **Resultado observado:** O botão "Enviar" permanece desabilitado, mas nenhuma mensagem de erro é exibida ao usuário, diferente do padrão usado nas demais telas de autenticação.
- **Evidência:** `evidencias/exploracao-manual/esqueci-senha-pagina.png`

---

## BUG-16 — Login degrada severamente sob carga concorrente

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Executar o cenário `perf/login/smoke.js` (k6, 5 VUs constantes por 30s) contra `POST /auth/login`.
- **Resultado esperado:** p95 do tempo de resposta abaixo de 500ms (threshold definido para os testes de performance de API).
- **Resultado observado:** p95 de 11,66s (máximo de 13,32s) com apenas 5 usuários virtuais simultâneos. O padrão de latência cresce de forma praticamente proporcional ao número de logins concorrentes, compatível com as validações sendo processadas uma de cada vez (cada login aguarda o anterior terminar).
- **Evidência:** `evidencias/performance/login-smoke-k6-output.txt`, thresholds configurados em `perf/lib/thresholds.js`.

---

## BUG-17 — Toast de sucesso do cadastro corre risco de nunca ser exibido (navegação antes do toast)

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Completar as 4 etapas do cadastro com dados válidos.
  2. Observar a tela imediatamente após o clique final em "Entrar".
- **Resultado esperado:** O toast "Usuário cadastrado com sucesso!" deve ser exibido de forma confiável antes ou durante a navegação de volta para o login.
- **Resultado observado:** o toast pode não ter tempo de aparecer, ou aparecer de forma tão breve que passa despercebido: a navegação de volta para o login acontece imediatamente após o clique, antes de qualquer confirmação visual se firmar na tela.
- **Evidência:** `evidencias/exploracao-manual/cadastro-sucesso-toast.png` (print capturado no instante da navegação de retorno ao login, sem nenhum toast visível na tela)

---

## BUG-18 — Violações de acessibilidade (WCAG) confirmadas em Login, Home e Pagamentos

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Executar a suíte de acessibilidade (`gui/cypress/e2e/acessibilidade/acessibilidade.cy.js`) contra as 10 telas/etapas cobertas: Login, Home, Pagamentos (etapas 1, 2 e 3), Cadastro, Recuperação de senha, Investimentos, Notificações e Extrato completo.
- **Resultado esperado:** Nenhuma violação `critical`/`serious` nas telas testadas.
- **Resultado observado (execução local, com backend e frontend rodando):**
  - Login (2 violações): `[serious] html-has-lang`, `[moderate] landmark-unique`.
  - Home/Carteira (8 violações): `[critical] button-name`, `[minor] empty-heading`, `[serious] html-has-lang`, `[moderate] landmark-main-is-top-level`, `[moderate] landmark-no-duplicate-main`, `[moderate] landmark-unique` (2 elementos), `[serious] link-name`, `[moderate] region`.
  - Pagamentos, etapa 1 (4 violações): `[serious] html-has-lang`, `[serious] label-title-only`, `[moderate] landmark-unique`, `[moderate] region`.
  - Cadastro (3 violações): `[critical] button-name`, `[serious] html-has-lang`, `[moderate] landmark-unique`.
  - Recuperação de senha (2 violações): `[serious] html-has-lang`, `[moderate] landmark-unique`.
  - Investimentos (7 violações): `[critical] button-name` (2 elementos), `[serious] color-contrast`, `[serious] html-has-lang`, `[moderate] landmark-main-is-top-level`, `[moderate] landmark-no-duplicate-main`, `[moderate] landmark-unique` (2 elementos), `[moderate] region` (2 elementos).
  - Notificações (3 violações): `[serious] html-has-lang`, `[moderate] landmark-unique`, `[moderate] region`.
  - Extrato completo (4 violações): `[critical] button-name`, `[serious] html-has-lang`, `[moderate] landmark-unique`, `[moderate] region`.
  - Pagamentos, etapa 2 "Para quando?" (6 violações): `[critical] label` (1 elemento), `[serious] color-contrast` (12 elementos), `[serious] html-has-lang`, `[serious] label-title-only` (11 elementos), `[moderate] landmark-unique`, `[moderate] region` (2 elementos).
  - Pagamentos, etapa 3 "Resumo" (6 violações): mesmo padrão da etapa 2 — `[critical] label` (1 elemento), `[serious] color-contrast` (12 elementos), `[serious] html-has-lang`, `[serious] label-title-only` (11 elementos), `[moderate] landmark-unique`, `[moderate] region` (2 elementos).
- **Evidência:** `gui/wcag-checklist.json`, log de execução da suíte (`gui/cypress/e2e/acessibilidade/acessibilidade.cy.js`).

---

## BUG-19 — Formulário de aporte de investimento não aplica nenhum limite superior de valor

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Na tela de resgate/aporte de um investimento, informar um valor alto (ex.: R$ 1.500,00).
- **Resultado esperado:** o formulário deveria validar o valor contra algum limite superior (ou ao menos contra o saldo disponível) antes de habilitar a confirmação.
- **Resultado observado:** o botão permanece habilitado com qualquer valor (testado com R$ 1.500,00); nenhuma validação de limite superior ou de saldo acontece no formulário, e a rejeição só ocorre no backend, depois de o usuário já ter confirmado a operação e digitado o PIN.
- **Evidência:** confirmado informando R$ 1.500,00 na tela de aporte e observando o botão permanecer habilitado (sem print dedicado; sem diferença visual da tela padrão).

---

## BUG-20 — Botão final do cadastro pode disparar reload nativo do formulário, abortando a requisição de cadastro

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Completar as 4 etapas do cadastro com dados válidos, em uma máquina/rede lenta (ou em CI).
  2. Clicar no botão final (`id="enter-btn"`).
- **Resultado esperado:** O cadastro deve ser concluído de forma confiável, independentemente da velocidade de rede/máquina.
- **Resultado observado:** em condições mais lentas, o cadastro pode falhar de forma intermitente e sem qualquer mensagem de erro ao usuário. Quando a falha ocorre, a página recarrega no clique (comportamento de submissão nativa do formulário) e a requisição `POST /user` aparece cancelada na aba Network do DevTools.
- **Evidência:** falhas intermitentes observadas em execuções da suíte de UI em CI, com o recarregamento e a requisição cancelada visíveis ao reproduzir com o DevTools aberto.

---

## BUG-21 — Mensagem de sucesso do pagamento de boleto nunca é exibida ao usuário

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Confirmar um pagamento de boleto com sucesso.
  2. Observar a tela imediatamente após a confirmação.
- **Resultado esperado:** Uma mensagem de sucesso explícita e visível (toast/banner) confirmando o pagamento.
- **Resultado observado:** nenhum toast, banner ou mensagem aparece em momento algum; o usuário só percebe o sucesso indiretamente, pela navegação de volta à tela de pagamentos.
- **Evidência:** observação da tela após pagamentos concluídos com sucesso, em múltiplas execuções.

---

## BUG-22 — Módulo `current-account` sem autenticação em nenhum endpoint e com contrato de resposta quebrado

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Sem enviar nenhum header `Authorization`, chamar `GET /current-account`, `GET /current-account/:id`, `POST /current-account`, `PATCH /current-account/:id` e `DELETE /current-account/:id`.
  2. Repetir `PATCH /current-account/:id` enviando `{ "balance": <valor> }` no corpo.
  3. Repetir `PATCH /current-account/:id` com corpo vazio (`{}`).
  4. Repetir `GET /current-account/:id` com um id em formato UUID válido, mas inexistente no banco.
- **Resultado esperado:** os endpoints deveriam exigir autenticação; `GET` deveria retornar os dados da conta; `PATCH` deveria alterar o saldo apenas mediante autenticação e dono correto da conta; `DELETE` deveria remover o registro; um id inexistente deveria retornar 404, não 500.
- **Resultado observado:**
  - Nenhum dos 5 endpoints exige autenticação — todos respondem sem token.
  - `GET /current-account` e `GET /current-account/:id` sempre retornam `data: null`, mesmo com um registro existente.
  - `GET /current-account/:id` com id inexistente retorna 500 não tratado.
  - `POST /current-account` sempre retorna 422 (rejeita os campos `balance` e `wallet`).
  - `PATCH /current-account/:id` com `{ "balance": ... }` também retorna 422; com corpo vazio, retorna 500. Em nenhum dos dois casos o saldo é alterado (confirmado consultando o banco após a chamada).
  - `DELETE /current-account/:id` responde 200 com mensagem de sucesso, mas o registro permanece intacto no banco.
- **Evidência:** `evidencias/api/current-account-sem-autenticacao.txt` (transcrição completa das chamadas); `api/cypress/e2e/current-account/current-account.cy.js` (CT-API-CTA-01 a 08).

---

## BUG-23 — Notificações: envio sem autenticação para qualquer usuário e falta de verificação de posse ao marcar como vista (IDOR)

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Sem nenhum token, chamar `POST /notification` com `{ "userId": "<id de qualquer usuário>" }`.
  2. Autenticado como esse usuário, chamar `GET /notification` e confirmar que a notificação chegou.
  3. Enviar uma notificação para um segundo usuário (B) e obter o `notificationId` dela autenticado como B.
  4. Autenticado como um usuário diferente (A), chamar `PATCH /notification/mark-as-seen` com o `notificationId` de B.
  5. Autenticado novamente como B, conferir se a notificação aparece marcada como vista.
- **Resultado esperado:** `POST /notification` deveria exigir autenticação e só permitir envio para o próprio usuário autenticado; `PATCH /mark-as-seen` deveria validar que a notificação pertence ao usuário autenticado antes de atualizá-la.
- **Resultado observado:** a notificação do passo 1 é entregue de fato, mesmo sem token. No passo 4, a notificação do usuário B é marcada como vista pelo usuário A, e o passo 5 confirma a alteração do lado de B.
- **Evidência:** `evidencias/api/notification-sem-autenticacao-e-idor.txt` (transcrição completa das chamadas); `api/cypress/e2e/notification/notification.cy.js` (CT-API-NOT-03 e CT-API-NOT-06).

---

## BUG-24 — `validate-otp` quebra com 500 não tratado quando o usuário nunca solicitou um OTP

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Com um usuário que nunca chamou `POST /auth/request-otp`, chamar diretamente `POST /auth/validate-otp` com qualquer token.
- **Resultado esperado:** um erro tratado (401 "Token inválido" ou 400), igual ao caso de um token incorreto para um usuário que já solicitou OTP.
- **Resultado observado:** a chamada retorna 500 Internal Server Error.
- **Evidência:** `evidencias/api/validate-otp-500-sem-solicitacao-previa.txt`; `api/cypress/e2e/auth/auth.cy.js` (CT-API-AUTH-07b).

---

## BUG-25 — `PATCH /user/:id/first-access` alterna o valor em vez de só marcar como concluído

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Cadastrar um novo usuário (`firstAccess` nasce `true`) e autenticar.
  2. Chamar `PATCH /user/:id/first-access` uma vez e conferir `firstAccess` via `GET /user` (vira `false`).
  3. Chamar `PATCH /user/:id/first-access` uma segunda vez e conferir `firstAccess` novamente.
- **Resultado esperado:** conforme a documentação do próprio endpoint no Swagger ("Marca o primeiro acesso do usuário como concluído"), o valor deveria ser fixado em `false` e permanecer assim em chamadas subsequentes.
- **Resultado observado:** a segunda chamada volta `firstAccess` para `true`.
- **Evidência:** `api/cypress/e2e/user/user.cy.js` (CT-API-USER-07 e CT-API-USER-08).

---

## BUG-26 — Cadastro rejeita RG de 11 a 14 caracteres, contrariando a documentação do Swagger

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Chamar `POST /user` com um `rg` alfanumérico de 11 a 14 caracteres (ex.: `12345678901`).
- **Resultado esperado:** conforme a documentação do Swagger do endpoint ("RG (7 a 14 dígitos alfanuméricos)"), um RG de 11 a 14 caracteres deveria ser aceito.
- **Resultado observado:** a chamada retorna 422. Testando os limites, só RGs de 7 a 10 caracteres alfanuméricos são aceitos; de 11 a 14, todos são rejeitados, contrariando a documentação. Pela aplicação esse cenário não ocorre, porque o campo de RG do frontend limita a digitação a 10 caracteres; o comportamento aparece para consumidores diretos da API (integrações, ou quem confia no Swagger).
- **Evidência:** `api/cypress/e2e/user/user.cy.js` (testes de limite de campo do RG).

---

## BUG-27 — Validação do campo Nome do Cadastro diverge entre as etapas (números/símbolos passam na etapa 1 e só falham no envio final)

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Na etapa 1 do Cadastro, informar um nome com números (ex.: `Ana2 Souza3`).
  2. Observar que nenhum erro inline aparece e o botão "Próximo" fica habilitado.
  3. Completar as etapas 2 a 4 normalmente e clicar em concluir o cadastro.
- **Resultado esperado:** se o backend exige que o nome contenha apenas letras e espaços, o frontend deveria bloquear o mesmo padrão já na etapa 1, evitando que o usuário percorra o formulário inteiro só para descobrir o erro no final.
- **Resultado observado:** a etapa 1 aceita números e símbolos no nome sem nenhum erro inline, com o botão "Próximo" habilitado. O backend rejeita o mesmo nome com 422 (só aceita letras, acentos e espaços). Um nome como `Ana2 Souza3` é aceito em todas as 4 etapas do wizard e só falha no `POST /user` do envio, obrigando o usuário a voltar ao início para corrigir.
- **Evidência:** `gui/cypress/e2e/cadastro/cadastro.cy.js` (teste de regressão do nome com números); `api/cypress/e2e/user/user.cy.js` (teste de contrato do mesmo campo no backend).

---

## Resumo por severidade

| Severidade | Quantidade | IDs |
|---|---|---|
| Crítica | 0 | — |
| Alta | 6 | BUG-01, BUG-02, BUG-03, BUG-04, BUG-16, BUG-23 |
| Média | 11 | BUG-05, BUG-06, BUG-07, BUG-08, BUG-09, BUG-17, BUG-18, BUG-20, BUG-21, BUG-22, BUG-27 |
| Baixa | 10 | BUG-10, BUG-11, BUG-12, BUG-13, BUG-14, BUG-15, BUG-19, BUG-24, BUG-25, BUG-26 |
| **Total** | **27** | |
