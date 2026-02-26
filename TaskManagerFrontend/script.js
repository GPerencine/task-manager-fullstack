// ATENÇÃO: Verifique se o import do supabase no index.html está ANTES deste script
const SUPABASE_URL = "https://jizivavecvnsnobzbikr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppeml2YXZlY3Zuc25vYnpiaWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzU0MDAsImV4cCI6MjA4NzcxMTQwMH0.wVXxXrh9733U-_gvedXDCKkcHaAMDdLnZXmlFGjkchA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";

// BOTAO ADICIONAR TAREFA
window.handleSave = async () => {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("description").value;
    
    const task = {
        title: title,
        description: desc,
        isCompleted: false,
        userId: currentUser.id // Pega do login do Supabase
    };

    try {
        const res = await fetch(`${apiUrl}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)
        });
        if (res.ok) {
            document.getElementById("title").value = "";
            loadTasks();
        } else {
            alert("Erro 500 no servidor C#");
        }
    } catch (e) {
        alert("Servidor offline");
    }
};

const authContainer = document.getElementById("auth-container");
const todoContainer = document.getElementById("todo-container");
let currentUser = null;

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        authContainer.style.display = "none";
        todoContainer.style.display = "block";
        loadTasks();
    } else {
        authContainer.style.display = "block";
        todoContainer.style.display = "none";
    }
}

// BOTAO ENTRAR
document.getElementById("btnLogin").onclick = async function() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ 
        email: `${user.trim()}@task.com`, 
        password: pass 
    });
    if (error) alert("Erro ao entrar: " + error.message);
    else checkUser();
};

// BOTAO CADASTRAR
document.getElementById("btnSignUp").onclick = async function() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const { error } = await supabase.auth.signUp({ 
        email: `${user.trim()}@task.com`, 
        password: pass 
    });
    if (error) alert("Erro ao cadastrar: " + error.message);
    else alert("Cadastrado! Agora clique em Entrar.");
};

async function loadTasks() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${apiUrl}/tasks/${currentUser.id}`);
        if (!res.ok) throw new Error();
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (e) {
        document.getElementById("message").innerText = "Servidor C# acordando...";
    }
}

function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = tasks.map(t => `<li>${t.title}</li>`).join('');
}

checkUser();