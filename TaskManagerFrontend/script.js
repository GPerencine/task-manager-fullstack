import { getTasks, createTask, deleteTask, updateTask } from "./services/api.js";

// Configuração do Supabase 
const SUPABASE_URL = "https://cvdmiikzeyzcmlhgoxdv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZG1paWt6ZXl6Y21saGdveGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTA1MjMsImV4cCI6MjA4NzUyNjUyM30.G7DpFo19wH7z5D68KwQPSCMIZQo199SBhNEews-ndVs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const list = document.getElementById("taskList");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const authContainer = document.getElementById("auth-container");
const todoContainer = document.getElementById("todo-container");
const btnLogout = document.getElementById("btnLogout");

let currentUser = null;

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

// --- LOGIN E CADASTRO ---
document.getElementById("btnLogin").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else checkUser();
};

document.getElementById("btnSignUp").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Verifique seu e-mail para confirmar o cadastro!");
    else alert("Cadastro realizado!");
};

btnLogout.onclick = async () => {
    await supabase.auth.signOut();
    location.reload();
};

// --- TAREFAS ---
async function loadTasks() {
    if (!currentUser) return;
    loading.style.display = "block";
    try {
        const tasks = await getTasks(currentUser.id); // Passa o ID do usuário
        list.innerHTML = "";
        
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.isCompleted ? 'checked' : ''} 
                    onchange="handleToggle(${task.id}, '${task.title}', '${task.description}', this.checked)">
                <div class="task-info-wrapper">
                    <strong>${task.title}</strong>
                    <span>${task.description || 'Sem descrição'}</span>
                </div>
                <button class="btn-delete" onclick="handleDelete(${task.id})">Excluir</button>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        message.innerText = "Erro ao carregar tarefas.";
    } finally {
        loading.style.display = "none";
    }
}

async function handleSave() {
    const titleInput = document.getElementById("title");
    const descInput = document.getElementById("description");

    if (!titleInput.value) return alert("O título é obrigatório!");

    try {
        await createTask({ 
            title: titleInput.value, 
            description: descInput.value, 
            isCompleted: false,
            userId: currentUser.id // VINCULA AO USUÁRIO
        });
        
        message.style.color = "green";
        message.innerText = "Tarefa adicionada!";
        setTimeout(() => message.innerText = "", 3000);

        titleInput.value = "";
        descInput.value = "";
        loadTasks();
    } catch (error) {
        message.style.color = "red";
        message.innerText = "Erro ao salvar.";
    }
}

window.handleToggle = async (id, title, description, isChecked) => {
    try {
        await updateTask(id, { id, title, description, isCompleted: isChecked, userId: currentUser.id });
        loadTasks();
    } catch (error) {
        alert("Erro ao atualizar tarefa.");
    }
};

window.handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta tarefa?")) return;
    try {
        await deleteTask(id);
        loadTasks();
    } catch (error) {
        alert("Erro ao excluir.");
    }
};

document.getElementById("btnSave").addEventListener("click", handleSave);
checkUser();