# Relatório de Melhorias — AcademyWallet

Sugestões de melhoria de experiência e usabilidade percebidas durante os testes.

---

## 1. Instrução visível no teclado de confirmação por PIN

O modal "Senha" usa botões com pares de dígitos ("5 ou 9") sem nenhuma instrução de uso, e o usuário não tem como saber que basta clicar no botão que contém o dígito desejado (ver BUG-01). Uma frase curta de orientação no próprio modal, ou um indicador de progresso a cada dígito registrado, tornaria a funcionalidade utilizável sem tentativa e erro. Se a intenção do embaralhamento for mantida, um teclado completo de 10 botões com posições embaralhadas a cada abertura preservaria a segurança sem a ambiguidade dos pares.

**Evidência:** `evidencias/exploracao-manual/pagamento-modal-senha-pin-teclado.png`, `pagamento-pin-apos-clique-5ou9.png`

## 2. Mensagens de validação específicas por tipo de problema

Várias mensagens de erro são genéricas e reaproveitadas para situações diferentes (ex.: "Preencha o código de barras" aparece tanto para campo vazio quanto para valor de tamanho inválido). Uma mensagem própria para cada situação (campo vazio, formato inválido, tamanho insuficiente, valor fora do intervalo), usada de forma consistente em todos os formulários, ajudaria o usuário a entender o que precisa corrigir.

**Evidência:** `evidencias/exploracao-manual/pagamento-bug-msg-codigo-barras-curto.png` (campo preenchido com 9 dígitos recebendo a mesma mensagem de campo vazio)

## 3. Feedback visual sempre que uma ação falhar

Em algumas telas, quando uma ação falha, nada acontece: a tela fica vazia ou o clique parece ser ignorado (Notificações e Recuperação de senha são exemplos). Como padrão de experiência, toda ação do usuário que falhar deveria exibir uma mensagem amigável, mesmo em cenários inesperados, para a pessoa nunca ficar na dúvida se algo aconteceu.

**Evidência:** `evidencias/exploracao-manual/notificacoes-pagina.png` (tela vazia, sem mensagem), `esqueci-senha-bug-404-sem-feedback.png` 

## 4. Agrupamento visual na digitação do código de barras

O campo de código de barras aceita apenas dígitos e habilita o botão "Continuar" no tamanho certo, mas exibe os 47 dígitos como um bloco contínuo, difícil de conferir contra a linha digitável impressa no boleto (que vem separada em grupos). Formatar a digitação nos mesmos grupos da linha digitável facilitaria a conferência visual e reduziria erros de digitação. O campo de CPF do cadastro já faz isso (máscara `000.000.000-00` aplicada enquanto se digita) e serve de referência de padrão dentro da própria aplicação.

**Evidência:** `evidencias/exploracao-manual/CT-EXT-003-boleto-dados-carregados.png` 

## 5. Diferenciar "nenhum produto disponível" de "nenhum resultado para a busca"

Na página de Investimentos, quando não há nenhum produto cadastrado, a mensagem exibida é "Sem resultados para essa pesquisa", mesmo sem o usuário ter pesquisado nada. Uma mensagem para cada caso (ex. "Nenhum produto disponível no momento" vs. "Nenhum resultado para sua busca") orienta melhor o usuário sobre o que fazer em seguida (tentar outra busca vs. entender que não há produtos).

**Evidência:** `evidencias/exploracao-manual/investimentos-pagina-lista-vazia.png` 

## 6. Acessibilidade visual e para leitores de tela

Os scans automatizados de acessibilidade (ver BUG-18) apontam melhorias que fariam diferença para pessoas com deficiência: declarar o idioma da página, dar nome legível a todos os botões e links (alguns hoje só têm ícone), exibir rótulos visíveis nos campos de formulário (em telas do pagamento, alguns campos só têm dica oculta) e revisar o contraste de cores nas etapas de data e resumo do pagamento. São ajustes de interface que também beneficiam qualquer usuário em telas pequenas ou ambientes com pouca luz.

**Evidência:** `gui/wcag-checklist.json` e log da suíte `gui/cypress/e2e/acessibilidade/acessibilidade.cy.js` 
