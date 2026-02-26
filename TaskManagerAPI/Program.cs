using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. CONEXÃO DIRETA COM O BANCO (Porta 5432 evita o erro "Tenant not found")
var connectionString = "Host=db.cvdmiikzeyzcmlhgoxdv.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=EhAA*$FPUm3uC7k;SSL Mode=Require;Trust Server Certificate=true;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. CONFIGURAÇÃO DE CORS (Resolve o erro vermelho no console do navegador)
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. ATIVAÇÃO DOS SERVIÇOS (A ordem aqui é importante)
app.UseCors("AllowAll"); 

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();