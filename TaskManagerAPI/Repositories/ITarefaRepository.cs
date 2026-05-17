using TaskManagerAPI.Models;

namespace TaskManagerAPI.Repositories
{
    public interface ITarefaRepository
    {
        Task<IEnumerable<TaskItem>> GetTasksByUserIdAsync(int userId, int page = 1, int pageSize = 20);
        Task<TaskItem?> GetTaskByIdAsync(int id);
        Task<TaskItem> AddTaskAsync(TaskItem task);
        Task UpdateTaskAsync(TaskItem task);
        Task DeleteTaskAsync(TaskItem task);
    }
}
