const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";
let currentUser = null;
let tasksLocal = []; // Cache local para rapidez total

// --- AUXILIARES ---
function renderTasks(tasks) {
    tasksLocal = tasks; 
    const list = document.getElementById("taskList");
    list.innerHTML = tasks.map(t => `
        <li class="task-item ${t.isCompleted ? 'completed' : ''}" id="task-${t.id}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <span onclick="toggleTask(${t.id})" style="cursor: pointer; font-size: 1.2rem;">
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

// --- TEMA (Instantâneo) ---
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
    
    btn.innerText = "Entrando..."; // Feedback visual rápido
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

async function loadTasks() {
    const res = await fetch(`${apiUrl}/tasks/${currentUser.id}`);
    const tasks = await res.json();
    renderTasks(tasks);
}

// --- AÇÕES OTIMISTAS (RESPOSTA INSTANTÂNEA) ---

document.getElementById("btnSave").onclick = async () => {
    const titleInp = document.getElementById("title");
    const descInp = document.getElementById("description");
    if (!titleInp.value) return;

    // Criamos o objeto da tarefa
    const newTask = { 
        id: Date.now(), // ID temporário para a interface
        title: titleInp.value, 
        description: descInp.value, 
        isCompleted: false, 
        userId: currentUser.id 
    };

    // 1. Adiciona instantaneamente ao cache local e renderiza
    tasksLocal.push(newTask);
    renderTasks([...tasksLocal]);

    // Limpa os campos imediatamente
    const tValue = titleInp.value;
    const dValue = descInp.value;
    titleInp.value = ""; 
    descInp.value = "";

    try {
        // 2. Envia para o servidor
        const res = await fetch(`${apiUrl}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: tValue,
                description: dValue,
                isCompleted: false,
                userId: currentUser.id
            })
        });

        if (res.ok) {
            // 3. Só recarrega do banco APÓS o servidor confirmar o sucesso
            await loadTasks(); 
        }
    } catch (e) {
        // Se der erro, removemos a tarefa "falsa" e avisamos
        tasksLocal = tasksLocal.filter(t => t.id !== newTask.id);
        renderTasks(tasksLocal);
        alert("Erro ao salvar no servidor.");
    }
};

window.toggleTask = async (id) => {
    const task = tasksLocal.find(t => t.id === id);
    if (!task) return;

    // 1. Inverte na tela na hora
    task.isCompleted = !task.isCompleted;
    renderTasks(tasksLocal);

    // 2. Avisa o banco em segundo plano
    await fetch(`${apiUrl}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: task.isCompleted })
    });
};

window.deleteTask = async (id) => {
    // 1. Remove da tela na hora
    renderTasks(tasksLocal.filter(t => t.id !== id));

    // 2. Remove do banco
    await fetch(`${apiUrl}/tasks/${id}`, { method: "DELETE" });
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