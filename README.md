# Inventário de Toners (Supabase + Vercel)

Sistema moderno de controle de estoque de toners com PostgreSQL via **Supabase** e API Serverless para **Vercel**.

---

## 📁 Estrutura do projeto

```
toner/
├── api/
│   ├── modelos.js          → GET /api/modelos  |  POST /api/modelos
│   ├── modelos/[id].js     → DELETE /api/modelos/:id
│   ├── movimentacoes.js    → GET /api/movimentacoes?modeloId=X  |  POST /api/movimentacoes
│   └── movimentacoes/[id].js → DELETE /api/movimentacoes/:id
├── lib/
│   └── db.js               ← Adaptador do Supabase (@supabase/supabase-js)
├── public/
│   └── index.html          → Frontend moderno integrado à API
├── schema.sql              ← Script de criação das tabelas no Supabase
├── .env.example            ← Exemplo de variáveis de ambiente
├── package.json
└── vercel.json
```

---

## 🛠️ Passo a Passo para Configurar o Supabase

### 1. Criar as Tabelas no Supabase
1. Acesse o dashboard do seu projeto no [Supabase](https://supabase.com/dashboard).
2. No menu lateral esquerdo, clique em **SQL Editor**.
3. Abra o arquivo [`schema.sql`](./schema.sql) deste projeto, copie todo o conteúdo e cole no editor do Supabase.
4. Clique no botão **RUN** (verde). Suas tabelas `modelos` e `movimentacoes` estarão criadas com dados iniciais!

### 2. Obter as Chaves de Conexão
1. No menu lateral esquerdo do Supabase, clique em **Project Settings** (ícone de engrenagem) e depois em **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon / public** ou **service_role** key

### 3. Configurar as Variáveis de Ambiente no Projeto
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-ou-service-role-aqui
```

---

## 🚀 Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor local
npm run dev
```

Acesse: **http://localhost:3000**

---

## ☁️ Deploy na Vercel

```bash
# Deploy
npx vercel --prod
```

> **Importante no Deploy da Vercel:**  
> No painel da Vercel (ou via CLI), adicione as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_KEY` em **Settings -> Environment Variables**.