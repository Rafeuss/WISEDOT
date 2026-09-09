# Relatório de Bugs — AcademyWallet

**Formato baseado em:** ISO/IEC/IEEE 29119-3 (Test Incident Report)
**Ambiente:** Backend NestJS (`http://localhost:3000`) + Frontend Next.js (`https://localhost:3001`, cert self-signed) + PostgreSQL 16, via Docker local
**Usuário de teste:** `qa.seed.user@academywallet.test` (seed com saldo R$ 10.000,00 e 14 produtos de investimento)

**Escala de severidade:** Crítica (bloqueia/compromete uso ou segurança), Alta (funcionalidade importante quebrada, sem workaround razoável), Média (funcionalidade degradada, com workaround), Baixa (cosmético/UX menor).

**Campos de cada registro:** Severidade, Passos para reproduzir, Resultado esperado, Resultado observado, Evidência. A investigação de causa e a definição da correção ficam com o time de desenvolvimento.

---

## BUG-01 — Teclado numérico do PIN sem instrução visível (reclassificado para melhoria)

- O comportamento do teclado numérico do PIN (pares de dígitos sem instrução visível) foi reclassificado de defeito para sugestão de melhoria, pois não descumpre nenhuma regra de negócio nem trava o uso do app — é uma questão de experiência de uso.
- **CT relacionado:** não automatizado (reclassificado como melhoria)

---

## BUG-02 — Logout não invalida a sessão (token JWT continua válido)

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Login normal na aplicação.
  2. Abrir o dropdown de perfil (avatar) e clicar em "Sair".
  3. Inspecionar `document.cookie` (DevTools) e tentar navegar para `/auth/register` ou recarregar `/wallet`.
- **Resultado esperado:** Ao sair, o token de sessão deve ser revogado/invalidado (no backend e/ou removido do cliente), impedindo acesso a rotas autenticadas.
- **Resultado observado:** Nenhuma chamada de API de logout é disparada. O cookie `token` (JWT, não HttpOnly) permanece intacto e válido; ao navegar manualmente para `/auth/register`, o app redireciona de volta para `/wallet`, provando que a sessão antiga ainda é aceita. O token só perde validade pela expiração natural de 1 hora.
- **CT relacionado:** CT-PERF-02, CT-PERF-03
- **Evidência:** `evidencias/exploracao-manual/perfil-dropdown-conta.png`

---

## BUG-03 — Módulo de Notificações inoperante no frontend

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Login na aplicação.
  2. Clicar no ícone de sino (ou navegar para `/notification`).
- **Resultado esperado:** Lista de notificações do usuário (ou mensagem de "nenhuma notificação").
- **Resultado observado:** Tela renderiza apenas o título "Notificações", sem conteúdo e sem feedback. Toda chamada de notificações dispara `GET https://localhost:3001/undefined/notification` → 404 (o `undefined` no caminho é visível no DevTools). O erro se repete em toda navegação do app, poluindo o console.
- **CT relacionado:** CT-NOT-01, CT-NOT-02
- **Evidência:** `evidencias/exploracao-manual/notificacoes-pagina.png`

---

## BUG-04 — Recuperação de senha falha com 500 não tratado (conta de e-mail de demonstração)

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Ir em "Esqueci minha senha".
  2. Informar um e-mail válido (cadastrado ou não) e clicar em "Enviar".
  3. Reproduzido também diretamente via `POST /auth/request-otp`.
- **Resultado esperado:** E-mail de recuperação enviado e feedback de sucesso ao usuário (ou mensagem de erro tratada, caso o envio falhe).
- **Resultado observado:** Reproduzindo direto na API, `POST /auth/request-otp` retorna 500 Internal Server Error; os logs do container do backend registram a rejeição do envio do e-mail pelo provedor (conta de demonstração do Mailtrap só aceita o próprio dono como destinatário), sem nenhum tratamento dessa falha. Em reteste na tela, o site hoje mostra um aviso genérico ("Erro interno do servidor. Por favor, tente novamente mais tarde.") — ou seja, existe algum retorno visual, mas a mensagem não explica o problema real nem orienta o que fazer, e o e-mail de recuperação nunca é enviado de fato.
- **CT relacionado:** CT-REC-02, CT-API-AUTH-05
- **Evidência:** `evidencias/exploracao-manual/esqueci-senha-bug-404-sem-feedback.png`; reproduzido via `api/cypress/e2e/auth/auth.cy.js` (CT-API-AUTH-05) e logs do container `backend-api-1`.

---

## BUG-05 — Tela de extrato completo existe, mas não tem nenhum link para chegar até ela a partir da Home

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Com transações já existentes na conta, observar a seção "Últimas movimentações" na Home e procurar por uma forma de ver o histórico completo (ex.: um link "ver mais"/"ver extrato").
  2. Comparar com o acesso direto pela URL `/wallet/extract-complete`.
- **Resultado esperado:** deveria existir um link visível na Home levando à tela de extrato completo.
- **Resultado observado:** **a tela de extrato completo existe e funciona normalmente** (mostra todas as movimentações, tem filtro por período de 7/15/30/60/90 dias e um botão "Exportar"), mas só é possível chegar até ela digitando a URL diretamente — não há nenhum link, botão ou "ver mais" na Home apontando para ela. Ou seja, a funcionalidade já foi construída, mas ficou "órfã", sem nenhum caminho de navegação normal até ela. (Correção em relação ao registro original deste bug: antes eu havia concluído que a tela nem existia, testando as URLs erradas `/statement` e `/extract` — a URL correta é `/wallet/extract-complete`.)
- **CT relacionado:** CT-CART-06
- **Evidência:** `evidencias/exploracao-manual/CT-EXT-005-boleto-pago-sucesso-extrato.png`; reproduzido acessando `https://localhost:3001/wallet/extract-complete` diretamente e confirmando que a tela carrega normalmente.

---

## BUG-06 — Mensagens de validação inline ficam obsoletas (fora de sincronia com o campo)

- **Severidade:** Média
- **Passos para reproduzir:**
  1. No Login ou Cadastro, digitar um valor inválido em um campo (ex.: senha curta) até ver a mensagem de erro.
  2. Corrigir o valor até ele se tornar válido (ex.: completar 8+ caracteres), digitando via teclado (não colar).
- **Resultado esperado:** A mensagem de erro deve desaparecer assim que o valor do campo se tornar válido.
- **Resultado observado:** A mensagem de erro permanece visível mesmo com o campo já válido (e o botão de submit já habilitado); ela só desaparece quando outro campo do formulário é alterado. Reproduzido também no campo "Nome Completo" do Cadastro.
- **CT relacionado:** CT-CAD-05
- **Evidência:** `evidencias/exploracao-manual/cadastro-bug-validacao-nome-completo.png`, `cadastro-etapa2-bug-msg-rg-persistente.png`, `login-validacao-email-senha-invalidos.png`

---

## BUG-07 — Chamada de API redundante retorna 500 em toda navegação

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Logar na aplicação.
  2. Observar as requisições de rede (DevTools) em qualquer navegação de página, incluindo `/investment`.
- **Resultado esperado:** Apenas as chamadas necessárias e bem-sucedidas para exibir os dados (ex.: `GET /api/wallet/{userId}`).
- **Resultado observado:** Além da chamada correta `GET /api/wallet/{userId}`, que responde com sucesso, o app dispara em paralelo um `GET /api/wallet` sem ID de usuário, que retorna 500 Internal Server Error em toda navegação. O mesmo padrão ocorre no carregamento inicial da rota `/investment`.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** observado na aba Network do DevTools durante a exploração manual, em toda navegação autenticada

---

## BUG-08 — Rótulo "Juros" duplicado na tela de resumo do pagamento

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Completar um pagamento de boleto até a tela "Resumo do pagamento" (etapa 3).
- **Resultado esperado:** Exibição de todos os componentes do valor (valor original, juros, multa, desconto, valor total), cada um com rótulo único.
- **Resultado observado:** O rótulo "Juros" aparece duplicado — uma vez na primeira coluna de valores, outra na segunda coluna, que muito provavelmente deveria exibir "Desconto" (campo presente na etapa 2, mas ausente/substituído incorretamente na etapa 3).
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** `evidencias/exploracao-manual/pagamento-etapa3-resumo-bug-juros-duplicado.png`

---

## BUG-09 — Cards de resumo de Investimentos ficam desatualizados após concluir um aporte

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Realizar um investimento com sucesso.
  2. Sem dar F5, navegar de volta para a lista de produtos (`/investment`) pelo breadcrumb.
- **Resultado esperado:** Os cards "Total investido" / "Total de resgate" no topo da página devem refletir o valor recém-investido.
- **Resultado observado:** Os cards mostram R$ 0,00, mesmo com o investimento já visível corretamente na aba "Meus investimentos" logo abaixo. Um reload completo (F5) corrige os valores exibidos.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** `evidencias/exploracao-manual/CT-EXT-018-investment-page-reload-totais.png`

---

## BUG-10 — Mensagem de validação do código de barras não diferencia campo vazio de valor inválido

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Na tela de pagamento, deixar o campo de código de barras vazio e clicar em "Continuar".
  2. Preencher com um valor curto (ex.: 9 dígitos) e tentar novamente.
- **Resultado esperado:** Mensagens diferentes para "campo obrigatório" e para "formato/tamanho inválido".
- **Resultado observado:** Ambos os casos exibem a mesma mensagem genérica "Preencha o código de barras", mesmo quando o campo está de fato preenchido (só que com valor inválido).
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** `evidencias/exploracao-manual/pagamento-bug-msg-codigo-barras-curto.png`

---

## BUG-11 — Botão "Próximo" do Cadastro (etapa 1) às vezes exige dois cliques

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Preencher corretamente todos os campos da etapa 1 do cadastro.
  2. Clicar em "Próximo".
- **Resultado esperado:** Avançar imediatamente para a etapa 2.
- **Resultado observado:** Em algumas execuções, o primeiro clique não produz nenhum efeito visível (nem erro, nem avanço); um segundo clique avança normalmente.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** `evidencias/exploracao-manual/cadastro-apos-clicar-proximo-sem-avancar.png`

---

## BUG-12 — Botão "Carregar mais" permanece ativo mesmo sem mais resultados

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Buscar por um termo que retorne poucos resultados (ex.: "ARX", que retorna apenas 2 dos 14 fundos).
- **Resultado esperado:** O botão "Carregar mais" deveria ficar desabilitado/oculto quando não há mais páginas de resultado.
- **Resultado observado:** O botão continua visível e clicável mesmo quando todos os resultados disponíveis já foram exibidos.
- **CT relacionado:** CT-INV-08
- **Evidência:** observado durante o reteste com a massa de dados do seed (14 produtos de investimento)

---

## BUG-13 — Inconsistência de sinal entre tipos de débito nas movimentações

- **Severidade:** Baixa 
- **Passos para reproduzir:**
  1. Realizar um pagamento de boleto e um investimento.
  2. Comparar como cada um aparece na lista de "Últimas movimentações".
- **Resultado esperado:** Todas as saídas de caixa (débitos) devem ser exibidas de forma consistente (ex.: sempre com sinal negativo).
- **Resultado observado:** "Boleto pago" aparece com sinal negativo (ex.: "R$ -150,75"), enquanto "Investimento realizado" aparece sem sinal (ex.: "R$ 500,00"), apesar de ambos serem débitos da conta corrente.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** observado durante o reteste com a massa de dados do seed (14 produtos de investimento)

---

## BUG-14 — Caractere solto `;` renderizado na tela de "Esqueci minha senha"

- **Severidade:** Baixa 
- **Passos para reproduzir:**
  1. Acessar a tela "Esqueci minha senha".
- **Resultado esperado:** Nenhum caractere solto/órfão deve aparecer na tela.
- **Resultado observado:** Um caractere `;` aparece renderizado visualmente logo abaixo do campo de e-mail, fora de qualquer texto.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** `evidencias/exploracao-manual/esqueci-senha-pagina.png`

---

## BUG-15 — Tela "Esqueci minha senha" não valida formato de e-mail com feedback inline

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Digitar um e-mail em formato inválido no campo da tela "Esqueci minha senha".
- **Resultado esperado:** Mensagem inline "Insira um e-mail válido", consistente com o padrão usado em Login e Cadastro.
- **Resultado observado:** O botão "Enviar" permanece desabilitado, mas nenhuma mensagem de erro é exibida ao usuário, diferente do padrão usado nas demais telas de autenticação.
- **CT relacionado:** CT-REC-01
- **Evidência:** `evidencias/exploracao-manual/esqueci-senha-pagina.png`

---

## BUG-16 — Login degrada severamente sob carga concorrente

- **Severidade:** Alta
- **Passos para reproduzir:**
  1. Executar o cenário `perf/login/smoke.js` (k6, 5 VUs constantes por 30s) contra `POST /auth/login`.
- **Resultado esperado:** p95 do tempo de resposta abaixo de 500ms (threshold definido para os testes de performance de API).
- **Resultado observado:** p95 de 11,66s (máximo de 13,32s) com apenas 5 usuários virtuais simultâneos. O padrão de latência cresce de forma praticamente proporcional ao número de logins concorrentes, compatível com as validações sendo processadas uma de cada vez (cada login aguarda o anterior terminar).
- **CT relacionado:** cenários de performance k6 em `perf/login/` (o threshold `p95<500ms` falha de propósito, documentando este defeito)
- **Evidência:** `evidencias/performance/login-smoke-k6-output.txt`, thresholds configurados em `perf/lib/thresholds.js`.

---

## BUG-17 — Toast de sucesso do cadastro corre risco de nunca ser exibido (navegação antes do toast)

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Completar as 4 etapas do cadastro com dados válidos.
  2. Observar a tela imediatamente após o clique final em "Entrar".
- **Resultado esperado:** O toast "Usuário cadastrado com sucesso!" deve ser exibido de forma confiável antes ou durante a navegação de volta para o login.
- **Resultado observado:** o toast pode não ter tempo de aparecer, ou aparecer de forma tão breve que passa despercebido: a navegação de volta para o login acontece imediatamente após o clique, antes de qualquer confirmação visual se firmar na tela.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
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
- **Por que é tratado como defeito e não só como sugestão:** WCAG é uma norma de acessibilidade usada como critério de aceite deste projeto (ver plano de testes); violações classificadas como `critical`/`serious` significam, na prática, que uma pessoa que dependa de leitor de tela ou tenha baixa visão pode não conseguir usar a tela (ex.: um botão sem nenhum texto para o leitor de tela anunciar, ou texto com contraste baixo demais para ler). Isso é uma regra de qualidade definida previamente e descumprida, não uma preferência de design.
- **CT relacionado:** CT-A11Y-01 a CT-A11Y-10 (suíte cypress-axe, em skip aguardando esta correção)
- **Evidência:** `gui/wcag-checklist.json`, log de execução da suíte (`gui/cypress/e2e/acessibilidade/acessibilidade.cy.js`).

---

## BUG-19 — Formulário de aporte de investimento não aplica nenhum limite superior de valor

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Na tela de resgate/aporte de um investimento, informar um valor alto (ex.: R$ 1.500,00).
- **Resultado esperado:** o formulário deveria validar o valor contra algum limite superior (ou ao menos contra o saldo disponível) antes de habilitar a confirmação.
- **Resultado observado:** o botão permanece habilitado com qualquer valor (testado com R$ 1.500,00); nenhuma validação de limite superior ou de saldo acontece no formulário, e a rejeição só ocorre no backend, depois de o usuário já ter confirmado a operação e digitado o PIN.
- **CT relacionado:** CT-INV-14
- **Evidência:** confirmado informando R$ 1.500,00 na tela de aporte e observando o botão permanecer habilitado (sem print dedicado; sem diferença visual da tela padrão).

---

## BUG-20 — Botão final do cadastro pode disparar reload nativo do formulário, abortando a requisição de cadastro

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Completar as 4 etapas do cadastro com dados válidos, em uma máquina/rede lenta (ou em CI).
  2. Clicar no botão final (`id="enter-btn"`).
- **Resultado esperado:** O cadastro deve ser concluído de forma confiável, independentemente da velocidade de rede/máquina.
- **Resultado observado:** ao clicar no botão final, a página recarrega (submissão nativa do formulário) e a requisição `POST /user` aparece cancelada na aba Network — o cadastro não conclui e nenhuma mensagem de erro é exibida. Causa confirmada no código: em `frontend/src/components/auth/register/FormRegisterStepFour.tsx`, o `<form>` não tem `onSubmit` e o botão final é `type="submit"` com `onClick={handleSubmit}`, sendo que `handleSubmit` não chama `event.preventDefault()`.
- **CT relacionado:** CT-CAD-01, CT-CART-03, CT-CART-05 (em skip aguardando esta correção)
- **Evidência:** reproduzido ao rodar a suíte de UI real (o cadastro pela interface fica em `/auth/register` em vez de redirecionar); código-fonte `frontend/src/components/auth/register/FormRegisterStepFour.tsx`.

---

## BUG-21 — Mensagem de sucesso do pagamento de boleto às vezes não é exibida ao usuário

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Confirmar um pagamento de boleto com sucesso.
  2. Observar a tela imediatamente após a confirmação.
- **Resultado esperado:** Uma mensagem de sucesso explícita e visível (toast/banner) confirmando o pagamento, sempre que o pagamento for concluído.
- **Resultado observado:** na maior parte das vezes, nenhum toast, banner ou mensagem aparece, e o usuário só percebe o sucesso indiretamente, pela navegação de volta à tela de pagamentos. Em um reteste (25/07), a mensagem "Pagamento realizado com sucesso" apareceu normalmente uma vez. Ou seja, o comportamento parece intermitente, não uma ausência permanente da mensagem.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** observação da tela após múltiplos pagamentos concluídos com sucesso; a mensagem apareceu em pelo menos 1 dessas execuções e não apareceu nas demais.

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
- **CT relacionado:** CT-API-CTA-01, CT-API-CTA-02, CT-API-CTA-03, CT-API-CTA-04, CT-API-CTA-05, CT-API-CTA-06, CT-API-CTA-07, CT-API-CTA-08
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
- **CT relacionado:** CT-API-NOT-03, CT-API-NOT-06
- **Evidência:** `evidencias/api/notification-sem-autenticacao-e-idor.txt` (transcrição completa das chamadas); `api/cypress/e2e/notification/notification.cy.js` (CT-API-NOT-03 e CT-API-NOT-06).

---

## BUG-24 — `validate-otp` quebra com 500 não tratado quando o usuário nunca solicitou um OTP

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Com um usuário que nunca chamou `POST /auth/request-otp`, chamar diretamente `POST /auth/validate-otp` com qualquer token.
- **Resultado esperado:** um erro tratado (401 "Token inválido" ou 400), igual ao caso de um token incorreto para um usuário que já solicitou OTP.
- **Resultado observado:** a chamada retorna 500 Internal Server Error.
- **CT relacionado:** CT-API-AUTH-08
- **Evidência:** `evidencias/api/validate-otp-500-sem-solicitacao-previa.txt`; `api/cypress/e2e/auth/auth.cy.js` (CT-API-AUTH-08 — renumerado de CT-API-AUTH-07b na padronização da Fase 2).

---

## BUG-25 — `PATCH /user/:id/first-access` alterna o valor em vez de só marcar como concluído

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Cadastrar um novo usuário (`firstAccess` nasce `true`) e autenticar.
  2. Chamar `PATCH /user/:id/first-access` uma vez e conferir `firstAccess` via `GET /user` (vira `false`).
  3. Chamar `PATCH /user/:id/first-access` uma segunda vez e conferir `firstAccess` novamente.
- **Resultado esperado:** conforme a documentação do próprio endpoint no Swagger ("Marca o primeiro acesso do usuário como concluído"), o valor deveria ser fixado em `false` e permanecer assim em chamadas subsequentes.
- **Resultado observado:** a segunda chamada volta `firstAccess` para `true`.
- **CT relacionado:** CT-API-USER-08
- **Evidência:** `api/cypress/e2e/user/user.cy.js` (CT-API-USER-07 e CT-API-USER-08).

---

## BUG-26 — Cadastro rejeita RG de 11 a 14 caracteres, contrariando a documentação do Swagger

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Chamar `POST /user` com um `rg` alfanumérico de 11 a 14 caracteres (ex.: `12345678901`).
- **Resultado esperado:** conforme a documentação do Swagger do endpoint ("RG (7 a 14 dígitos alfanuméricos)"), um RG de 11 a 14 caracteres deveria ser aceito.
- **Resultado observado:** a chamada retorna 422. Testando os limites, só RGs de 7 a 10 caracteres alfanuméricos são aceitos; de 11 a 14, todos são rejeitados, contrariando a documentação. Pela aplicação esse cenário não ocorre, porque o campo de RG do frontend limita a digitação a 10 caracteres; o comportamento aparece para consumidores diretos da API (integrações, ou quem confia no Swagger).
- **CT relacionado:** CT-API-USER-17
- **Evidência:** `api/cypress/e2e/user/user.cy.js` (testes de limite de campo do RG: `CT-API-USER-15` a `18` em `specs-api/user-spec.md`; hoje só há teste automatizado para 7, 10 e 11 caracteres — não há caso cobrindo 12, 13 ou 14, ver Fase 3 do plano de correção).

---

## BUG-27 — Validação do campo Nome do Cadastro diverge entre as etapas (números/símbolos passam na etapa 1 e só falham no envio final)

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Na etapa 1 do Cadastro, informar um nome com números (ex.: `Ana2 Souza3`).
  2. Observar que nenhum erro inline aparece e o botão "Próximo" fica habilitado.
  3. Completar as etapas 2 a 4 normalmente e clicar em concluir o cadastro.
- **Resultado esperado:** se o backend exige que o nome contenha apenas letras e espaços, o frontend deveria bloquear o mesmo padrão já na etapa 1, evitando que o usuário percorra o formulário inteiro só para descobrir o erro no final.
- **Resultado observado:** a etapa 1 aceita números e símbolos no nome sem nenhum erro inline, com o botão "Próximo" habilitado. O backend rejeita o mesmo nome com 422 (só aceita letras, acentos e espaços). Um nome como `Ana2 Souza3` é aceito em todas as 4 etapas do wizard e só falha no `POST /user` do envio, obrigando o usuário a voltar ao início para corrigir.
- **CT relacionado:** CT-CAD-14
- **Evidência:** `gui/cypress/e2e/cadastro/cadastro.cy.js` (teste de regressão do nome com números); `api/cypress/e2e/user/user.cy.js` (teste de contrato do mesmo campo no backend).

---

## BUG-28 — Trocar a senha pela tela "Esqueci minha senha" não troca a senha da própria conta

- **Severidade:** Crítica
- **Passos para reproduzir:**
  1. Ir em "Esqueci minha senha" e pedir um código para o e-mail cadastrado.
  2. Confirmar o código na tela seguinte.
  3. Definir uma nova senha.
  4. Tentar fazer login com a senha antiga e, depois, com a senha nova.
- **Resultado esperado:** a senha antiga deveria parar de funcionar, e só a senha nova deveria dar acesso à conta de quem pediu a troca.
- **Resultado observado:** o site sempre mostra a mensagem de sucesso ("Senha alterada"), mas a senha antiga continua funcionando normalmente depois. A troca acaba caindo em uma conta de usuário completamente diferente e aleatória (uma conta antiga qualquer do banco de dados), não na conta de quem pediu a troca. Ou seja, hoje é impossível recuperar a própria senha por esse caminho, e existe o risco real de alterar sem querer a senha de outra pessoa.
- **CT relacionado:** CT-REC-05, CT-API-AUTH-06, CT-API-AUTH-17
- **Evidência:** reproduzido manualmente do início ao fim (pedido de código, confirmação do código, troca de senha, e depois tentativa de login com a senha antiga e com a nova, confirmando que a antiga continuou válida).

---

## BUG-29 — É possível mexer no dinheiro de outras contas ao investir, resgatar ou pagar boletos (quebra de controle de acesso / IDOR)

- **Severidade:** Crítica
- **Passos para reproduzir:**
  1. Fazer login normalmente na própria conta.
  2. Ao investir, resgatar um investimento ou pagar um boleto, informar (por fora da tela normal, direto na requisição) o identificador de uma conta que não é a sua.
  3. Também é possível consultar quanto uma conta tem investido acessando as telas de resumo de investimentos com o identificador de qualquer conta, mesmo sem estar logado.
- **Resultado esperado:** o site deveria impedir qualquer operação numa conta que não seja a de quem está logado, e não deveria mostrar dados de investimento de ninguém sem login.
- **Resultado observado:** o site aceita a operação normalmente usando a senha de transação de quem está logado, mas o dinheiro é debitado (ou creditado) na conta informada — mesmo sendo de outra pessoa — sem nenhuma checagem de que essa conta realmente pertence a quem está logado. Além disso, duas telas de consulta de investimentos respondem com dados reais (total investido, disponível para resgate) para qualquer conta informada, mesmo sem nenhum login. Isso é mais grave que o BUG-22, pois envolve movimentação real de saldo, não só cadastro.
- **CT relacionado:** CT-API-INV-16, CT-API-INV-17, CT-API-INV-18, CT-API-PAG-14
- **Evidência:** consultei os valores de investimento de uma conta sem estar logado e o site respondeu normalmente com os dados reais dela; a leitura do funcionamento interno de pagamento de boleto e de investimento confirma que a conta informada nunca é comparada com a conta de quem está logado antes de mexer no dinheiro.

---

## BUG-30 — RG não é validado como único, diferente de e-mail e CPF

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Cadastrar um usuário com um RG qualquer.
  2. Cadastrar um segundo usuário, com e-mail e CPF diferentes, mas repetindo o mesmo RG do primeiro.
- **Resultado esperado:** assim como e-mail e CPF (que já são corretamente validados como únicos), o RG deveria ser único — o segundo cadastro deveria ser recusado.
- **Resultado observado:** os dois cadastros são aceitos normalmente com o mesmo RG, sem nenhum aviso.
- **CT relacionado:** CT-CAD-28, CT-API-USER-28
- **Evidência:** reproduzido diretamente pelo cadastro de dois usuários com o mesmo RG.

---

## BUG-31 — Nome muito comprido e sem espaço quebra o layout da tela

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Cadastrar um usuário cujo primeiro nome seja comprido e sem espaço (ex.: mais de 100 letras seguidas, dentro do limite de 150 caracteres permitido pelo cadastro).
  2. Fazer login e observar a saudação "Olá, [nome]" na tela da Carteira, e também o cartão do menu do perfil (canto superior direito).
- **Resultado esperado:** o nome deveria aparecer de forma legível, sem estourar os limites da tela.
- **Resultado observado:** o nome extrapola a largura da tela tanto na saudação da Carteira quanto no cartão do menu de perfil, criando uma barra de rolagem horizontal e cortando o texto. Isso só acontece quando o nome não tem espaço para quebrar a linha; nomes normais (com espaço entre as palavras), mesmo compridos, não têm esse problema. Vale notar que o círculo com as iniciais do usuário (ao lado do nome) não quebra em nenhum dos casos testados, só o texto do nome.
- **CT relacionado:** CT-CAD-27
- **Evidência:** `evidencias/exploracao-manual/cadastro-bug31-nome-150-chars-etapa1.png`, `evidencias/exploracao-manual/cadastro-bug31-nome-longo-etapa2-quebra-layout.png`, `evidencias/exploracao-manual/perfil-bug31-nome-curto.png`, `evidencias/exploracao-manual/perfil-bug31-nome-longo-quebra-layout.png`

---

## BUG-32 — Botão "Sair" duplicado no menu do perfil

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Abrir o menu do perfil (avatar no canto superior direito da tela).
  2. Observar a linha "Sair", que tem o texto "Sair" de um lado e um ícone de porta de saída do outro lado, na mesma linha.
  3. Clicar só no ícone da porta, sem tocar no texto "Sair".
- **Resultado esperado:** deveria existir um único botão "Sair" (podendo ter texto e ícone juntos, funcionando como um botão só).
- **Resultado observado:** são dois botões separados e independentes ocupando a mesma linha, e ambos fazem exatamente a mesma coisa (deslogar). Clicar só no ícone, sem tocar no texto, também desloga sozinho. Além disso, o botão que só tem o ícone não tem nenhum texto associado a ele, o que atrapalha quem usa leitor de tela.
- **CT relacionado:** CT-PERF-03
- **Evidência:** reproduzido manualmente clicando isoladamente no ícone da porta, sem interagir com o botão de texto "Sair".

---

## BUG-33 — Resgatar mais dinheiro do que o disponível é aceito quando o fundo tem mais de um aporte — cria dinheiro do nada

- **Severidade:** Crítica
- **Passos para reproduzir:**
  1. Investir duas ou mais vezes no MESMO fundo, em aportes separados (ex.: R$5,00 e depois mais R$5,00 no mesmo fundo).
  2. Ir em "Meus investimentos" e pedir um resgate desse fundo MAIOR do que o total realmente disponível.
  3. Confirmar com o PIN.
  4. Conferir o saldo da conta corrente antes e depois do resgate.
- **Resultado esperado:** o sistema deveria recusar o resgate com uma mensagem de saldo insuficiente, do mesmo jeito que acontece quando existe apenas 1 aporte no fundo.
- **Resultado observado:** quando o fundo tem 2 ou mais aportes separados, a checagem de saldo disponível para resgate deixa de funcionar, e o sistema aceita resgatar qualquer valor pedido — creditando o valor CHEIO na conta corrente, mesmo sendo maior que o total investido naquele fundo. Comprovado na prática: investi 3 vezes no mesmo fundo (total real disponível: R$15,01) e consegui resgatar R$20,00, recebendo os R$20,00 completos na conta corrente — ou seja, R$4,99 "aparecendo do nada". No mesmo teste, um fundo com só 1 aporte (R$100,00) recusou corretamente um pedido de resgate de R$99.999,99. A diferença entre os dois casos é justamente ter mais de um aporte separado no mesmo fundo — é esse cenário específico que quebra a validação.
- **CT relacionado:** CT-INV-11, CT-API-INV-15
- **Evidência:** reproduzido e confirmado consultando diretamente o extrato de transações e o saldo da conta corrente antes e depois de cada resgate.

---

## BUG-34 — O modal de confirmação por PIN não bloqueia cliques na tela por trás dele

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Iniciar um investimento ou resgate até abrir o modal "Senha".
  2. Sem cancelar o modal, clicar em algum link/botão da tela que continua visível atrás dele (ex.: o caminho "Investimentos" no topo da página).
- **Resultado esperado:** enquanto o modal de confirmação estiver aberto, cliques na tela por trás não deveriam ter efeito — o modal deveria "prender" a interação até ser fechado ou confirmado.
- **Resultado observado:** o clique atravessa o modal normalmente e navega a página por trás, sem fechar o modal de forma explícita nem avisar que uma confirmação estava em andamento. Isso pode confundir o usuário no meio de uma operação financeira sensível.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** reproduzido manualmente, clicando em um link da página visível atrás do modal aberto, com o PIN parcialmente preenchido.

---

## BUG-35 — Clicar em "Investir" num fundo que já tem aporte abre direto na aba de resgate

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Investir em um fundo qualquer.
  2. Na lista de fundos, clicar em "Investir" nesse MESMO fundo de novo.
- **Resultado esperado:** deveria abrir a tela de aporte (aba "Fundo de investimento"), já que o clique foi no botão "Investir".
- **Resultado observado:** a tela abre por padrão na aba "Resgatar meu fundo", obrigando o usuário a clicar manualmente na aba "Fundo de investimento" para conseguir investir de novo.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** reproduzido manualmente investindo duas vezes seguidas no mesmo fundo.

---

## BUG-36 — Pagamento de boleto recusado por saldo insuficiente falha em silêncio, sem nenhuma mensagem

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Iniciar o pagamento de um boleto cujo valor seja maior que o saldo disponível na conta (cenário de teste "saldo insuficiente" chega normalmente até a tela de resumo, pois o boleto em si é válido).
  2. Confirmar o pagamento com o PIN na última etapa.
- **Resultado esperado:** uma mensagem clara informando que o saldo é insuficiente para concluir o pagamento.
- **Resultado observado:** o pagamento é recusado (a movimentação não é feita), mas a tela simplesmente volta para a etapa 1, em branco, sem nenhuma mensagem de erro, toast ou aviso — o usuário não tem nenhuma pista do que aconteceu ou do motivo da recusa.
- **CT relacionado:** CT-PAG-04
- **Evidência:** reproduzido manualmente com o boleto de teste de "saldo insuficiente"; conferido que nenhum texto de erro aparece em nenhum lugar da tela após a tentativa.

---

## BUG-37 — Voltar da etapa 2 para a etapa 1 do pagamento apaga o código de barras já digitado

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Digitar um código de barras válido na etapa 1 e avançar para a etapa 2.
  2. Clicar em "Voltar" (ou usar o botão de voltar do navegador) para retornar à etapa 1.
- **Resultado esperado:** o código de barras já digitado deveria continuar preenchido, para o caso de o usuário só querer conferir algo e voltar a avançar (mesmo padrão já usado no Cadastro, onde os dados ficam preenchidos ao voltar entre etapas).
- **Resultado observado:** o campo de código de barras volta vazio, obrigando o usuário a digitar os 47 dígitos de novo caso queira prosseguir.
- **CT relacionado:** CT-PAG-10
- **Evidência:** reproduzido manualmente voltando da etapa "Dados do boleto" para "Código de barras".

---

## BUG-38 — Botão "Exportar" do extrato completo não faz nada

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Acessar a tela de extrato completo (`/wallet/extract-complete`).
  2. Clicar no botão "Exportar".
- **Resultado esperado:** algum arquivo (PDF/CSV/Excel) deveria ser baixado, ou ao menos alguma mensagem deveria aparecer.
- **Resultado observado:** nada visível acontece — nenhum arquivo é baixado, nenhuma mensagem aparece, e não é disparada nenhuma chamada de rede. O botão parece não estar ligado a nenhuma ação ainda.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** reproduzido manualmente clicando no botão "Exportar" e conferindo que nenhuma requisição de rede foi disparada.

---

## BUG-39 — Onboarding promete "editar foto de perfil", mas essa opção não existe em lugar nenhum

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Fazer login com uma conta nova (que ainda não completou o tour de onboarding).
  2. Ler o texto da segunda etapa do tour, que diz: "É possível também editar sua foto de perfil e sair da conta".
  3. Procurar por essa opção no menu do perfil (avatar no canto superior direito) e em qualquer outro lugar do site.
- **Resultado esperado:** deveria existir algum botão, ícone ou campo para trocar a foto de perfil, já que o próprio app diz que isso é possível.
- **Resultado observado:** não existe nenhum campo de upload de imagem, nenhum ícone de câmera/editar e nenhuma ação relacionada a foto em lugar nenhum do site — nem no menu do perfil, nem em qualquer tela. Também não existe uma página dedicada de "Perfil" (a URL `/profile` retorna 404); a única forma de ver os dados da conta é pelo menu suspenso do avatar. O app promete uma funcionalidade que não existe.
- **CT relacionado:** não automatizado (defeito cosmético/exploratório, verificado manualmente)
- **Evidência:** reproduzido manualmente lendo o texto do onboarding e conferindo, via inspeção da tela, que não há nenhum elemento de edição de foto; `/profile` testado diretamente e retorna 404.

---

## BUG-40 — POST /transaction/encrypt_password quebra com 500 não tratado para entradas ausentes ou inválidas

- **Severidade:** Baixa
- **Passos para reproduzir:**
  1. Chamar `POST /transaction/encrypt_password` sem informar `publicKey`.
  2. Chamar o mesmo endpoint sem informar `password`.
  3. Chamar o mesmo endpoint informando um `publicKey` que não está em formato PEM válido.
- **Resultado esperado:** o endpoint deveria validar os campos de entrada e retornar um erro tratado (ex.: 422) quando `publicKey` ou `password` estiverem ausentes ou em formato inválido.
- **Resultado observado:** nos três casos, o endpoint chama `crypto.publicEncrypt` diretamente sem nenhuma validação prévia (não há DTO nem decorators de validação no controller), e a exceção não tratada resulta em `500 Internal Server Error`.
- **CT relacionado:** CT-API-TRA-09, CT-API-TRA-10, CT-API-TRA-11
- **Evidência:** `api/cypress/e2e/transaction/transaction.cy.js` (CT-API-TRA-09, CT-API-TRA-10, CT-API-TRA-11); código-fonte `backend/src/transaction/transaction.controller.ts`, método `encryptTransactionsPassword`.

---

## BUG-41 — Modal de senha transacional pode fechar sozinho no meio da digitação do PIN, ao investir ou resgatar

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Abrir o formulário de "Investir" (ou "Resgatar") de um fundo e clicar no botão que abre o modal de senha.
  2. Começar a digitar os 6 dígitos do PIN clicando nos pares numéricos.
  3. Qualquer evento que force o componente `RefundSection` a re-renderizar enquanto o modal está aberto (confirmado de forma reproduzível pela suíte automatizada, que dispara isso naturalmente durante os cliques) faz o modal fechar sozinho antes do usuário terminar de digitar o PIN.
- **Resultado esperado:** o modal de senha só deveria fechar quando o usuário clicar em "Cancelar", concluir a operação com sucesso, ou errar a senha — nunca sozinho, no meio da digitação.
- **Resultado observado:** em `components/PasswordDialog.tsx`, existe um `useEffect` com dependências `[paymentResult.message, onConfirmInvestment]` que fecha o modal (`setIsOpen(false)`) sempre que `paymentResult.message` for diferente de `"Senha inválida"` e de `""` — mas o estado inicial de `paymentResult.message` é `undefined` (não `""`), o que já satisfaz essa condição desde o primeiro render. Além disso, `onConfirmInvestment` é passado por `RefundSection.tsx` como uma função definida inline (`handleInvestment`/`handleBuyInvestment`), recriada a cada renderização do componente pai — e como esse é uma das dependências do efeito, qualquer re-render do pai (por qualquer motivo, não necessariamente ligado ao modal) reexecuta o efeito e fecha o modal. A automação de `investimentos.cy.js` reproduz isso de forma consistente: o elemento `#number-buttons` desaparece no meio da sequência de cliques do PIN. O mesmo modal usado no fluxo de pagamento de boleto (`onConfirmPayment`) não é afetado, pois essa prop não está entre as dependências do efeito.
- **CT relacionado:** CT-INV-04, CT-INV-05, CT-INV-06, CT-INV-09
- **Evidência:** `gui/cypress/e2e/investimentos/investimentos.cy.js` (CT-INV-04, CT-INV-05, CT-INV-06, CT-INV-09 — falham de forma reproduzível ao rodar a suíte real contra a aplicação); código-fonte `frontend/src/components/PasswordDialog.tsx` (efeito nas linhas ~182-187) e `frontend/src/components/investment/RefundSection.tsx` (handlers inline `handleInvestment`/`handleBuyInvestment`, linhas 56 e 127).

---

## BUG-42 — Token de recuperação de senha pode ser reutilizado para trocar a senha mais de uma vez

- **Severidade:** Média
- **Passos para reproduzir:**
  1. Solicitar a recuperação de senha (`POST /auth/request-otp`) e validar o OTP (`POST /auth/validate-otp`) para obter um `recoverPasswordToken`.
  2. Chamar `PATCH /auth/change-password` com esse token (primeira troca).
  3. Chamar `PATCH /auth/change-password` de novo com o **mesmo** token (segunda troca).
- **Resultado esperado:** o `recoverPasswordToken` deveria ser de uso único — após a primeira troca bem-sucedida (200), a segunda chamada com o mesmo token deveria ser rejeitada (401 "Token inválido"), pois um token de recuperação não deve permanecer válido depois de já ter sido consumido.
- **Resultado observado:** ambas as chamadas retornam 200 — o mesmo token de recuperação continua válido e pode ser reutilizado para trocar a senha repetidamente dentro da janela de validade.
- **CT relacionado:** CT-API-AUTH-11
- **Evidência:** `api/cypress/e2e/auth/auth.cy.js` (CT-API-AUTH-11).

---

## Resumo por severidade

| Severidade | Quantidade | IDs |
|---|---|---|
| Crítica | 3 | BUG-28, BUG-29, BUG-33 |
| Alta | 5 | BUG-02, BUG-03, BUG-04, BUG-16, BUG-23 |
| Média | 15 | BUG-05, BUG-06, BUG-07, BUG-08, BUG-09, BUG-17, BUG-18, BUG-20, BUG-21, BUG-22, BUG-27, BUG-34, BUG-36, BUG-41, BUG-42 |
| Baixa | 18 | BUG-10, BUG-11, BUG-12, BUG-13, BUG-14, BUG-15, BUG-19, BUG-24, BUG-25, BUG-26, BUG-30, BUG-31, BUG-32, BUG-35, BUG-37, BUG-38, BUG-39, BUG-40 |
| **Total** | **41** | |

**Nota sobre o BUG-01 original:** o comportamento do teclado numérico do PIN (pares de dígitos sem instrução visível) foi reclassificado de defeito para sugestão de melhoria, pois não descumpre nenhuma regra de negócio nem trava o uso do app — é uma questão de experiência de uso.
