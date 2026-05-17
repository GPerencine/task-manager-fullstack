const apiUrl = globalThis.location.hostname === "localhost" || globalThis.location.hostname === "127.0.0.1"
    ? "http://localhost:5087"
    : "https://taskmanagerneon.up.railway.app";

let currentUser = null;
let tasksLocal = [];

// --- TRATAMENTO DE MENSAGENS E ERROS ---
function showMessage(text, type = "error") {
    const msgDiv = document.getElementById("message");
    if (!msgDiv) return;

    msgDiv.innerText = text;
    msgDiv.style.display = "block";
    msgDiv.style.padding = "12px";
    msgDiv.style.borderRadius = "12px";
    msgDiv.style.marginBottom = "20px";
    msgDiv.style.textAlign = "center";
    msgDiv.style.fontWeight = "600";
    msgDiv.style.fontSize = "0.9rem";
    msgDiv.style.transition = "all 0.3s ease";

    if (type === "success") {
        msgDiv.style.color = "#15803d";
        msgDiv.style.backgroundColor = "#dcfce7";
    } else {
        msgDiv.style.color = "var(--danger-text)";
        msgDiv.style.backgroundColor = "var(--danger-bg)";
    }

    setTimeout(() => {
        msgDiv.style.display = "none";
        msgDiv.innerText = "";
    }, 5000);
}

function handleError(message, error) {
    console.error(message, error);
    showMessage(message, "error");
}

// --- TEMA ---
document.getElementById("btnTheme").onclick = () => {
    const html = document.documentElement;
    const isDark = html.dataset.theme === "dark";
    html.dataset.theme = isDark ? "light" : "dark";
    document.getElementById("btnTheme").innerText = isDark ? "🌙" : "☀️";
};

// --- AUTH ---
document.getElementById("btnLogin").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (!user || !pass) {
        handleError("Nome de usuário e senha são obrigatórios.", new Error("Missing credentials"));
        return;
    }

    // Transição visual instantânea
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("todo-container").style.display = "block";
    document.getElementById("btnLogout").style.display = "block";

    try {
        const res = await fetch(`${apiUrl}/api/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });

        if (res.ok) {
            currentUser = await res.json();
            await loadTasks(); // Carrega as tarefas após o login confirmado
        } else {
            document.getElementById("auth-container").style.display = "block";
            document.getElementById("todo-container").style.display = "none";
            document.getElementById("btnLogout").style.display = "none";
            handleError("Login falhou. Verifique seu usuário e senha.", new Error("Auth failed: " + res.status));
        }
    } catch (e) {
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("todo-container").style.display = "none";
        document.getElementById("btnLogout").style.display = "none";
        handleError("Erro na conexão com o servidor.", e);
    }
};

document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (!user || !pass) {
        handleError("Nome de usuário e senha são obrigatórios para cadastro.", new Error("Missing credentials"));
        return;
    }

    try {
        const res = await fetch(`${apiUrl}/api/usuarios/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        if (res.ok) {
            showMessage("Cadastrado com sucesso! Agora clique em Entrar.", "success");
        } else {
            const errorText = await res.text();
            handleError(`Erro ao cadastrar: ${errorText || 'Usuário já existe.'}`, new Error("Registration failed: " + res.status));
        }
    } catch (e) {
        handleError("Erro de conexão ao cadastrar usuário.", e);
    }
};

// BOTAO SAIR (LOGOUT)
document.getElementById("btnLogout").onclick = () => {
    currentUser = null;
    location.reload(); // Recarrega para limpar estado e voltar ao login
};

// --- TAREFAS ---
async function loadTasks() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${apiUrl}/api/tarefas/usuario/${currentUser.id}`);
        if (res.ok) {
            tasksLocal = await res.json();
            renderTasks(tasksLocal);
        } else {
            handleError("Não foi possível carregar as tarefas.", new Error("Fetch tasks failed: " + res.status));
        }
    } catch (e) {
        handleError("Erro de rede ao carregar tarefas.", e);
    }
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
            <button onclick="deleteTask(${t.id})" class="btn-danger">Excluir</button>
        </li>
    `).join('');
}

document.getElementById("btnSave").onclick = async () => {
    const titleInp = document.getElementById("title");
    const descInp = document.getElementById("description");
    if (!titleInp.value.trim()) {
        handleError("O título da tarefa não pode estar vazio.", new Error("Empty title"));
        return;
    }

    const t = titleInp.value;
    const d = descInp.value;
    titleInp.value = "";
    descInp.value = "";

    try {
        const res = await fetch(`${apiUrl}/api/tarefas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: t, description: d, isCompleted: false, userId: currentUser.id })
        });

        if (res.ok) {
            await loadTasks();
        } else {
            const errorText = await res.text();
            handleError(`Erro ao salvar tarefa: ${errorText || 'Dados inválidos.'}`, new Error("Save task failed: " + res.status));
        }
    } catch (e) {
        handleError("Erro de rede ao salvar tarefa.", e);
    }
};

globalThis.toggleTask = async (id) => {
    const task = tasksLocal.find(t => t.id === id);
    if (!task) return;

    // Atualização otimista
    const originalState = task.isCompleted;
    task.isCompleted = !task.isCompleted;
    renderTasks([...tasksLocal]);

    try {
        const res = await fetch(`${apiUrl}/api/tarefas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: task.title,
                description: task.description,
                isCompleted: task.isCompleted,
                userId: currentUser.id
            })
        });

        if (!res.ok) {
            task.isCompleted = originalState;
            renderTasks([...tasksLocal]);
            handleError("Erro ao atualizar tarefa no servidor.", new Error("Update task failed: " + res.status));
        }
    } catch (e) {
        task.isCompleted = originalState;
        renderTasks([...tasksLocal]);
        handleError("Erro de rede ao atualizar tarefa.", e);
    }
};

globalThis.deleteTask = async (id) => {
    if (!confirm("Deseja excluir esta tarefa?")) return;

    // Atualização otimista
    const originalTasks = [...tasksLocal];
    tasksLocal = tasksLocal.filter(t => t.id !== id);
    renderTasks([...tasksLocal]);

    try {
        const res = await fetch(`${apiUrl}/api/tarefas/${id}`, { method: "DELETE" });
        if (!res.ok) {
            tasksLocal = originalTasks;
            renderTasks([...tasksLocal]);
            handleError("Erro ao excluir tarefa no servidor.", new Error("Delete task failed: " + res.status));
        }
    } catch (e) {
        tasksLocal = originalTasks;
        renderTasks([...tasksLocal]);
        handleError("Erro de rede ao excluir tarefa.", e);
    }
};