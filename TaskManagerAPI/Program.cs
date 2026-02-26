using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString = "Host=db.cvdmiikzeyzcmlhgoxdv.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=EhAA*$FPUm3uC7k;SSL Mode=Require;Trust Server Certificate=true;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));


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