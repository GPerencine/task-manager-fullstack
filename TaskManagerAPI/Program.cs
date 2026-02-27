using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data; 
using TaskManagerAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// String de conexão do Neon ajustada para o Npgsql do .NET
var connectionString = "Host=ep-ancient-dream-ac6dwfhf-pooler.sa-east-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_U3IYmRSsJq1b;SSL Mode=Require;Trust Server Certificate=true;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();

// ROTA PARA BUSCAR TAREFAS
app.MapGet("/tasks/{userId}", async (string userId, AppDbContext db) =>
    await db.Tasks.Where(t => t.UserId == userId).ToListAsync());

// ROTA PARA CRIAR (Resolve o erro 405)
app.MapPost("/tasks", async ([FromBody] TaskItem task, AppDbContext db) => {
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

// ROTA PARA ATUALIZAR (PUT)
app.MapPut("/tasks/{id}", async (int id, [FromBody] TaskItem inputTask, AppDbContext db) => {
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    
    task.IsCompleted = inputTask.IsCompleted; // Atualiza o status
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ROTA PARA EXCLUIR (DELETE)
app.MapDelete("/tasks/{id}", async (int id, AppDbContext db) => {
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    
    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();