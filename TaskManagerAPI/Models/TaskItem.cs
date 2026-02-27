namespace TaskManagerAPI.Models;

public class TaskItem {
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public string UserId { get; set; } = string.Empty;
}