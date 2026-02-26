// Configuração do Supabase
const SUPABASE_URL = "https://jizivavecvnsnobzbikr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppeml2YXZlY3Zuc25vYnpiaWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzU0MDAsImV4cCI6MjA4NzcxMTQwMH0.wVXxXrh9733U-_gvedXDCKkcHaAMDdLnZXmlFGjkchA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos
const list = document.getElementById("taskList");
const authContainer = document.getElementById("auth-container");
const todoContainer = document.getElementById("todo-container");
const btnLogout = document.getElementById("btnLogout");
let currentUser = null;

// --- CONTROLE DE SESSÃO ---
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        authContainer.style.display = "none";
        todoContainer.style.display = "block";
        btnLogout.style.display = "block";
        loadTasks();
    } else {
        currentUser = null;
        authContainer.style.display = "block";
        todoContainer.style.display = "none";
        btnLogout.style.display = "none";
    }
}

// --- GESTÃO DE TAREFAS (DIRETO NO SUPABASE) ---
async function loadTasks() {
    if (!currentUser) return;
    // Busca na tabela "Tasks" do Supabase
    const { data, error } = await supabase
        .from('Tasks')
        .select('*')
        .eq('UserId', currentUser.id)
        .order('Id', { ascending: true });

    if (error) return console.error(error);

    list.innerHTML = data.map(task => `
        <li class="task-item ${task.IsCompleted ? 'completed' : ''}">
            <input type="checkbox" ${task.IsCompleted ? 'checked' : ''} 
                onchange="handleToggle(${task.Id}, this.checked)">
            <div class="task-info-wrapper">
                <strong>${task.Title}</strong>
                <span>${task.Description || ''}</span>
            </div>
            <button class="btn-delete" onclick="handleDelete(${task.Id})">Excluir</button>
        </li>
    `).join('');
}

window.handleSave = async () => {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("description").value;
    if (!title) return;

    const { error } = await supabase
        .from('Tasks')
        .insert([{ Title: title, Description: desc, IsCompleted: false, UserId: currentUser.id }]);

    if (!error) {
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        loadTasks();
    }
};

window.handleToggle = async (id, isCompleted) => {
    await supabase.from('Tasks').update({ IsCompleted: isCompleted }).eq('Id', id);
    loadTasks();
};

window.handleDelete = async (id)