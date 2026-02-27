const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";
let currentUser = null;
let tasksLocal = [];

// --- TEMA ---
document.getElementById("btnTheme").onclick = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    document.getElementById("btnTheme").innerText = isDark ? "🌙" : "☀️";
};

// --- AUTH ---
document.getElementById("btnLogin").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("btnLogin");
    
    btn.innerText = "Entrando...";
    try {
        const res = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        if (res.ok) {
            currentUser = await res.json();
            document.getElementById("auth-container").style.display = "none";
            document.getElementById("todo-container").style.display = "block";
            loadTasks();
        } else alert("Erro no login");
    } finally { btn.innerText = "Entrar"; }
};

document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
    });
    alert("Cadastrado!");
};

// --- TAREFAS ---
async function loadTasks() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${apiUrl}/tasks/${currentUser.id}`);
        tasksLocal = await res.json();
        renderTasks(tasksLocal);
    } catch (e) { console.error("Erro ao carregar"); }
}

function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = tasks.map(t => `
        <li class="task-item ${t.isCompleted ? 'completed' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <span onclick="toggleTask(${t.id})" style="cursor: pointer; font-size: 1.2rem;">
                    ${t.isCompleted ? '✅' : '⭕'}
                </span>
                <div>
                    <strong>${t.title}</strong>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-sub);">${t.description || ''}</p>
                </div>
            </div>
            <button onclick="deleteTask(${t.id})" class="btn-danger" style="background: var(--danger); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Excluir</button>
        </li>
    `).join('');
}

document.getElementById("btnSave").onclick = async () => {
    const titleInp = document.getElementById("title");
    const descInp = document.getElementById("description");
    if (!titleInp.value) return;

    const newTask = { 
        id: Date.now(), 
        title: titleInp.value, 
        description: descInp.value, 
        isCompleted: false, 
        userId: currentUser.id 
    };

    // UI Instantânea
    tasksLocal.push(newTask);
    renderTasks([...tasksLocal]);

    const t = titleInp.value;
    const d = descInp.value;
    titleInp.value = ""; descInp.value = "";

    const res = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, description: d, isCompleted: false, userId: currentUser.id })
    });

    if (res.ok) await loadTasks(); // Sincroniza ID real do Neon
};

window.toggleTask = async (id) => {
    const task = tasksLocal.find(t => t.id === id);
    if (!task) return;

    task.isCompleted = !task.isCompleted;
    renderTasks([...tasksLocal]);

    await fetch(`${apiUrl}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: task.isCompleted })
    });
};

window.deleteTask = async (id) => {
    // Restaurada a confirmação
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    // UI Instantânea
    tasksLocal = tasksLocal.filter(t => t.id !== id);
    renderTasks([...tasksLocal]);

    await fetch(`${apiUrl}/tasks/${id}`, { method: "DELETE" });
};

document.getElementById("btnLogout").onclick = () => location.reload();