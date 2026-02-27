namespace TaskManagerAPI.Models;

public class User 
{ 
    public int Id { get; set; } 
    public string Username { get; set; } = string.Empty; 
    public string Password { get; set; } = string.Empty; 
}

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public int UserId { get; set; } // Deve ser int para comparar com User.Id
}