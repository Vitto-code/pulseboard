# Decisoes tecnicas

Formato: contexto, opções consideradas, decisão e consequências.

## 1. Autenticacao propria em vez de Auth.js

**Contexto.** O painel precisa de login com e-mail e senha e proteção de rotas. Auth.js (NextAuth) é o caminho padrão no ecossistema Next.

**Opções.** (a) Auth.js com provider de credenciais; (b) auth propria com bcrypt + sessão em banco; (c) provedor externo (Clerk, Supabase Auth).

**Decisão.** Autenticação própria: senha com bcrypt (10 rounds), token de sessão opaco de 32 bytes, sessão persistida com expiração de 7 dias, cookie httpOnly + SameSite=Lax.

**Consequências.** O fluxo inteiro é visível e testável no repositório ([src/server/auth/service.ts](../src/server/auth/service.ts)), o que era o objetivo de portfólio. Custo: sem OAuth, sem reset de senha, e a responsabilidade pela segurança é nossa — mitigado por hash forte, cookie httpOnly e sessão expirável. Surpresa real: o middleware roda no runtime edge e não pode importar `node:crypto`, o que forçou separar as constantes de auth em um módulo próprio ([src/server/auth/constants.ts](../src/server/auth/constants.ts)) e deixar a validação da sessão fora da borda.

## 2. Interface de repositório com implementação em memória

**Contexto.** A máquina de desenvolvimento não tinha Docker/PostgreSQL disponível em um momento do projeto, e os testes não deveriam depender de banco.

**Opções.** (a) mocks de Prisma com vitest; (b) SQLite em testes via Prisma; (c) interface `Repository` com implementações Prisma e memória.

**Decisão.** Opção (c): [src/server/db/types.ts](../src/server/db/types.ts) define o contrato; `PrismaRepository` atende produção e `MemoryRepository` atende testes e o modo demo (`DB_DRIVER=memory`).

**Consequências.** Testes rápidos e determinísticos sem mockar SQL, e um modo demo completo sem infraestrutura. Custo: toda funcionalidade de persistência precisa ser implementada duas vezes, e a implementação em memória pode divergir de semânticas do banco (ordenação, unicidade) — mitigado testando o contrato contra as duas implementações. O seed em memória também revelou um bug real (datas de cadastro no futuro) que passaria batido em produção até o fim do mês.

## 3. Graficos SVG feitos a mão em vez de biblioteca de charts

**Contexto.** A visão geral precisa de linha (MRR 12 meses), barras (cadastros) e donut (status). Recharts e Chart.js são as opções usuais.

**Opções.** (a) Recharts; (b) Chart.js; (c) SVG próprio renderizado no servidor.

**Decisão.** SVG próprio: a geometria vive em funções puras em [src/lib/chart-math.ts](../src/lib/chart-math.ts) e os componentes apenas emitem markup.

**Consequências.** Zero JavaScript de gráfico no cliente, gráficos que aparecem já no HTML inicial, e matemática com cobertura de testes próxima de 100%. Custo: sem tooltips, zoom ou animações — aceitável para um dashboard interno, mas seria o primeiro ponto a rever se o produto crescesse para relatórios interativos.

## 4. Server Actions + zod em vez de API REST

**Contexto.** O CRUD de clientes precisa de mutações seguras. Em Next.js App Router há duas rotas: Route Handlers (REST) ou Server Actions.

**Opções.** (a) Route Handlers com fetch no cliente; (b) Server Actions invocadas pelos formulários.

**Decisão.** Server Actions com validação zod compartilhada entre cliente e servidor ([src/lib/validation.ts](../src/lib/validation.ts)), seguidas de `revalidatePath` para atualizar as listagens.

**Consequências.** Menos código (sem camada de serialização HTTP), formulários que funcionam com progressive enhancement, e erros de validação voltando estruturados para o formulário. Custo: acoplamento ao Next.js — se um dia existir um app mobile, será preciso expor uma API REST por cima dos mesmos serviços, o que a separação em camadas já permite.

## 5. PostgreSQL com migracoes versionadas, dinheiro em centavos

**Contexto.** O domínio é financeiro (MRR) e relacional (usuários, sessões, clientes).

**Opções.** (a) PostgreSQL + Prisma; (b) SQLite; (c) MongoDB.

**Decisão.** PostgreSQL com Prisma Migrate (SQL versionado em `prisma/migrations`), e MRR armazenado como inteiro em centavos.

**Consequências.** Integridade relacional real, migrações reproduzíveis em CI e produção, e nenhum erro de arredondamento em moeda — a formatação em BRL acontece só na apresentação. Custo: dependência de Docker para rodar localmente, mitigada pelo modo demo em memória da decisão 2. O que faria diferente: consideraria `citext` para e-mails desde a primeira migração, em vez de tratar case no código.
