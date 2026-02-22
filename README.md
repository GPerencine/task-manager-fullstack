# 🗂️ Task Manager - Full Stack

Aplicação robusta de gerenciamento de tarefas que utiliza o poder do **.NET 8** no backend e a leveza do **JavaScript Vanilla** no frontend. 

O projeto demonstra a implementação de um CRUD completo, comunicação assíncrona entre domínios diferentes (CORS) e deploy containerizado.

---

## 🚀 Demonstração

- **Frontend (Vercel):** https://task-manager-fullstack-nu-neon.vercel.app/
- **Backend (Render):** https://task-manager-fullstack-tcui.onrender.com/tasks

---

## 🛠️ Tecnologias e Ferramentas

### **Backend**
* **C# / .NET 8:** Minimal APIs para alta performance.
* **Entity Framework Core:** ORM para manipulação do banco de dados.
* **SQLite:** Banco de dados relacional leve.
* **Swagger:** Documentação automática da API.
* **Docker:** Containerização para garantir consistência entre ambientes.

### **Frontend**
* **JavaScript (ES6+):** Manipulação de DOM e consumo de API (Fetch).
* **HTML5 / CSS3:** Interface responsiva com foco em UX moderna (Design Clean).

---

## 🧠 Arquitetura e Soluções Técnicas

### **Comunicação Cross-Origin (CORS)**
Implementada política de CORS no middleware do ASP.NET para permitir que o frontend hospedado na Vercel consumisse os recursos da API no Render de forma segura.

### **Persistência de Dados**
Uso do SQLite em ambiente de container no Render, utilizando o diretório `/tmp` para persistência temporária do arquivo `.db`.

### **Interface Reativa**
O frontend foi estruturado como um módulo JavaScript, garantindo que as funções de criação, deleção e alteração de status (`isCompleted`) reflitam instantaneamente na UI e no banco de dados.

---

## 📡 API Endpoints

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/tasks` | Lista todas as tarefas |
| `POST` | `/tasks` | Cria uma nova tarefa |
| `PUT` | `/tasks/{id}` | Atualiza status (concluído/pendente) |
| `DELETE` | `/tasks/{id}` | Remove uma tarefa |