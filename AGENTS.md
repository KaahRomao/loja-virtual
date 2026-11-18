# Vora Supermarket — Instruções para o Codex

## Projeto

O Vora Supermarket é uma loja virtual desenvolvida como Projeto Integrador do SENAI.

Repositório: https://github.com/KaahRomao/loja-virtual

## Tecnologias

- Front-end: React, Vite, Tailwind CSS e React Router.
- Back-end: Node.js, Express e JWT.
- Banco de dados: SQLite/libSQL com Turso.
- Pagamentos: Mercado Pago.
- Publicação: Vercel e serviços de back-end a confirmar.

## Estrutura

- `front-end/`: interface da loja e painel administrativo.
- `back-end/`: API, controllers, services, models e middlewares.
- `documentos/`: modelagem e documentação do banco de dados.

## Fontes de referência

- Notion: documentação, requisitos e regras de negócio.
- Figma: protótipo visual do Vora Supermarket.
- GitHub: código e histórico de desenvolvimento.

## Regras de trabalho

1. Antes de qualquer alteração, analisar os arquivos envolvidos.
2. Não apagar funcionalidades existentes sem autorização.
3. Não alterar o banco de produção sem autorização.
4. Não modificar arquivos `.env` nem divulgar credenciais.
5. Verificar conflitos de merge e arquivos incompletos.
6. Explicar o problema, as possíveis soluções e o impacto antes de executar alterações importantes.
7. Respeitar a arquitetura existente.
8. Executar testes após modificações, quando possível.
9. Não fazer commits, merges ou pushes sem autorização.
10. Distinguir funcionalidades implementadas, simuladas e pendentes.

## Contexto atual

O projeto passou por alterações envolvendo as branches `main` e `vercel`. Há histórico de conflitos de merge.

O back-end contém implementação de autenticação, produtos, pedidos, administrador e pagamentos.

A integração completa do front-end com o back-end ainda precisa ser validada.

Prioridade inicial: analisar a situação atual do repositório antes de corrigir ou implementar funcionalidades.
