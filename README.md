# Nota Portal

Sistema web para gestão de notas fiscais eletrônicas (NF-e) e documentos fiscais eletrônicos, com foco em validação, importação e consulta de dados XML.

## Stack

| Camada   | Tecnologia                                      |
|----------|-------------------------------------------------|
| Frontend | React + Vite + TailwindCSS + TypeScript        |
| Backend  | Fastify + Prisma ORM + TypeScript               |
| Database | PostgreSQL (via Prisma)                        |
| Auth     | JWT (fastify-jwt) + bcrypt/argon2              |

## Estrutura do Projeto

```
nota-portal/
├── backend/                 # API REST (Fastify + Prisma)
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── routes/           # Definição das rotas
│   │   ├── services/         # Lógica de negócio
│   │   ├── middlewares/      # Auth e autorização
│   │   ├── schemas/          # Validação Zod
│   │   ├── utils/            # Helpers (JWT, bigint)
│   │   └── db/               # Cliente Prisma
│   └── prisma/
│       ├── schema.prisma     # Modelos do banco
│       └── migrations/       # Migrates Prisma
├── frontend/                # SPA (React + Vite)
│   ├── src/
│   │   ├── components/      # Componentes UI
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── routes/           # Rotas (react-router-dom)
│   │   ├── services/          # Cliente API (axios)
│   │   └── styles/           # CSS global
│   └── ...
└── package.json              # Root (monorepo npm workspaces)
```

## Início Rápido

### Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- npm ou pnpm

### 1. Configurar variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com a URL do banco e JWT_SECRET
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Gerar cliente Prisma e rodar migrations

```bash
npm -w backend run prisma:generate
npm -w backend run prisma:migrate
```

### 4. seed (dados iniciais)

```bash
npm -w backend run prisma:seed
```

### 5. Iniciar desenvolvimento

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs (Swagger): http://localhost:3000/docs

## Scripts Disponíveis

### Root (monorepo)

| Script        | Descrição                     |
|---------------|-------------------------------|
| `npm run dev` | Inicia frontend + backend dev |

### Backend

| Script              | Descrição                          |
|---------------------|------------------------------------|
| `npm run dev`       | Dev server com hot-reload (tsx)   |
| `npm run build`     | Compila TypeScript → dist/         |
| `npm run start`     | Inicia produção (node dist/server.js) |
| `npm run typecheck` | Verifica tipos TypeScript          |
| `npm run prisma:generate` | Gera cliente Prisma          |
| `npm run prisma:migrate`   | Roda migrations              |
| `npm run prisma:seed`      | Popula banco inicial          |

### Frontend

| Script        | Descrição                  |
|---------------|----------------------------|
| `npm run dev` | Dev server (Vite)          |
| `npm run build` | Build produção           |
| `npm run preview` | Preview do build       |
| `npm run lint` | ESLint                     |

## Funcionalidades

- [ ] **Dashboard** — métricas e gráficos de notas fiscais
- [ ] **Importação XML** — upload e parsing de arquivos XML NF-e
- [ ] **Validação XML** — validação estrutural de documentos fiscais
- [ ] **Cadastros** — gestão de emitentes, destinatários, produtos
- [ ] **Usuários e Permissões** — controle de acesso por roles
- [ ] **Logs de Sistema** — auditoria de operações
- [ ] **Notas Fiscais** — consulta e visualização de NF-e
- [ ] **Perfil** — edição de dados do usuário logado

## Tecnologias Detalhadas

### Backend
- **Fastify** — framework HTTP de alto desempenho
- **Prisma** — ORM com migrations e query builder
- **Zod** — validação de schemas
- **Sax / stream-json** — parsing de XML em stream
- **argon2** — hash de senhas
- **@fastify/swagger** — documentação OpenAPI

### Frontend
- **React 18** — UI
- **Vite** — bundler/dev server
- **TailwindCSS** — estilização utility-first
- **Radix UI** — componentes acessíveis (dialog, select, etc.)
- **React Hook Form + Zod** — formulários com validação
- **TanStack Query** — fetching e cache de dados
- **React Router 7** — roteamento
- **Recharts** — gráficos do dashboard

## Licença

MIT
