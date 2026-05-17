using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using TaskManagerAPI.Data;
using Testcontainers.PostgreSql;

namespace TaskManagerAPI.Tests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
    {
        public PostgreSqlContainer DbContainer { get; } = new PostgreSqlBuilder("postgres:16")
            .WithDatabase("testdb_api")
            .WithUsername("testuser")
            .WithPassword("testpass")
            .Build();

        public async Task InitializeAsync()
        {
            await DbContainer.StartAsync();

            // Pre-create the schema using EF Core
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(DbContainer.GetConnectionString());
            using var ctx = new AppDbContext(optionsBuilder.Options);
            await ctx.Database.EnsureCreatedAsync();
        }

        public new async Task DisposeAsync()
        {
            await DbContainer.DisposeAsync();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Pass connection string as environment variable so Program.cs reads it
            builder.UseSetting("ConnectionStrings:DefaultConnection", DbContainer.GetConnectionString());

            builder.ConfigureServices(services =>
            {
                // Remove the existing AppDbContext registration
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (dbContextDescriptor != null)
                    services.Remove(dbContextDescriptor);

                // Re-register AppDbContext pointing to the Testcontainer
                services.AddDbContext<AppDbContext>(options =>
                    options.UseNpgsql(DbContainer.GetConnectionString()));

                // Remove all existing health check registrations (NpgSql health check would fail
                // because it uses the original connection string read at startup before our override)
                var healthCheckDescriptors = services
                    .Where(d => d.ServiceType.FullName != null &&
                                d.ServiceType.FullName.Contains("HealthCheck"))
                    .ToList();
                foreach (var descriptor in healthCheckDescriptors)
                    services.Remove(descriptor);

                // Register a simple always-healthy check so the /health endpoint still works
                services.AddHealthChecks()
                    .Add(new HealthCheckRegistration(
                        "always-healthy",
                        _ => new AlwaysHealthyCheck(),
                        HealthStatus.Healthy,
                        Array.Empty<string>()));
            });
        }

        private sealed class AlwaysHealthyCheck : IHealthCheck
        {
            public Task<HealthCheckResult> CheckHealthAsync(
                HealthCheckContext context,
                CancellationToken cancellationToken = default)
                => Task.FromResult(HealthCheckResult.Healthy("Test environment – always healthy."));
        }
    }
}
