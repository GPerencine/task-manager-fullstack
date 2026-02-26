using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TaskManagerAPI.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = "Host=aws-0-sa-east-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.cvdmiikzeyzcmlhgoxdv;Password=EhAA*$FPUm3uC7k;SSL Mode=Prefer;Trust Server Certificate=true;";
            
            optionsBuilder.UseNpgsql(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}