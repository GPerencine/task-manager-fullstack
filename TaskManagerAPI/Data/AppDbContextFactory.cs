using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TaskManagerAPI.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        // Alterado de Sqlite para Npgsql (PostgreSQL)
        var connectionString = "Host=db.cvdmiikzeyzcmlhgoxdv.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=EhAA*$FPUm3uC7k;SSL Mode=Prefer;";
        
        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}