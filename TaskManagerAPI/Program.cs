using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

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

// A ORDEM AQUI É CRUCIAL
app.UseCors("AllowAll"); 
app.UseAuthorization();
app.MapControllers();

app.Run();