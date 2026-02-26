import { getTasks, createTask, deleteTask, updateTask } from "./services/api.js";

const SUPABASE_URL = "https://cvdmiikzeyzcmlhgoxdv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZG1paWt6ZXl6Y21saGdveGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTA1MjMsImV4cCI6MjA4NzUyNjUyM30.G7DpFo19wH7z5D68KwQPSCMIZQo199SBhNEews-ndVs";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const list = document.getElementById("taskList");
const message = document.getElementById("message");
const authContainer = document.getElementById("auth-container");
const todoContainer = document.getElementById("todo-container");
let currentUser = null;

// --- SESSÃO ---
async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
        currentUser = data.user;
        authContainer.style.display = "none";
        todoContainer.style.display = "block";
        loadTasks(); // Só carrega se estiver logado
    } else {
        authContainer.style.display = "block";
        todoContainer.style.display = "none";
    }
}

// --- TAREFAS ---
async function loadTasks() {
    if (!currentUser) return;
    try {
        const tasks = await getTasks(currentUser.id);
        list.innerHTML = tasks.map(task => `
            <li class="task-item ${task.isCompleted ? 'completed' : ''}">
                <input type="checkbox" ${task.isCompleted ? 'checked' : ''} 
                    onchange="window.handleToggle(${task.id}, '${task.title}', '${task.description || ''}', this.checked)">
                <div class="task-info-wrapper">
                    <strong>${task.title}</strong>
                    <span>${task.description || ''}</span>
                </div>
                <button onclick="window.handleDelete(${task.id})">Excluir</button>
            </li>
        `).join('');
        message.innerText = "";
    } catch (e) { message.innerText = "Servidor acordando..."; }
}

window.handleSave = async () => {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("description").value;
    if (!title) return;
    try {
        await createTask({ title, description: desc, isCompleted: false, userId: currentUser.id });
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        loadTasks();
    } catch (e) { message.innerText = "Erro ao salvar."; }
};

window.handleToggle = async (id, title, description, isCompleted) => {
    await updateTask(id, { id, title, description, isCompleted, userId: currentUser.id });
    loadTasks();
};

window.handleDelete = async (id) => {
    if (confirm("Excluir?")) { await deleteTask(id); loadTasks(); }
};

// --- AUTH ---
document.getElementById("btnLogin").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email: `${user}@task.com`, password: pass });
    if (error) alert("Erro no login"); else checkUser();
};

document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const { error } = await supabase.auth.signUp({ email: `${user}@task.com`, password: pass });
    if (error) alert(error.message); else alert("Cadastrado! Faça login.");
};

document.getElementById("btnLogout").onclick = async () => { await supabase.auth.signOut(); location.reload(); };
document.getElementById("btnSave").onclick = window.handleSave;

checkUser();