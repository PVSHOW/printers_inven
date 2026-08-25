# 📦 Sistema de Inventário de Toners (TonerFlow)

Sistema moderno e completo para **gestão e controle de estoque de toners**, desenvolvido com arquitetura **Serverless**, banco de dados relacional **PostgreSQL (Supabase)** e deploy contínuo na **Vercel**.

🔗 **URL de Produção:** [https://printers-inven.vercel.app/](https://printers-inven.vercel.app/)

---

## 🛠️ Tecnologias Utilizadas

### 1. Frontend
* **HTML5 Semântico:** Estruturação limpa e acessível.
* **CSS3 Custom / Design System:**
  * Estética moderna inspirada em dashboards SaaS (*Slate, Indigo, Emerald, Rose e Amber*).
  * Design responsivo, sombras suaves, microinterações e transições fluidas.
  * Efeitos visuais modernos (*backdrop-filter / glassmorphism* no modal).
* **Tipografia:** Google Fonts — *Plus Jakarta Sans*.
* **Ícones:** Vetores SVG inline (estilo Lucide/Heroicons) de alta resolução.
* **JavaScript Puro (Vanilla ES6+):** Lógica assíncrona com `async/await`, consumo de APIs REST com `fetch`, manipulação de DOM e filtros reativos em tempo real.

### 2. Backend & Serverless API
* **Node.js (v18+):** Runtime das funções serverless.
* **Vercel Serverless Functions:** Rotas de API escaláveis sob demanda localizadas na pasta `/api` (`GET`, `POST`, `DELETE`).
* **CORS & Headers HTTP:** Configurados para comunicação segura entre cliente e servidor.

### 3. Banco de Dados & Armazenamento
* **Supabase (PostgreSQL 15):** Banco de dados relacional hospedado na nuvem.
* **@supabase/supabase-js:** SDK oficial para conexões e operações no banco de dados.
* **Integridade Relacional:** Tabela de movimentações vinculada aos modelos com `ON DELETE CASCADE`.
* **Dotenv:** Gerenciamento seguro de variáveis de ambiente locais.

### 4. Hospedagem & Versionamento
* **Vercel:** Hospedagem estática para o frontend e execução das Serverless Functions com suporte a CI/CD.
* **Git & GitHub:** Controle de versão com `.gitignore` para proteção de credenciais.

---

## 🏛️ Arquitetura do Projeto

```
toner/
├── api/                          # Endpoints Serverless (Vercel Functions)
│   ├── modelos.js                # GET (listar) / POST (criar) / DELETE (excluir) modelos
│   ├── modelos/[id].js           # DELETE /api/modelos/:id
│   ├── movimentacoes.js          # GET (listar) / POST (registrar) / DELETE movimentações
│   └── movimentacoes/[id].js     # DELETE /api/movimentacoes/:id
├── lib/
│   └── db.js                     # Camada de abstração e conexão com Supabase
├── public/                       # Frontend estático servido pela Vercel
│   └── index.html                # Aplicação cliente integrada à API
├── schema.sql                    # Script DDL do banco de dados (PostgreSQL)
├── .env.example                  # Template de variáveis de ambiente
├── .gitignore                    # Regras de exclusão do Git
├── package.json                  # Dependências e scripts do projeto
├── vercel.json                   # Configuração de deploy da Vercel
└── README.md                     # Documentação completa
```

---

## 🗄️ Modelo de Dados (PostgreSQL / Supabase)

### Tabela: `modelos`
Armazena os modelos de cartuchos e toners cadastrados.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `BIGINT` (PK) | Identificador único auto-incremental |
| `nome` | `TEXT` | Nome/código do modelo (Ex: HP CF217A) |
| `descricao` | `TEXT` | Compatibilidade/impressoras |
| `estoque_min`| `INTEGER` | Limite para disparo de alerta visual |
| `cor` | `TEXT` | Código hexadecimal para identificação visual |
| `created_at` | `TIMESTAMPTZ`| Data e hora de criação |

### Tabela: `movimentacoes`
Registra todo histórico de entradas e saídas de estoque.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `BIGINT` (PK) | Identificador único auto-incremental |
| `modelo_id` | `BIGINT` (FK) | Referência a `modelos(id)` com `ON DELETE CASCADE` |
| `tipo` | `TEXT` | `entrada` (+) ou `saida` (-) |
| `qty` | `INTEGER` | Quantidade movimentada (> 0) |
| `setor` | `TEXT` | Setor ou departamento de destino/origem |
| `resp` | `TEXT` | Nome do colaborador responsável |
| `data` | `DATE` | Data da movimentação |
| `obs` | `TEXT` | Observações (nota fiscal, motivo, chamado) |
| `created_at` | `TIMESTAMPTZ`| Data e hora do registro |

---

## 🚀 Funcionalidades Implementadas

1. **Painel de Controle (Dashboard):**
   - Contadores globais no cabeçalho (*Total de Modelos*, *Estoque Total*, *Alerta de Estoque Crítico*).
   - Indicadores visuais dinâmicos (*Estoque Seguro*, *Estoque Baixo*, *Sem Estoque*).
2. **Gestão de Modelos:**
   - Cadastro de novos modelos com personalização de cores e estoque mínimo.
   - Listagem com pesquisa instantânea por nome ou compatibilidade.
   - Exclusão com confirmação e cascata automática de movimentações.
3. **Controle de Movimentações:**
   - Registro simplificado de Entradas e Saídas via Modal interativo.
   - Validação automática de saldo disponível (impede saídas maiores que o estoque atual).
   - Histórico completo com filtros rápidos (*Todas*, *Apenas Entradas*, *Apenas Saídas*).
   - Avatares automáticos com as iniciais do responsável.
4. **Resiliência e Segurança:**
   - Proteção de credenciais via variáveis de ambiente (`.env`).
   - Fallback gracioso caso as variáveis de banco não estejam disponíveis.
   - Feedback instantâneo ao usuário através de notificações (*Toast*).

---

## 📡 Referência da API REST

### Modelos
* `GET /api/modelos` — Retorna todos os modelos e calcula o saldo atual de cada um.
* `POST /api/modelos` — Cria um novo modelo. Body: `{ "nome", "descricao", "estoqueMin", "cor" }`.
* `DELETE /api/modelos/:id` — Exclui um modelo e todas as suas movimentações.

### Movimentações
* `GET /api/movimentacoes?modeloId=:id` — Retorna o histórico de movimentações (geral ou filtrado por modelo).
* `POST /api/movimentacoes` — Registra entrada ou saída. Body: `{ "modeloId", "tipo", "qty", "setor", "resp", "obs" }`.
* `DELETE /api/movimentacoes/:id` — Exclui um registro específico de movimentação.

---

## 💻 Como Rodar Localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/toner-inventory.git
cd toner-inventory

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com sua SUPABASE_URL e SUPABASE_KEY

# 4. Executar em modo de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**