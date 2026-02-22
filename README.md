# 🗂️ Task Manager - Full Stack (.NET 8 + JavaScript)

Aplicação Full Stack para gerenciamento de tarefas, desenvolvida com .NET 8 no backend e JavaScript puro no frontend.

O projeto permite criar, listar, atualizar e remover tarefas, com persistência em banco de dados SQLite e integração completa via API REST.

---
🧩 Tecnologias Utilizadas

C#

ASP.NET Core

Entity Framework Core

SQLite

HTML

CSS

JavaScript

Docker

Render

Vercel

🎯 Objetivo do Projeto

Projeto desenvolvido com foco em:

Prática de desenvolvimento Full Stack

Integração Frontend ↔ Backend

Deploy em ambiente real

Construção de portfólio profissional
## 🧠 Arquitetura

O projeto é dividido em duas partes:

### 🔹 Backend (API REST)
- .NET 8 Minimal API
- Entity Framework Core
- SQLite
- Swagger
- CORS configurado
- Deploy via Docker no Render

### 🔹 Frontend
- HTML5
- CSS3
- JavaScript 
- Consumo da API via Fetch
- Deploy na Vercel

---

## 🚀 Funcionalidades

- ✅ Criar nova tarefa  
- 📋 Listar tarefas  
- ✏️ Atualizar tarefa  
- ❌ Deletar tarefa  
- 🔎 Filtrar por concluídas / pendentes  
- ⏳ Loading e feedback visual  
- 🌐 Integração real com API em produção  

---

## 📡 Endpoints da API

Base URL: https://task-manager-fullstack-tcui.onrender.com

Caso apareça qualquer coisa diferente de 'API Running',
a API não estará funcionando.

| Método | Endpoint        | Descrição |
|--------|-----------------|------------|
| GET    | /tasks          | Lista todas as tarefas |
| GET    | /tasks/{id}     | Busca tarefa por ID |
| POST   | /tasks          | Cria nova tarefa |
| PUT    | /tasks/{id}     | Atualiza tarefa |
| DELETE | /tasks/{id}     | Remove tarefa |

---

## 🗄️ Banco de Dados

- SQLite
- Criação automática com `Database.EnsureCreated()`
- Armazenamento em ambiente Linux via `/tmp/tasks.db` (Render)

---

## 🐳 Deploy

### 🔹 Backend (Render)
- Container Docker
- .NET 8
- API em produção

👉 Backend:  https://task-manager-fullstack-tcui.onrender.com/tasks


---

### 🔹 Frontend (Vercel)

👉 Frontend:  https://task-manager-fullstack-nu-neon.vercel.app/
