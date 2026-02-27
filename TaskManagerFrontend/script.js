const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";
let currentUser = null;

// --- 1. FUNÇÕES DE SUPORTE (Devem vir primeiro) ---

async function loadTasks() {
    if (!currentUser) return;
    const msg = document.getElementById("message");
    msg.innerText = "Carregando tarefas...";
    
    try {
        const res = await fetch(`${apiUrl}/tasks/${currentUser.id}`);
        if (!res.ok) throw new Error();
        const tasks = await res.json();
        msg.innerText = "";
        renderTasks(tasks);
    } catch (e) { 
        msg.innerText = "Servidor acordando (aguarde 30s)...";
    }
}

function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = tasks.map(t => `
        <li class="task-item ${t.isCompleted ? 'completed' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <span onclick="toggleTask(${t.id}, ${t.isCompleted})" style="cursor: pointer; font-size: 1.2rem;">
                    ${t.isCompleted ? '✅' : '⭕'}
                </span>
                <div>
                    <strong>${t.title}</strong>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-sub);">${t.description || ''}</p>
                </div>
            </div>
            <button onclick="deleteTask(${t.id})" class="btn-danger">Excluir</button>
        </li>
    `).join('');
}

function showApp() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("todo-container").style.display = "block";
    loadTasks();
}

// --- 2. EVENTOS DE CLIQUE ---

// Dark Mode
document.getElementById("btnTheme").onclick = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    document.getElementById("btnTheme").innerText = isDark ? "🌙" : "☀️";
};

// Login
document.getElementById("btnLogin").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    try {
        const res = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });

        if (res.ok) {
            currentUser = await res.json();
            showApp();
        } else {
            alert("Usuário ou senha incorretos!");
        }
    } catch (e) { alert("Erro ao conectar com a API"); }
};

// Cadastro
document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
    });

    if (res.ok) alert("Cadastrado com sucesso!");
    else alert("Erro ao cadastrar.");
};

// Adicionar Tarefa
document.getElementById("btnSave").onclick = async () => {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("description").value;
    if (!title) return;

    const task = { 
        title, 
        description: desc, 
        isCompleted: false, 
        userId: currentUser.id 
    };

    const res = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    if (res.ok) {
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        loadTasks();
    }
};

// Logout
document.getElementById("btnLogout").onclick = () => location.reload();

// --- 3. TORNAR FUNÇÕES GLOBAIS (Para o onclick do HTML funcionar) ---
window.toggleTask = async (id, currentStatus) => {
    await fetch(`${apiUrl}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus })
    });
    loadTasks();
};

window.deleteTask = async (id) => {
    if (!confirm("Excluir tarefa?")) return;
    await fetch(`${apiUrl}/tasks/${id}`, { method: "DELETE" });
    loadTasks();
};