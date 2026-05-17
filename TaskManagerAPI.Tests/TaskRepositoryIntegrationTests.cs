using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;
using TaskManagerAPI.Repositories;
using Testcontainers.PostgreSql;
using Xunit;

namespace TaskManagerAPI.Tests
{
    public class TaskRepositoryIntegrationTests : IAsyncLifetime
    {
        private readonly PostgreSqlContainer _dbContainer =
            new PostgreSqlBuilder("postgres:16")
            .WithDatabase("testdb")
            .WithUsername("testuser")
            .WithPassword("testpass")
            .Build();

        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();
        }

        public async Task DisposeAsync()
        {
            await _dbContainer.DisposeAsync();
        }

        private AppDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(_dbContainer.GetConnectionString())
                .Options;
            
            var ctx = new AppDbContext(options);
            ctx.Database.EnsureCreated();
            return ctx;
        }

        [Fact]
        public async Task CreateTask_PersistsCorrectly_UsingTestcontainers()
        {
            // Arrange
            using var ctx = CreateContext();
            var repo = new TarefaRepository(ctx);
            var task = new TaskItem { Title = "Integration Test", Description = "Testing with postgres container", IsCompleted = false, UserId = 1 };

            // Act
            await repo.AddTaskAsync(task);
            var found = await repo.GetTaskByIdAsync(task.Id);

            // Assert
            Assert.NotNull(found);
            Assert.Equal("Integration Test", found.Title);
        }
    }
}
