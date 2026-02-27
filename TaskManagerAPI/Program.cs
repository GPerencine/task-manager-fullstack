using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data; 
using TaskManagerAPI.Models;

var builder = WebApplication.CreateBuilder(args);
var connectionString = "Host=ep-ancient-dream-ac6dwfhf-pooler.sa-east-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_U3IYmRSsJq1b;SSL Mode=Require;Trust Server Certificate=true;";

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddCors(options => options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();
app.UseCors("AllowAll");

// --- ROTAS DE USUÁRIO (LOGIN/CADASTRO) ---
app.MapPost("/register", async (User user, AppDbContext db) => {
    if (await db.Users.AnyAsync(u => u.Username == user.Username)) return Results.BadRequest("Usuário já existe");
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { user.Id, user.Username });
});

app.MapPost("/login", async (User loginData, AppDbContext db) => {
    var user = await db.Users.FirstOrDefaultAsync(u => u.Username == loginData.Username && u.Password == loginData.Password);
    if (user is null) return Results.Unauthorized();
    return Results.Ok(new { user.Id, user.Username });
});

// --- ROTAS DE TAREFAS ---
app.MapGet("/tasks/{userId}", async (int userId, AppDbContext db) => 
    await db.Tasks.Where(t => t.UserId == userId).ToListAsync());

app.MapPost("/tasks", async ([FromBody] TaskItem task, AppDbContext db) => {
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

app.MapPut("/tasks/{id}", async (int id, [FromBody] TaskItem input, AppDbContext db) => {
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    task.IsCompleted = input.IsCompleted;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/tasks/{id}", async (int id, AppDbContext db) => {
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

// Classes de suporte (pode colocar no final ou em arquivos separados)
public class User { public int Id { get; set; } public string Username { get; set; } = ""; public string Password { get; set; } = ""; }