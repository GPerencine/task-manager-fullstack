# 🗂️ Task Manager Pro - Full Stack

Uma aplicação de gerenciamento de tarefas de alta performance, construída com **.NET 8** no backend e uma interface **Vanilla** otimizada. O projeto centraliza autenticação e dados no **Neon PostgreSQL**, oferecendo uma experiência de usuário fluida e instantânea.

---

## 🚀 Demonstração

- **Deploy feitoo com Vercel:** https://task-manager-fullstack-nu-neon.vercel.app/

---

## 🛠️ Tecnologias e Ferramentas

### **Backend**
* **C# / .NET 8 (Minimal APIs):** Estrutura leve e de alta performance.
* **Entity Framework Core:** ORM para abstração e manipulação de dados.
* **PostgreSQL (Neon.tech):** Banco de dados relacional com Serverless storage e Connection Pooling.
* **Docker:** Containerização completa para deploy do Back End de forma escalável.

### **Frontend**
* **JavaScript (ES6+):** Implementação de **Atualização Otimista (Optimistic UI)** para respostas instantâneas.
* **HTML5 / CSS3:** Design moderno com suporte nativo a **Dark Mode**.
* **Fetch API:** Comunicação assíncrona robusta com tratamento de erros.

---

## 🧠 Diferenciais Técnicos

### **Arquitetura Unificada (Neon + C#)**
Diferente de implementações híbridas, este projeto centraliza a **Autenticação de Usuários** e a **Gestão de Tarefas** em um único banco de dados PostgreSQL (Neon). Isso reduz a latência e simplifica a manutenção do sistema.

### **Optimistic UI (Interface Instantânea)**
O frontend foi projetado para atualizar a interface antes mesmo da confirmação do servidor. Se uma tarefa é marcada como concluída ou excluída, a mudança é imediata para o usuário, enquanto a sincronização com o banco ocorre em segundo plano.

### **Persistência Serverless**
Utiliza o Neon para garantir que os dados sejam persistidos de forma segura e escalável, superando as limitações de bancos de dados locais (como SQLite) em ambientes de deploy efêmeros como o Render.

---

## 📡 API Endpoints

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/register` | Cadastra um novo usuário |
| `POST` | `/login` | Autentica usuário e retorna ID |
| `GET` | `/tasks/{userId}` | Lista tarefas de um usuário específico |
| `POST` | `/tasks` | Cria uma nova tarefa vinculada ao usuário |
| `PUT` | `/tasks/{id}` | Alterna o status de conclusão |
| `DELETE` | `/tasks/{id}` | Remove permanentemente uma tarefa |