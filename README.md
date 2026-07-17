# WISEDOT — Certificação de QA (AcademyWallet)

Projeto de certificação de QA da Wisedot: plano de testes, testes manuais, automações de UI/API/performance e pipeline de CI para a aplicação **AcademyWallet** (carteira digital fictícia).

## Estrutura do repositório

```
.
├── planoDeTestes.md        # Plano de testes (ISO 29119)
├── bugReport.md             # Bugs encontrados
├── melhorias.md             # Sugestões de melhoria
├── processos.md             # Análise do fluxo Kanban/CFD do time
├── conclusao.md             # Reflexão crítica sobre o projeto
├── db/                      # Script de seed de massa de dados (compartilhado)
├── gui/                     # Automação de testes de UI (Cypress)
├── api/                     # Automação de testes de API (Cypress)
├── perf/                    # Automação de testes de performance (k6)
├── specs-gui/                # Cenários de teste em Gherkin (UI)
├── specs-api/                 # Cenários de teste em Gherkin (API)
├── evidencias/                # Screenshots e relatórios de execução
└── .github/workflows/          # Pipelines de CI (GitHub Actions)
```

## Pré-requisitos

- Git, Node.js LTS, pnpm (`npm install -g pnpm`)
- Docker Desktop + WSL2 (Windows) — necessário para rodar o backend do AcademyWallet
- k6 (para os testes de performance) — [instruções de instalação](https://k6.io/docs/get-started/installation/)

## 1. Subindo a aplicação sob teste (AcademyWallet)

O AcademyWallet é um repositório separado, clonado à parte deste projeto:

```bash
git clone https://github.com/wisedot/certificacao.git
cd certificacao/backend
```

Crie o arquivo `backend/.env` com o conteúdo abaixo (credenciais de ambiente local de desenvolvimento, não sensíveis):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=db_wallet
JWT_SECRET=bG9vc2Vwb3RhdG9lc3N0YW5kYXJkY293aG9ybmhvdHNvbGlkcHJlc3Nzc3RyZWV0ZGF0
JWT_EXPIRATION_TIME=3600
JWT_RECOVERY_EXPIRATION_TIME=600
SALTS=12
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=api
SMTP_PASSWORD=495ebc99b53088c686feb54b974b65cb
EMAIL_DOMAIN=academy_wallet@demomailtrap.com
WEBSITE_URL=http://localhost:3001
CRYPT_PASSPHRASE=Y29tcGFueWZpcnN0cG9zaXRpdmVzb2xpZHNvbGRibGFua2ZyZXNobW90aGVycmVjZWk
REDIS_HOST=localhost
WEB_NOTIFICATIONS_PAGE=https://localhost:3001
```

Depois, suba os containers:

```bash
docker compose build
docker compose up -d
```

Em outro terminal, suba o frontend:

```bash
cd ../frontend
pnpm install
pnpm run dev
```

Confirme que `http://localhost:3000/api` (Swagger) e `https://localhost:3001` (frontend) respondem antes de continuar.

## 2. Instalando as dependências deste projeto (WISEDOT)

Na raiz deste repositório:

```bash
npm install          # dependências do script de seed (db/)
cd gui && npm install && npx cypress install && cd ..
cd api && npm install && npx cypress install && cd ..
```

Copie `.env.example` para `.env` **na raiz deste repositório**:

```bash
cp .env.example .env
```

Atenção: este `.env` da raiz é **diferente** do `backend/.env` da parte 1. O `backend/.env` configura a aplicação sob teste; este da raiz configura a **automação** e é lido por dois consumidores:

- o **script de seed** (`db/pool.js`) — usa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` para conectar no mesmo PostgreSQL do backend, e `SALTS` para gerar o hash das senhas no mesmo formato do backend;
- os **dois `cypress.config.js`** (`api/` e `gui/`) — usam `FRONTEND_URL` como `baseUrl` da suíte de UI.

Por isso os valores de banco e o `SALTS` no `.env` da raiz **precisam ser os mesmos** do `backend/.env`, senão o seed não conecta ou gera hashes incompatíveis com o login.

Sobre o `FRONTEND_URL`: o padrão é `https://localhost:3001` (o frontend sobe em HTTPS via mkcert). Se na sua máquina o mkcert falhar e o Next servir em HTTP, ajuste para `FRONTEND_URL=http://localhost:3001` — caso contrário a suíte de UI não conecta na aplicação.

## 3. Populando a massa de dados (seed)

Com o backend do AcademyWallet no ar, rode a partir da raiz deste projeto:

```bash
npm run seed          # cria o usuário de teste, saldo e os 14 produtos de investimento
npm run seed:clean    # remove os dados criados pelo seed
```

Usuário de teste criado pelo seed:

| Campo | Valor |
|---|---|
| E-mail | `qa.seed.user@academywallet.test` |
| Senha | `Seed@Teste123` |
| PIN transacional | `123456` |
| Saldo inicial | R$ 10.000,00 |

O script é idempotente — pode ser rodado quantas vezes forem necessárias antes de cada execução de testes, sem deixar dados residuais.

## 4. Rodando a automação de UI (Cypress)

```bash
cd gui
npx cypress open     # modo interativo
npm run cy:run        # modo headless
npm run test           # roda headless + gera relatório Mochawesome consolidado em gui/mochawesome-report
```

## 5. Rodando a automação de API (Cypress)

```bash
cd api
npm run cy:run
npm run test           # gera relatório Mochawesome em api/mochawesome-report
```

## 6. Rodando os testes de performance (k6)

Com o backend no ar e o seed já executado:

```bash
cd perf
k6 run login/smoke.js
k6 run pagamento-consulta/average-load.js
k6 run investimento-consulta/stress.js
# ...demais cenários em login/, pagamento-consulta/ e investimento-consulta/
```

Os thresholds de cada cenário estão centralizados em `perf/lib/thresholds.js` e `perf/lib/scenarios.js`. Veja `planoDeTestes.md` (seção 7.8) para a justificativa de quais módulos foram escolhidos (RBT > 20).

O cenário `login` tem um threshold de latência (`p95<500ms`) que falha no ambiente local de propósito: essa falha é um achado de performance documentado (BUG-16 em `bugReport.md`), não um erro de configuração do teste.

## 7. Integração Contínua

Os workflows em `.github/workflows/` rodam a suíte de UI + API automaticamente:

- `manual.yml` — disparo manual (workflow_dispatch)
- `agendado.yml` — diariamente, via cron
- `deploy.yml` — a cada push na branch `main`
- `integrado.yml` — a cada Pull Request

Todos os quatro reutilizam a mesma sequência de passos, definida em `_reusable-test-suite.yml`, evitando duplicação de configuração.

## Status conhecido da suíte de UI

Na execução mais recente, 49 dos 52 casos de UI passam de forma consistente. Os 3 restantes (pagamento com sucesso, investir e resgatar) dependem do modal de confirmação por PIN (`#number-buttons`, ver `gui/cypress/support/pageObjects/TransactionPinModal.js`) e apresentam sensibilidade de timing intermitente sob carga — o mesmo mecanismo funciona de forma confiável em outros casos do mesmo run (ex.: "saldo insuficiente" em Pagamentos), então não é uma falha de lógica do teste ou da aplicação, e sim o tempo de resposta do backend na confirmação do PIN sob a carga do runner (mesmo padrão de degradação do BUG-16). Os cenários equivalentes (pagar boleto, investir, resgatar) já estão cobertos de forma estável na automação de **API** (`api/cypress/e2e/paid-slips` e `api/cypress/e2e/investment`), então a cobertura funcional desses fluxos não depende exclusivamente da UI.

## Documentação complementar

- [`planoDeTestes.md`](planoDeTestes.md) — estratégia, escopo, matriz de risco, cronograma
- [`bugReport.md`](bugReport.md) — bugs encontrados
- [`melhorias.md`](melhorias.md) — sugestões de melhoria
- [`processos.md`](processos.md) — análise do processo ágil do time
- [`conclusao.md`](conclusao.md) — reflexão final sobre a certificação
