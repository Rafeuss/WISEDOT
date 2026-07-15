# Análise de Processos — Fluxo Kanban e CFD

## 1. O fluxo analisado

O time ágil trabalha com o seguinte fluxo Kanban:

```
Backlog → Em análise → Análise pronta → Em desenvolvimento → Desenvolvimento pronto → Em teste → Teste pronto → Entregue
```

O Cumulative Flow Diagram (CFD) fornecido cobre um período de 8 dias, agrupando o fluxo em 5 faixas: **Pronto** (total acumulado), **Em análise**, **Em desenvolvimento**, **Em testes** e **Implantado**.

## 2. Leitura do CFD

Observando a evolução das faixas ao longo dos 8 dias:

| Faixa | Comportamento observado |
|---|---|
| Pronto (total) | Cresce de forma constante: 0 → 3 → 5 → 9 → 11 → 12 → 14 → 15 → 16 |
| Em análise | Cresce rapidamente até o dia 5 (chegando a 11 itens) e fica estagnada em 11 do dia 5 ao dia 8 |
| Em desenvolvimento | Só começa a crescer no dia 4 e estagna em 8 itens do dia 6 ao dia 8 |
| Em testes | Praticamente plana: só sai de 0 no dia 6, chegando a apenas 3 itens no dia 8 |
| Implantado | Permanece em 0 durante todo o período de 8 dias |

## 3. Gargalos e desperdícios identificados

### 3.1 Gargalo primário: etapa de Análise

A faixa "Em análise" acumula 11 itens e trava nesse patamar por 4 dias seguidos (dias 5 a 8). Isso indica que o time está puxando trabalho para análise mais rápido do que consegue analisar e liberar para o desenvolvimento, um sintoma clássico de ausência de limite de WIP (Work In Progress) nessa etapa. O efeito cascata é que todas as etapas seguintes (desenvolvimento, teste, entrega) ficam famintas por trabalho pronto para avançar.

### 3.2 Gargalo secundário: etapa de Desenvolvimento

A faixa "Em desenvolvimento" também estagna (em 8 itens, do dia 6 ao 8), replicando o mesmo padrão da análise uma etapa depois. Isso sugere que o problema de falta de WIP limit não é isolado da análise: é um padrão sistêmico no fluxo do time.

### 3.3 Testes espremidos no fim do fluxo (anti-padrão "water-Scrum-fall")

A faixa "Em testes" só começa a se mover no dia 6, com apenas 1, 2 e 3 itens acumulados nos três últimos dias. Isso é a evidência mais forte de que a qualidade está sendo tratada como uma etapa isolada e tardia, em vez de estar embutida ao longo de todo o fluxo. O time só "lembra" de testar quando o trabalho já se acumulou nas etapas anteriores, comprimindo o teste no fim do ciclo, quando há menos tempo e menos margem para corrigir problemas.

### 3.4 Zero entregas em 8 dias (lead time excessivo, ausência de fluxo contínuo)

A faixa "Implantado" não sai de zero durante toda a janela observada. Mesmo com 16 itens já em "Pronto" (ou seja, gerados/prontos para avançar), nenhum item completou o fluxo até a entrega. Isso indica lotes de trabalho grandes demais e/ou dependências que impedem o fechamento de qualquer item individual. O time está otimizando para iniciar trabalho, não para terminá-lo, violando o princípio "stop starting, start finishing" do Kanban.

## 4. Atuação do QA em cada etapa do Kanban

A tabela abaixo mapeia o que o QA faz (ou deveria fazer) em cada coluna específica
do fluxo, e não só de forma genérica, conectando cada etapa a um gargalo
identificado no CFD (seção 3) e à atividade correspondente detalhada na seção 5.

| Etapa | Atuação do QA | Gargalo/atividade relacionada |
|---|---|---|
| **Backlog** | Participa do refinamento (Three Amigos), levanta riscos e casos de borda antes do item ser puxado; ajuda a priorizar pela matriz RBT. | Atividades 2 e 3 |
| **Em análise** | Garante que o item não sai desta coluna sem critérios de aceite testáveis e cenários de teste (ao menos os principais) esboçados, o chamado "Definition of Ready". | Ataca o gargalo 3.1 (represamento na análise) |
| **Análise pronta** | Revisa se os cenários esboçados cobrem os casos de borda e riscos levantados no backlog, antes do item ser puxado para desenvolvimento. | Gate de qualidade antes do gargalo 3.2 |
| **Em desenvolvimento** | Testes exploratórios em pareamento com o dev; acompanha a escrita de testes automatizados (unitários/contrato) como parte do próprio desenvolvimento, não depois. | Atividades 4 e 6; ataca o gargalo 3.2 |
| **Desenvolvimento pronto** | Confere que a suíte de regressão automatizada (CI) já rodou e passou antes do item avançar, um gate de qualidade que evita chegar "cru" na próxima coluna. | Atividade 5; ataca o anti-padrão 3.3 |
| **Em teste** | Executa a validação funcional/exploratória que não é coberta por automação, contra os critérios de aceite definidos na análise; documenta evidências (prints, logs). | Ataca diretamente o anti-padrão 3.3 (testes espremidos no fim) |
| **Teste pronto** | Roda uma última verificação de regressão (smoke) antes do deploy; garante que os bugs encontrados estão documentados e triados por severidade. | Gate final antes do gargalo 3.4 |
| **Entregue** | Acompanha o comportamento em produção (smoke test pós-deploy) e retroalimenta o processo com métricas (bugs encontrados em produção vs. em teste), informando os próximos refinamentos. | Fecha o ciclo de feedback do fluxo |

## 5. Atividades de qualidade propostas (Shift-Left e Shift-Everywhere)

### Shift-Left (antecipar a qualidade para o início do fluxo)

1. **"Definition of Ready" com critério de testabilidade**: nenhum item deve sair de "Em análise" sem critérios de aceite claros e cenários de teste (ao menos os principais) já esboçados. Isso ataca diretamente o gargalo da análise: reduz retrabalho por especificação incompleta, que é uma causa comum de itens "voltarem" ou ficarem parados.
2. **Three Amigos / refinamento com QA presente**: incluir QA (não só dev e PO) nas sessões de refinamento do backlog, analisando riscos e casos de borda antes do item entrar em desenvolvimento. Reduz a probabilidade de bugs estruturais descobertos tarde.
3. **Matriz de risco (RBT) aplicada no backlog**: priorizar a saída da etapa de análise pelos itens de maior risco/impacto primeiro (mesmo princípio usado neste projeto, seção 7.8 do `planoDeTestes.md`), em vez de ordem de chegada, concentrando esforço de qualidade onde o impacto de um defeito é maior.

### Shift-Everywhere (qualidade contínua em todas as etapas, não só no fim)

4. **Testes automatizados como parte da "Definition of Done" do desenvolvimento**: nenhum item deve ir de "Em desenvolvimento" para "Desenvolvimento pronto" sem testes unitários/de contrato (API) cobrindo o que foi feito, movendo parte do esforço de teste (hoje 100% concentrado na etapa "Em teste") para dentro da própria etapa de desenvolvimento.
5. **Pipeline de CI contínuo**: como implementado neste projeto (`.github/workflows/`), rodar automaticamente a suíte de regressão (UI + API) a cada mudança integrada, e não apenas quando o item chega manualmente à etapa "Em teste". Isso decompõe o teste em pequenas verificações contínuas, evitando a compressão observada no CFD.
6. **Testes exploratórios em pareamento (dev + QA) antes de "Desenvolvimento pronto"**: antecipar parte da validação manual para o fim do desenvolvimento, reduzindo o volume que chega de uma vez à etapa de teste formal.
7. **Limite explícito de WIP por coluna**: estabelecer um limite máximo de itens simultâneos em "Em análise" e "Em desenvolvimento" (ex.: WIP ≤ 5), forçando o time a terminar itens em andamento antes de iniciar novos, atacando diretamente o padrão de estagnação observado no CFD.

## 6. Priorização das atividades (visão de um profissional de QA em um time ágil)

Um profissional de QA, ao analisar este CFD, priorizaria as ações na seguinte ordem, buscando maximizar eficiência operacional, reduzir retrabalho e melhorar as métricas de fluxo:

1. **Primeiro, atacar o gargalo de "Em análise"** (item 7 acima, WIP limit), pois é o ponto mais à esquerda do fluxo onde o represamento começa; resolver aqui tem efeito cascata positivo em todas as etapas seguintes. É também o ponto de maior alavancagem para aplicar Shift-Left (itens 1–3), já que a causa raiz provável do represamento é análise incompleta/ambígua que trava a saída dos itens.
2. **Em seguida, replicar o WIP limit para "Em desenvolvimento"**, já que o mesmo padrão de estagnação se repete ali. Sem isso, resolver só a análise apenas moveria o gargalo uma etapa adiante, sem ganho de throughput.
3. **Paralelamente, introduzir os testes automatizados na Definition of Done do desenvolvimento** (item 4) e o pipeline de CI contínuo (item 5). Isso é o que efetivamente resolve o sintoma mais grave do CFD (zero itens implantados): ao mover parte da validação para dentro do próprio desenvolvimento e rodá-la continuamente, o item chega à etapa de teste formal já com boa parte da qualidade validada, reduzindo o tempo que fica ali parado.
4. **Por último (mas de forma contínua a partir de então), consolidar as práticas de pareamento exploratório e RBT no backlog** (itens 3 e 6) como refinamento incremental do processo, já que dependem das mudanças estruturais anteriores (WIP limits e automação) estarem em vigor para gerar o efeito esperado nas métricas de fluxo.

Essa ordem prioriza resolver a causa raiz do represamento (WIP descontrolado) antes de otimizar a velocidade de execução dentro de cada etapa. Não adianta acelerar o teste se o trabalho nunca chega até ele em um ritmo saudável, e não adianta ter um "Definition of Done" mais rigoroso se o WIP continuar sem limite, pois o represamento simplesmente se moveria para a próxima etapa mais lenta.
