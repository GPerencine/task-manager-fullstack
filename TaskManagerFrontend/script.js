const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";
let currentUser = null;

// --- LOGIN ---
document.getElementById("btnLogin").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
    });

    if (res.ok) {
        currentUser = await res.json();
        showApp();
    } else alert("Login inválido!");
};

// --- CADASTRO ---
document.getElementById("btnSignUp").onclick = async () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
    });

    if (res.ok) alert("Cadastrado! Agora faça login.");
    else alert("Erro ao cadastrar.");
};

function showApp() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("todo-container").style.display = "block";
    loadTasks();
}

// ... (Mantenha as funções loadTasks, toggleTask e deleteTask usando o NOVO currentUser.id)