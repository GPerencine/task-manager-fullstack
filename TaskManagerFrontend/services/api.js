let apiUrl = "http://localhost:5000/api";

if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    apiUrl = "https://task-manager-fullstack-tcui.onrender.com";
}

export async function loadConfig() {
    try {
        const response = await fetch('/config.json');
        if (response.ok) {
            const config = await response.json();
            if (config.apiUrl) apiUrl = config.apiUrl;
        }
    } catch (e) {
        console.warn("Utilizando a URL da API padrão:", apiUrl);
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function getTasks(userId) {
    const response = await fetch(`${apiUrl}/tarefas/usuario/${userId}`, {
        headers: { ...getAuthHeaders() }
    }); 
    return await response.json();
}

export async function createTask(task) {
    return await fetch(`${apiUrl}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(task)
    });
}

export async function updateTask(id, task) {
    return await fetch(`${apiUrl}/tarefas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(task)
    });
}

export async function deleteTask(id) {
    return await fetch(`${apiUrl}/tarefas/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() }
    });
}