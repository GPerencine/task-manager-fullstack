using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CONSTRUÇÃO SEGURA DA CONEXÃO
var connBuilder = new NpgsqlConnectionStringBuilder();
connBuilder.Host = "aws-0-sa-east-1.pooler.supabase.com";
connBuilder.Port = 6543;
connBuilder.Database = "postgres";
connBuilder.Username = "postgres.cvdmiikzeyzcmlhgoxdv";
connBuilder.Password = "EhAA*$FPUm3uC7k"; // O builder cuida dos caracteres especiais sozinho
connBuilder.SslMode = SslMode.Prefer;
connBuilder.TrustServerCertificate = true;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connBuilder.ConnectionString, npgsqlOptions => 
    {
        npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    }));

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ENDPOINTS
app.MapGet("/", () => "API Ativa!");

app.MapGet("/tasks/{userId}", async (string userId, AppDbContext db) =>
    await db.Tasks.Where(t => t.UserId == userId).ToListAsync());

app.MapPost("/tasks", async (TaskItem task, AppDbContext db) =>
{
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

app.MapPut("/tasks/{id}", async (int id, TaskItem inputTask, AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    task.Title = inputTask.Title;
    task.Description = inputTask.Description;
    task.IsCompleted = inputTask.IsCompleted;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/tasks/{id}", async (int id, AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// CRIAÇÃO DA TABELA (COM TRATAMENTO DE ERRO)
try {
    using (var scope = app.Services.CreateScope()) {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
    }
} catch (Exception ex) {
    Console.WriteLine($"Erro ao iniciar banco: {ex.Message}");
}

app.Run();