import { getTasks, createTask, deleteTask } from "./services/api.js";

const list = document.getElementById("taskList");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

async function loadTasks() {
    loading.style.display = "block";
    try {
        const tasks = await getTasks();
        list.innerHTML = "";
        
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="task-content">
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
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    if (!title) return alert("O título é obrigatório!");

    try {
        await createTask({ title, description, isCompleted: false });
        message.style.color = "green";
        message.innerText = "Tarefa adicionada!";
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        loadTasks();
    } catch (error) {
        message.style.color = "red";
        message.innerText = "Erro ao salvar.";
    }
}

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

// Inicializa
loadTasks();