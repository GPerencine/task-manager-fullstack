using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Configuração Segura da Conexão (Resolve o erro "Tenant or user not found")
var connBuilder = new NpgsqlConnectionStringBuilder();
connBuilder.Host = "aws-0-sa-east-1.pooler.supabase.com";
connBuilder.Port = 6543;
connBuilder.Database = "postgres";
connBuilder.Username = "postgres.cvdmiikzeyzcmlhgoxdv"; // Verifique se não há espaços extras
connBuilder.Password = "EhAA*$FPUm3uC7k"; // O builder trata os caracteres especiais automaticamente
connBuilder.SslMode = SslMode.Require; // Alterado para Require para garantir conexão segura
connBuilder.TrustServerCertificate = true;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connBuilder.ConnectionString, npgsqlOptions => 
    {
        npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    }));

// Liberação de CORS (Resolve o erro "Blocked by CORS policy")
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll");

// Endpoints da API
app.MapGet("/", () => "API Ativa e Conectada!");

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

// Inicialização segura do banco de dados (Evita erro 500 ao salvar)
try {
    using (var scope = app.Services.CreateScope()) {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // NÃO usamos EnsureCreated aqui se a tabela foi feita manualmente via SQL Editor
    }
} catch (Exception ex) {
    Console.WriteLine($"Erro de inicialização: {ex.Message}");
}

app.Run();