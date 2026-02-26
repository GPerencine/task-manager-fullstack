const apiUrl = "https://task-manager-fullstack-tcui.onrender.com";

export async function getTasks(userId) {
    // Agora enviamos o userId na URL para o filtro do C#
    const response = await fetch(`${apiUrl}/tasks/${userId}`); 
    return await response.json();
}

export async function createTask(task) {
    return await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
}

export async function updateTask(id, task) {
    return await fetch(`${apiUrl}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
}

export async function deleteTask(id) {
    return await fetch(`${apiUrl}/tasks/${id}`, {
        method: "DELETE"
    });
}