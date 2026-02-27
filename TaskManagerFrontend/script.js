const SUPABASE_URL = "https://jizivavecvnsnobzbikr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppeml2YXZlY3Zuc25vYnpiaWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzU0MDAsImV4cCI6MjA4NzcxMTQwMH0.wVXxXrh9733U-_gvedXDCKkcHaAMDdLnZXmlFGjkchA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false } // F5 desloga
});

const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";
let currentUser = null;

// --- DARK MODE ---
const btnTheme = document.getElementById("btnTheme");
btnTheme.onclick = () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    btnTheme.innerText = theme === "dark" ? "☀️" : "🌙";
};

// --- AUTH ---
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("todo-container").style.display = "block";
        document.getElementById("btnLogout").style.display = "block";
        loadTasks();
    } else {
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("todo-container").style.display = "none";
        document.getElementById("btnLogout").style.display = "none";
    }
}

document.getElementById("btnLogin").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ 
        email: `${user.trim()}@task.com`, 
        password: pass 
    });
    if (error) alert(error.message); else checkUser();
};

document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const { error } = await supabase.auth.signUp({ 
        email: `${user.trim()}@task.com`, 
        password: pass 
    });
    if (error) alert(error.message); else alert("Cadastrado! Clique em Entrar.");
};

document.getElementById("btnLogout").onclick = async () => {
    await supabase.auth.signOut();
    location.reload();
};

// --- TASKS ---
document.getElementById("btnSave").onclick = async () => {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("description").value;
    if(!title) return;

    const task = { 
        title: title, 
        description: desc, 
        isCompleted: false, 
        userId: currentUser.id 
    };

    try {
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
    } catch (e) { alert("Erro ao conectar ao Backend C# na Render"); }
};

async function loadTasks() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${apiUrl}/tasks/${currentUser.id}`);
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (e) { console.error("Erro ao carregar"); }
}

function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = tasks.map(t => `
        <li class="task-item ${t.isCompleted ? 'completed' : ''}">
            <strong>${t.title}</strong>
            <p>${t.description || ''}</p>
        </li>
    `).join('');
}

checkUser();