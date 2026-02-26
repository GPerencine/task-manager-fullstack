using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// CONFIGURAÇÃO DEFINITIVA DA CONEXÃO (Porta 5432 é mais estável que a 6543)
var connectionString = "Host=aws-0-sa-east-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.cvdmiikzeyzcmlhgoxdv;Password=EhAA*$FPUm3uC7k;SSL Mode=Require;Trust Server Certificate=true;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// LIBERAÇÃO TOTAL DE CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll"); // Deve vir antes dos mapeamentos

app.MapGet("/", () => "API Conectada com Sucesso!");

// Endpoints Minimal API
app.MapGet("/tasks/{userId}", async (string userId, AppDbContext db) =>
    await db.Tasks.Where(t => t.UserId == userId).ToListAsync());

app.MapPost("/tasks", async (TaskItem task, AppDbContext db) => {
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

// Outros endpoints (Put/Delete) mantêm-se iguais...

app.Run();