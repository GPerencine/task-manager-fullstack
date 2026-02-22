const apiUrl = "https://task-manager-fullstack-tcui.onrender.com//tasks";

import { getTasks, createTask, deleteTask } from "./services/api.js";
import { renderTask } from "./components/task.js";

async function loadTasks(filter = "all") {
    const response = await fetch(`${apiUrl}`);
    const tasks = await response.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    let filteredTasks = tasks;

    if (filter === "completed") {
        filteredTasks = tasks.filter(t => t.isCompleted);
    }

    if (filter === "pending") {
        filteredTasks = tasks.filter(t => !t.isCompleted);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${task.title}</strong> - ${task.description}
            ${task.isCompleted ? "✅" : ""}
            <button onclick="deleteTask(${task.id})">Excluir</button>
        `;

        list.appendChild(li);
    });
}

async function createTask() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    const loading = document.getElementById("loading");
    const message = document.getElementById("message");

    loading.style.display = "block";
    message.innerText = "";

    try {
        const response = await fetch(`${apiUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                isCompleted: false
            })
        });

        if (!response.ok) throw new Error("Erro ao salvar");

        message.innerText = "Tarefa criada com sucesso!";
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        loadTasks();

    } catch (error) {
        message.innerText = "Erro ao salvar tarefa.";
    } finally {
        loading.style.display = "none";
    }
}

async function deleteTask(id) {
    const confirmDelete = confirm("Tem certeza que deseja deletar esta tarefa?");
    if (!confirmDelete) return;

    await fetch(`${apiUrl}/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

loadTasks();