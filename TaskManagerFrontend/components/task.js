export function renderTask(task) {
    const li = document.createElement("li");

    li.innerHTML = `
        <strong>${task.title}</strong> - ${task.description}
        ${task.isCompleted ? "✅" : ""}
        <button onclick="handleDelete(${task.id})">Excluir</button>
    `;

    return li;
}