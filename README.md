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

## Database Schema

```
perfis
├── PK_perfil_id     (int, pk, autoincrement)
├── nome            (varchar 50, unique) — ADMIN | OPERADOR | AUDITOR
├── descricao       (varchar 255)
└── data_criacao    (datetime)

permissoes
├── PK_permissao_id (bigint, pk, autoincrement)
├── modulo          (varchar 50) — DASHBOARD | IMPORTACAO | NOTAS | USUARIOS | VALIDACAO | CADASTROS | LOGS | CONFIG
├── acao            (varchar 100) — VIEW | CREATE | UPDATE | DELETE | EXPORT
├── descricao       (varchar 255)
└── data_criacao    (datetime)
└── uk: modulo + acao

permissoes_perfis  (many-to-many)
├── PK_permissao_perfil_id (bigint, pk, autoincrement)
├── fk_perfil_id    (int, fk → perfis)
├── fk_permissao_id (bigint, fk → permissoes)
├── ativo           (boolean)
└── uk: fk_perfil_id + fk_permissao_id

usuarios
├── PK_usuario_id       (char 36, pk)
├── fk_perfil_id        (int, fk → perfis)
├── nome                (varchar 100)
├── email               (varchar 150, unique)
├── senha_hash          (varchar 255)
├── ativo               (boolean)
├── data_criacao        (datetime)
└── data_atualizacao    (datetime)

logs_auditoria
├── PK_log_id           (bigint, pk, autoincrement)
├── fk_usuario_id       (char 36, fk → usuarios)
├── acao                (varchar 100)
├── tabela_afetada      (varchar 50)
├── registro_afetado_id (varchar 50)
├── endereco_ip         (varchar 45)
├── agente_usuario      (varchar 255)
├── detalhes            (longtext)
└── data_criacao        (datetime)

logs_sistema
├── PK_log_id           (bigint, pk, autoincrement)
├── fk_usuario_id       (char 36, fk → usuarios)
├── modulo              (varchar 50)
├── acao                (varchar 100)
├── tabela_afetada      (varchar 50)
├── registro_afetado_id (varchar 50)
├── descricao           (varchar 255)
├── detalhes            (longtext)
├── endereco_ip         (varchar 45)
├── agente_usuario      (varchar 255)
└── data_criacao        (datetime)

importacoes
├── PK_importacao_id      (char 36, pk)
├── fk_usuario_id        (char 36, fk → usuarios)
├── nome_arquivo         (varchar 255)
├── hash_arquivo         (char 64, unique)
├── tamanho_arquivo_bytes (bigint)
├── status               (enum: PENDENTE | PROCESSANDO | CONCLUIDO | FALHOU | PARCIAL)
├── total_registros     (int)
├── registros_processados (int)
├── log_erros            (longtext)
├── data_hora_inicio     (datetime)
├── data_hora_fim        (datetime)
└── data_criacao         (datetime)

notas_fiscais
├── PK_nota_fiscal_id     (char 36, pk)
├── fk_importacao_id      (char 36, fk → importacoes, cascade)
├── tipo_documento        (enum: NFE | NFSE)
├── chave_acesso          (varchar 100, unique)
├── numero_documento      (varchar 50)
├── data_emissao          (datetime)
├── documento_emitente    (varchar 20)
├── nome_emitente         (varchar 150)
├── documento_destinatario (varchar 20)
├── nome_destinatario     (varchar 150)
├── valor_total           (decimal 15,2)
├── total_impostos        (decimal 15,2)
├── xml_bruto_json        (longtext)
├── fk_empresa_destinatario_id (char 36, fk → empresas)
├── fk_empresa_emitente_id     (char 36, fk → empresas)
└── data_criacao         (datetime)

itens_nota_fiscal, duplicatas_financeiras, dados_transporte,
impostos_nota, servicos_nota_fiscal → sub-tabelas de notas_fiscais

empresas
├── PK_empresa_id  (char 36, pk)
├── cnpj_cpf       (varchar 20, unique)
├── razao_social   (varchar 255)
├── nome_fantasia  (varchar 255)
├── endereco       (varchar 255)
├── cidade         (varchar 100)
├── uf             (varchar 2)
├── telefone       (varchar 20)
├── email          (varchar 150)
└── data_criacao   (datetime)

produtos_cadastrados
├── PK_produto_id (char 36, pk)
├── codigo        (varchar 100, unique)
├── descricao     (varchar 255)
├── ncm           (varchar 20)
├── cfop          (varchar 20)
├── unidade       (varchar 20)
├── preco         (decimal 15,4)
└── data_criacao  (datetime)

servicos_cadastrados
├── PK_servico_id (char 36, pk)
├── codigo        (varchar 100, unique)
├── descricao     (varchar 255)
├── preco         (decimal 15,2)
├── categoria     (varchar 100)
└── data_criacao  (datetime)

validacoes_xml
├── PK_validacao_id  (char 36, pk)
├── fk_usuario_id    (char 36, fk → usuarios)
├── tipo_documento   (enum: NFE | NFSE)
├── chave_acesso     (varchar 100)
├── numero_documento (varchar 50)
├── cnpj_emitente    (varchar 20)
├── nome_emitente    (varchar 150)
├── cnpj_destinatario (varchar 20)
├── nome_destinatario (varchar 150)
├── valor_total      (varchar 20)
├── status           (enum: PENDENTE | PROCESSANDO | VALIDO | INVALIDO | ERRO_CONSULTA)
├── situacao_fiscal  (varchar 50)
├── protocolo        (varchar 50)
├── data_autorizacao (datetime)
├── erros_json       (longtext)
├── xml_bruto        (longtext)
├── danfse_url       (varchar 500)
├── danfse_path      (varchar 500)
└── data_criacao     (datetime)
```

### Perfis e Permissões (seed)

| Perfil   | Permissões                                              |
|----------|---------------------------------------------------------|
| ADMIN    | Todas (8 módulos × 5 ações)                            |
| OPERADOR | Todas exceto USUARIOS/DELETE e CONFIG                  |
| AUDITOR  | VIEW apenas em DASHBOARD, NOTAS, VALIDACAO, LOGS       |

Admin padrão: `admin@nota.dev` / `Admin123!`

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
