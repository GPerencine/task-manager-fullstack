import { getTasks, createTask, deleteTask, updateTask } from "./services/api.js";

// Configuração do Supabase
const SUPABASE_URL = "https://cvdmiikzeyzcmlhgoxdv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZG1paWt6ZXl6Y21saGdveGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTA1MjMsImV4cCI6MjA4NzUyNjUyM30.G7DpFo19wH7z5D68KwQPSCMIZQo199SBhNEews-ndVs";

// Inicialização
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos do DOM
const list = document.getElementById("taskList");
const message = document.getElementById("message");
const authContainer = document.getElementById("auth-container");
const todoContainer = document.getElementById("todo-container");
const btnLogout = document.getElementById("btnLogout");
const btnTheme = document.getElementById("btnTheme");

let currentUser = null;

// --- MODO DARK/LIGHT ---
btnTheme.onclick = () => {
    const doc = document.documentElement;
    const currentTheme = doc.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    doc.setAttribute("data-theme", newTheme);
    btnTheme.innerText = newTheme === "dark" ? "☀️" : "🌓";
};

// --- CONTROLE DE SESSÃO ---
async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
        currentUser = data.user;
        authContainer.style.display = "none";
        todoContainer.style.display = "block";
        btnLogout.style.display = "block";
        loadTasks();
    } else {
        authContainer.style.display = "block";
        todoContainer.style.display = "none";
        btnLogout.style.display = "none";
    }
}

// --- LOGIN E CADASTRO (VIA NOME DE USUÁRIO) ---
document.getElementById("btnLogin").onclick = async () => {
    message.innerText = "Acordando servidor... aguarde.";
    const user = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (!user || !password) return alert("Preencha todos os campos");
    
    const fakeEmail = `${user.trim().toLowerCase()}@task.com`;
    const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    
    if (error) alert("Usuário ou senha incorretos.");
    else checkUser();
};

document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (!user || password.length < 6) return alert("Usuário é obrigatório e a senha deve ter 6+ caracteres");

    const fakeEmail = `${user.trim().toLowerCase()}@task.com`;
    const { error } = await supabase.auth.signUp({ email: fakeEmail, password });
    
    if (error) alert(error.message);
    else alert("Cadastro realizado! Tente entrar.");
};

btnLogout.onclick = async () => {
    await supabase.auth.signOut();
    location.reload();
};

// --- GESTÃO DE TAREFAS ---
async function loadTasks() {
    if (!currentUser) return;
    try {
        const tasks = await getTasks(currentUser.id);
        list.innerHTML = "";
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.isCompleted ? 'checked' : ''} 
                    onchange="handleToggle(${task.id}, '${task.title}', '${task.description}', this.checked)">
                <div class="task-info-wrapper">
                    <strong>${task.title}</strong>
                    <span>${task.description || ''}</span>
                </div>
                <button class="btn-delete" onclick="handleDelete(${task.id})">Excluir</button>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        message.innerText = "Erro ao carregar tarefas.";
    }
}

async function handleSave() {
    const titleInput = document.getElementById("title");
    const descInput = document.getElementById("description");

    if (!titleInput.value) return;

    try {
        await createTask({ 
            title: titleInput.value, 
            description: descInput.value, 
            isCompleted: false,
            userId: currentUser.id 
        });
        titleInput.value = "";
        descInput.value = "";
        loadTasks();
    } catch (error) {
        message.innerText = "Erro ao salvar.";
    }
}

// Funções globais para os eventos do HTML
window.handleToggle = async (id, title, description, isChecked) => {
    try {
        await updateTask(id, { id, title, description, isCompleted: isChecked, userId: currentUser.id });
        loadTasks();
    } catch (error) { alert("Erro ao atualizar."); }
};

window.handleDelete = async (id) => {
    if (!confirm("Excluir tarefa?")) return;
    try {
        await deleteTask(id);
        loadTasks();
    } catch (error) { alert("Erro ao excluir."); }
};

document.getElementById("btnSave").onclick = handleSave;
checkUser();

// Acorda o backend na Render assim que o site abre
fetch("https://task-manager-fullstack-tcui.onrender.com/tasks").catch(() => {});