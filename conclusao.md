# Conclusão

## A jornada

A Certificação Wisedot me colocou no papel de líder de QA de um projeto de ponta a ponta, e isso mudou bastante minha percepção do que é o trabalho de QA. Não foi só escrever casos de teste e automatizar telas. Teve muita coisa antes disso: subir o ambiente do zero, entender uma aplicação sem nenhuma documentação de regras de negócio, decidir o que testar primeiro, e só depois de tudo isso chegar na parte de automatizar. Foi a primeira vez que senti na prática que boa parte do trabalho de QA acontece antes de escrever o primeiro teste.

## Descobertas e desafios

Um desafio do projeto foi o teclado de confirmação de pagamento. Cada botão mostrava dois números juntos, tipo "5 ou 9", sem nenhuma pista de qual dos dois estava sendo digitado de fato. Descobri depois que era um mecanismo de segurança para dificultar que alguém pegasse a senha gravando a tela. Ficou o aprendizado: nem tudo que parece quebrado é erro. Às vezes é uma decisão de segurança que ninguém parou para pensar em como a pessoa do outro lado ia usar.

O login ficando extremamente lento com pouquíssimos usuários simultâneos. No começo achei que fosse instabilidade do meu ambiente local. Só investigando com calma percebi que era um problema de arquitetura mesmo: a validação da senha travava o sistema inteiro enquanto rodava, e cada login tinha que esperar o anterior terminar para começar. Um teste de carga que parecia só mais um item obrigatório da certificação acabou revelando algo que nenhum teste manual mostraria.

## Como usei Inteligência Artificial

Usei IA ao longo do projeto para tirar dúvidas e fazer pequenas correções, montar specs e documentos, ordenar e padronizar a forma que a documentação é escrita.

## O que levo disso para minha carreira

Vou levar comigo, acima de tudo, a ideia de priorizar por risco em vez de tentar testar tudo igualmente. Nem todo canto do sistema merece o mesmo esforço, e decidir isso com critério é parte do trabalho, não um atalho. Também aprendi a tratar a massa de dados como parte do planejamento da automação desde o início, a não confiar cegamente em tudo que a AI devolve ou resolve para te ajudar.

