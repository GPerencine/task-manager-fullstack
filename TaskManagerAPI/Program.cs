using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Repositories;
using Serilog;
using Serilog.Formatting.Json;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration)
       .Enrich.FromLogContext()
       .WriteTo.Console(new JsonFormatter()));

// --- CARREGAR CONFIGURAÇÕES COM SEGURANÇA ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("A Connection String 'DefaultConnection' não foi configurada nas variáveis de ambiente ou no appsettings.");
}

// --- REGISTRO DE SERVIÇOS ---
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddCors(options => options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "postgres");

// Registrar o repositório
builder.Services.AddScoped<ITarefaRepository, TarefaRepository>();

// Registrar os Controllers
builder.Services.AddControllers();

// Adicionar Swagger/OpenAPI para documentação
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.EnableAnnotations());

var app = builder.Build();

// --- PIPELINE DE REQUISIÇÃO HTTP ---
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Mapear os endpoints dos controllers
app.MapControllers();

app.MapHealthChecks("/health", new HealthCheckOptions {
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();

public partial class Program
{
    protected Program() { }
}