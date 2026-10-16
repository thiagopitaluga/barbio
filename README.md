# Barbio

Sistema de gestão para barbearias com interface premium e fluxo integrado de reservas, atendimento, caixa e relacionamento.

## Estado atual

Esta publicação é uma **demonstração funcional**. Os dados são salvos no `localStorage` do navegador (`barbio-demo-v2`). Assim, reservas feitas em dispositivos diferentes não compartilham a mesma agenda. A troca entre visão do dono e do barbeiro demonstra a interface; não constitui controle de acesso seguro. Não use dados reais de clientes nesta versão.

## O que já funciona

- Agenda por profissional com duração do serviço, detecção de conflito, filtro por dia/profissional e fila de espera.
- Página de reserva em `/reservar`, com escolha de serviço, profissional, data, horário e cadastro do cliente.
- Atendimento com confirmação, falta, cancelamento e fechamento que registra pagamento, produto, estoque e comissão.
- Cadastro de clientes com histórico, preferências e profissional favorito.
- Caixa com receita, despesas, lucro estimado e comissões por profissional.
- Relatórios, exportação CSV e backup JSON.
- Mensagens prontas para WhatsApp, abertas manualmente pelo usuário.
- Personalização de nome, frase, endereço, horários, cor e logotipo.
- Layout adaptável a telas menores.

## Executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Para validar a versão de produção:

```bash
npm run lint
npm run build
```

## Antes do uso real

Para operar com várias barbearias e clientes reais, faltam: banco compartilhado com isolamento por barbearia, autenticação e autorização por papel, confirmação concorrente de reservas no servidor, backups do banco, integração oficial de mensagens, conciliação de pagamentos e testes de carga e segurança. O projeto Vercel já foi criado, e o recurso de autenticação Clerk está provisionado, mas não está ligado ao aplicativo. A ativação de um banco novo no Marketplace da Vercel aguarda o aceite dos termos do provedor pelo titular da conta.

A publicação não processa pagamentos nem envia mensagens automaticamente.

## Modelo para a versão com banco

O arquivo `database/schema.sql` contém um esquema inicial PostgreSQL para a evolução do produto. Ele separa os registros por barbearia, relaciona agenda, caixa, estoque e clientes e impede a gravação de horários sobrepostos para o mesmo profissional. É uma migração inicial, ainda não aplicada à versão publicada. A ativação do banco, das APIs e das permissões deve ocorrer em conjunto antes de usar dados reais.
