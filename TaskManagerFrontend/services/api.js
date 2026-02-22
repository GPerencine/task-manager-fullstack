const apiUrl = "https://task-manager-fullstack-tcui.onrender.com"; 

export async function getTasks() {
    const response = await fetch(`${apiUrl}/tasks`); 
    return await response.json();
}

export async function createTask(task) {
    return await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
}

export async function deleteTask(id) {
    return await fetch(`${apiUrl}/tasks/${id}`, {
        method: "DELETE"
    });
}