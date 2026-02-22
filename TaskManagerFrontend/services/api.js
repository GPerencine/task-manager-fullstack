const API_URL = "http://localhost:5087/tasks";

export async function getTasks() {
    const response = await fetch(API_URL);
    return await response.json();
}

export async function createTask(task) {
    return await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
}

export async function deleteTask(id) {
    return await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
}