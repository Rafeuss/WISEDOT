# Plano de Testes — AcademyWallet

**Projeto:** Certificação Wisedot — QA Líder
**Aplicação sob teste:** AcademyWallet (carteira digital fictícia)
**Referência de boas práticas:** ISO/IEC/IEEE 29119, ISO/IEC 25010 

---

## 7.1 Introdução

O objetivo deste plano é orientar a execução de testes manuais e automatizados de forma estruturada, rastreável e baseada em risco, permitindo identificar defeitos, validar regras de negócio e fornecer evidências objetivas da qualidade da aplicação antes e depois de qualquer evolução do produto.

## 7.2 Escopo

**Dentro do escopo:**
- Autenticação: login, logout, cadastro de usuário, recuperação de senha
- Onboarding 
- Carteira / Home: consulta de saldo, últimas movimentações
- Investimentos: listagem/busca/filtro de produtos, aporte, resgate, "meus investimentos"
- Pagamentos: pagamento de boleto 
- Notificações
- Perfil da conta 
- API REST do backend 
- Performance dos fluxos de maior risco

**Fora do escopo:**
- Testes de carga acima dos cenários definidos na seção 7.8 (RBT) e em `perf/lib/scenarios.js`
- Testes de penetração/segurança ofensiva formal
- Infraestrutura de produção 

## 7.3 Objetivos da qualidade

Com base na ISO/IEC 25010, três características de qualidade foram priorizadas para este projeto, por serem as mais críticas para uma aplicação financeira:

1. **Funcionalidade (Functional Suitability)** — as regras de negócio (validações de cadastro, cálculo de saldo, regras de investimento, cenários de pagamento de boleto) devem se comportar exatamente como especificado, já que erros funcionais numa carteira digital têm impacto financeiro direto.
2. **Confiabilidade (Reliability)** — os fluxos críticos (login, pagamento, investimento) devem se comportar de forma consistente e previsível, sem falhas silenciosas — comportamento observado como violado no bug do endpoint de recuperação de senha (404 sem tratamento) e no bug de saldo (chamada duplicada retornando 500).
3. **Segurança (Security)** — como aplicação financeira, a integridade da sessão e dos dados do usuário é essencial — comportamento observado como violado no bug de logout que não invalida o token JWT.

## 7.4 Premissas e dependências

- Ambiente local disponível e estável: Docker Desktop + WSL2, containers do backend (NestJS), PostgreSQL e Redis em execução.
- Frontend (Next.js) rodando via `pnpm run dev` em `https://localhost:3001`
- Backend (Swagger/OpenAPI) disponível em `http://localhost:3000/api`.
- Massa de dados controlada, criada e removida via script de seed próprio
- Protótipo Figma como referência de design, prevalecendo em caso de divergência com o código, conforme instrução da certificação
- Ferramentas de automação (Cypress, k6, GitHub Actions) instaladas e configuráveis no ambiente CI.

## 7.5 Visão do projeto

O **AcademyWallet** é uma aplicação web que simula uma carteira digital, com os seguintes módulos principais:

- **Autenticação:** cadastro em 4 etapas: dados pessoais, documentos, PIN transacional, revisão, login, recuperação de senha.
- **Carteira (Home):** exibição de saldo em conta corrente e últimas movimentações.
- **Investimentos:** catálogo de produtos financeiros de renda fixa, ações, multimercado com diferentes níveis de risco, permitindo aporte e resgate.
- **Pagamentos:** pagamento de boletos via código de barras, com simulação de cenários: sucesso, já pago, expirado, saldo insuficiente, não encontrado, agendado.
- **Notificações e Perfil:** funcionalidades de apoio à experiência do usuário.

**Público-alvo:** usuários finais de uma carteira digital fictícia, usada neste contexto como ambiente de prática de QA.

## 7.6 Estratégia de testes

**Níveis de teste:**
- Teste funcional manual exploratório 
- Teste de API automatizado Cypress + JavaScript
- Teste de interface (E2E UI) automatizado (Cypress + JavaScript)
- Teste de performance (k6 + JavaScript)
- Teste de acessibilidade automatizado (WCAG 2.1 AA como referência)

**Ferramentas adotadas:** Cypress (UI e API), k6 (performance), Mochawesome (relatórios de evidência), cypress-axe (acessibilidade), GitHub Actions (CI/CD), PostgreSQL (`pg`) + `bcryptjs` para o script de seed de massa de dados.

**Critério de uso:** testes manuais exploratórios foram usados na fase inicial para levantamento de regras de negócio e descoberta de defeitos;
 testes automatizados cobrem os fluxos regressivos de maior risco, priorizados pela matriz RBT 

**Testing patterns adotados**:
- **Design:** *Page Object Model* (POM) — encapsula seletores e ações de cada tela em classes/objetos reutilizáveis, reduzindo duplicação e fragilidade dos testes de UI.
- **Execução:** *Data-Driven Testing* — os casos de teste (positivos/negativos) são parametrizados via constantes/objetos de dados compartilhados (ex.: mapa de códigos de barras em `paid-slips.cy.js`, cobrindo sucesso/já pago/expirado/saldo insuficiente/agendado a partir do mesmo fluxo), evitando duplicar o corpo do teste para cada massa de entrada. Contratos de resposta (schema) são validados via fixture JSON (`market-share.schema.json`, com ajv).
- **Processo:** *Test Independence* (isolamento de testes) — cada teste cria e limpa seu próprio contexto de dados via seed/cy.task(), podendo rodar em qualquer ordem, isoladamente ou em paralelo, sem depender de estado deixado por outro teste.
- **Gerenciamento:** *Risk-Based Testing (RBT)* — priorização e alocação de esforço de teste (incluindo quais fluxos ganham testes de performance) conforme a matriz de risco da seção 7.8.

**Heurísticas de teste aplicadas na exploração manual:** CRUD (criar/ler/atualizar/deletar dados), Boundary Value Analysis (valores limites como saldo exato, tamanho mínimo/máximo de campos), Equivalence Partitioning (classes de equivalência de e-mail/senha válidos e inválidos), e o mnemônico **CRUSSPIC STMPL** aplicado informalmente aos módulos financeiros (Conformidade, Confiabilidade, Usabilidade, Segurança).

**Execução mínima:** todo fluxo classificado como risco Alto ou Crítico na matriz RBT (seção 7.8) deve ter, no mínimo, 1 caso de teste automatizado positivo e 2 casos negativos/edge case cobertos antes de ser considerado testado.

## 7.7 Critérios de entrada e saída

**Critérios de entrada:**
- Ambiente local no ar (backend, frontend, banco de dados) 
- Script de seed de dados funcional 
- Protótipo Figma 

**Critérios de saída**
- Todos os módulos do escopo 
- Bugs encontrados documentados em `bugReport.md` com severidade classificada.
- Cobertura mínima de automação atingida: ≥30 casos de UI, ≥30 casos de API, ≥15 casos de performance
- Pipeline de CI executando com sucesso as automações de UI e API.
- Nenhum bug de severidade Crítica 

## 7.8 Matriz de risco (RBT) dos módulos

Escala: Impacto (1 a 5) × Probabilidade (1 a 5) 

| Módulo | Impacto | Probabilidade | RBT | Classificação | Justificativa |
|---|---|---|---|---|---|
| Pagamento de boleto | 5 | 5 | **25** | Crítico | Envolve movimentação de dinheiro; bug de UX grave confirmado (teclado de PIN ambíguo, BUG-01) + múltiplos bugs de mensagens/validação |
| Login | 5 | 5 | **25** | Crítico | Gateway de acesso a 100% da aplicação; qualquer regressão bloqueia todos os usuários; bugs de sessão relacionados (logout) |
| Investimentos (investir/resgatar) | 5 | 4 | 20 | Alto | Envolve movimentação de dinheiro; bug de cards de resumo desatualizados encontrado |
| Cadastro | 4 | 4 | 16 | Alto | Porta de entrada de novos usuários; múltiplos bugs de validação encontrados (nome, senha, RG) |
| Perfil / Logout | 5 | 3 | 15 | Alto | Bug de segurança confirmado (sessão não invalidada) — impacto alto apesar de probabilidade de uso mais baixa |
| Home / Consulta de saldo | 5 | 3 | 15 | Alto | Exibe dado financeiro crítico; bug de chamada redundante (500) observado |
| Recuperação de senha | 3 | 5 | 15 | Alto | Funcionalidade essencial de autoatendimento; endpoint confirmado quebrado (404) |
| Conta corrente (API) | 4 | 3 | 12 | Médio | Nenhum dos 5 endpoints exige autenticação (BUG-22); exploração bloqueada hoje só pela falha de validação do DTO — risco latente se corrigida sem adicionar autenticação |
| Notificações | 2 | 5 | 10 | Médio | Módulo quebrado no frontend (BUG-03); no backend, endpoint de envio sem autenticação e falha de posse ao marcar como vista (BUG-23, IDOR) |
| Extrato / Últimas movimentações | 3 | 3 | 9 | Médio | Não há tela de extrato completo (gap confirmado), mas widget da Home funciona |
| Onboarding | 1 | 2 | 2 | Baixo | Apenas tour informativo, sem impacto funcional/financeiro |

**Módulos com RBT ≥ 20** (usados para seleção dos cenários de performance, `perf/`): **Pagamento de boleto**, **Login** e **Investimentos**.

## 7.9 Ambiente e dados

**Ambiente:**
- SO: Windows 11 (WSL2 + Docker Desktop)
- Backend: NestJS 11 + TypeORM + PostgreSQL 16 (container `postgres:16-alpine`) + Redis (container `redis:latest`), porta 3000
- Frontend: Next.js 15 + React 19, porta 3001 (HTTPS self-signed via mkcert)
- Navegador de testes: Electron/Chromium (via Cypress)
- Node.js 20/24, pnpm

**Massa de dados:** gerada via script próprio (`db/testUser.js`, `db/marketShares.js`, no repositório de automação), com estratégia de *seed data*:
- 1 usuário de teste fixo (e-mail `qa.seed.user@academywallet.test`), com conta corrente e saldo inicial de R$ 10.000,00
- 14 produtos de investimento cadastrados em `tb_market_shares`, cobrindo todos os níveis de risco (muito baixo a muito alto)
- Script idempotente: remove dados anteriores antes de recriar, permitindo reexecução segura antes de cada bateria de testes.
- Códigos de barra fixos fornecidos pela especificação para simular cenários de pagamento

**Credenciais de acesso:** usuário/senha do PostgreSQL (`postgres`/`admin`, ambiente local não produtivo) e usuário de teste da aplicação (seção acima), documentados no `README.md` do repositório de automação.

## 7.10 Processos de execução

1. Teste exploratório manual guiado por sessão (session-based), documentando passos, resultado esperado x observado, e evidências armazenadas em `evidencias/`.
2. Bugs e melhorias identificados são registrados imediatamente em `bugReport.md` / `melhorias.md`, com severidade e passos de reprodução.
3. Casos de teste automatizados são versionados em specs (`specs-gui/`, `specs-api/`) no formato Gherkin
4. Execução local via `npx cypress run` / `k6 run`, e execução em CI via GitHub Actions
5. Relatórios de evidência gerados automaticamente (Mochawesome para Cypress, resumo nativo do k6) a cada execução, arquivados como artefato da pipeline.

## 7.11 Entregáveis

- `planoDeTestes.md` 
- `bugReport.md`
- `melhorias.md`
- `processos.md`
- `conclusao.md`
- `README.md` 
- Projetos de automação: `gui/` (UI/Cypress), `api/` (API/Cypress), `perf/` (k6)
- Especificações de cenários: `specs-gui/`, `specs-api/` (Gherkin)
- Script de seed de dados (`db/`)
- Pipelines de CI (`.github/workflows/`)
- Evidências de execução (screenshots, relatórios Mochawesome, resultados k6) em `evidencias/`

## 7.12 Métricas

- **Taxa de aprovação de casos de teste automatizados** por execução de CI.
- **Cobertura de casos por módulo** vs. matriz RBT
- **Densidade de defeitos por módulo** para identificar módulos com maior concentração de problemas 
- **Tempo médio de execução da suíte** para acompanhar degradação de performance dos próprios testes.
- **Thresholds de performance** (p95 de tempo de resposta, taxa de erro, taxa de checks) definidos por cenário k6 em `perf/lib/thresholds.js`.

## 7.13 Papéis e responsabilidades (matriz RACI)

| Atividade | QA Líder (Responsável pela certificação) | Desenvolvedor(es) | Product Owner | Avaliador(es) Wisedot |
|---|---|---|---|---|
| Elaboração do plano de testes | R/A | C | C | I |
| Criação de casos e cenários de teste | R/A | I | C | I |
| Execução de testes manuais | R/A | I | I | I |
| Automação de testes (UI/API/Performance) | R/A | C | I | I |
| Registro e priorização de bugs | R/A | C | C | I |
| Correção de bugs | I | R/A | C | — |
| Aprovação de release/entrega | C | I | R/A | A (avaliação da certificação) |
| Configuração de CI/CD | R/A | C | I | I |

*R = Responsável (executa), A = Aprovador (responde pelo resultado), C = Consultado, I = Informado.*
*Neste projeto de certificação, o papel de QA Líder concentra R/A na maioria das atividades por se tratar de um exercício individual — a matriz reflete como a responsabilidade seria distribuída numa equipe completa.*

## 7.14 Cronograma

| Fase | Atividades | Status |
|---|---|---|
| 1. Setup do ambiente | Instalação de WSL2/Docker, clone do projeto, subida dos containers, validação | Concluído |
| 2. Levantamento de requisitos | Leitura do protótipo Figma, mapeamento dos módulos | Concluído |
| 3. Testes exploratórios manuais | Execução de sessões de teste, registro de bugs e melhorias | Concluído |
| 4. Massa de dados | Implementação e validação do script de seed | Concluído |
| 5. Reteste com massa de dados | Validação de extrato, investimentos e pagamento com saldo | Concluído |
| 6. Documentação de testes | `planoDeTestes.md`, `bugReport.md`, `melhorias.md` | Concluído (este ciclo) |
| 7. Automação de UI | Especificação Gherkin + implementação Cypress (≥30 casos) | Concluído (52 casos) |
| 8. Automação de API | Especificação Gherkin + implementação Cypress (≥30 casos) | Concluído (114 casos) |
| 9. Automação de performance | Cenários k6 para módulos com RBT≥20 (≥15 casos) | Concluído (15 cenários) |
| 10. Integração contínua | Workflows GitHub Actions (manual, agendado, deploy, integrado) | Concluído |
| 11. Documentação final | `processos.md`, `conclusao.md`, `README.md` | Concluído |
| 12. Entrega | Publicação do repositório `WISEDOT` e envio para avaliação | Concluído |

**Mapa mental dos módulos (visão simplificada):**
```
AcademyWallet
├── Autenticação
│   ├── Login
│   ├── Cadastro (4 etapas)
│   └── Recuperação de senha
├── Carteira
│   ├── Home (saldo + últimas movimentações)
│   └── Extrato (gap: não existe tela dedicada)
├── Investimentos
│   ├── Catálogo (busca/filtro por risco)
│   ├── Investir
│   └── Meus investimentos / Resgate
├── Pagamentos
│   └── Boleto (3 etapas + confirmação por PIN)
├── Notificações
└── Perfil
    ├── Dados da conta
    └── Logout
```

## 7.15 Massa de dados

| Tipo | Valor / Descrição |
|---|---|
| Usuário válido (seed) | `qa.seed.user@academywallet.test` / `Seed@Teste123` / PIN `123456` |
| Saldo inicial | R$ 10.000,00 |
| Produtos de investimento | 14 fundos (renda fixa, ações, multimercado), risco de Muito Baixo a Muito Alto |
| Código de barras — sucesso | `34191751243456787123041234560005199890000015000` |
| Código de barras — já pago | `34191751243456787123041234560005199890000015001` |
| Código de barras — expirado | `34191751243456787123041234560005199890000015002` |
| Código de barras — saldo insuficiente | `34191751243456787123041234560005199890000015003` |
| Código de barras — não encontrado | `34191751243456787123041234560005199890000015004` |
| Código de barras — agendado/pendente | `34191751243456787123041234560005199890000015005` |
| Usuários inválidos (cenários negativos) | e-mail duplicado, CPF duplicado, senha fraca, e-mail mal formatado, campos vazios |
| Valores de transação (edge cases) | R$ 0,01 (mínimo), valor igual ao saldo exato, valor acima do saldo disponível |

## 7.16 Estratégia de regressão

- Toda automação (UI/API) roda a cada `push`/`pull request` na branch principal via CI (workflow "integrado"), garantindo que novas alterações não quebrem os fluxos já validados.
- Suíte completa de UI + API também roda de forma agendada (diária) para detectar regressões causadas por fatores externos (ex.: expiração de certificado, drift de ambiente).
- Antes de qualquer nova entrega/release, os casos classificados como Alto/Crítico na matriz RBT (seção 7.8) são executados como *smoke test* obrigatório de saída.
- Dados de teste são sempre recriados via seed antes da suíte de regressão, eliminando dependência de estado residual de execuções anteriores.
- Bugs corrigidos recebem um caso de teste de regressão dedicado antes de serem considerados fechados (não aplicável neste ciclo, pois a correção de bugs está fora do escopo do QA neste projeto).

## 7.17 Referências

- ISO/IEC/IEEE 29119 — Software Testing 
- ISO/IEC 25010 — System and Software Quality Models 
- Documentação oficial: Cypress (cypress.io), k6 (k6.io), Mochawesome, cypress-axe, GitHub Actions
- WCAG 2.1 (Web Content Accessibility Guidelines) — referência para os testes de acessibilidade automatizados
- Protótipo de referência (Figma/FigJam): `figma.com/board/Q81u5pgz9T2nymGDCkjqBj/AcademyWallet`
- Repositório da aplicação sob teste: `github.com/wisedot/certificacao`
- Repositório de automação (autor): `github.com/Rafeuss/WISEDOT`
