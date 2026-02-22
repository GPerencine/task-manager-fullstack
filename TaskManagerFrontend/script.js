import { getTasks, createTask, deleteTask, updateTask } from "./services/api.js";

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
            li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" 
                    ${task.isCompleted ? 'checked' : ''} 
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
            isCompleted: false 
        });
        
        message.style.color = "green";
        message.innerText = "Tarefa adicionada!";
        
        // LIMPAR MENSAGEM: Some após 3 segundos
        setTimeout(() => {
            message.innerText = "";
        }, 3000);

        titleInput.value = "";
        descInput.value = "";
        loadTasks();
    } catch (error) {
        message.style.color = "red";
        message.innerText = "Erro ao salvar.";
    }
}

// NOVA FUNÇÃO: Alterna entre concluída e pendente
window.handleToggle = async (id, title, description, isChecked) => {
    try {
        await updateTask(id, { 
            id, 
            title, 
            description, 
            isCompleted: isChecked 
        });
        loadTasks(); // Recarrega para aplicar os estilos de riscado
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

loadTasks();