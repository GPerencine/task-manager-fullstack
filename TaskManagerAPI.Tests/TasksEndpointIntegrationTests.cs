using System.Net;
using Xunit;

namespace TaskManagerAPI.Tests
{
    public class TasksEndpointIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public TasksEndpointIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GetHealthCheck_ReturnsOk()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/health");
            // Health endpoint returns 200 when all checks are healthy
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetTasks_ReturnsOkWithEmptyArray()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/api/tarefas/usuario/1");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
