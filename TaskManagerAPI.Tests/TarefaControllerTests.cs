using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagerAPI.Controllers;
using TaskManagerAPI.Models;
using TaskManagerAPI.Repositories;
using Xunit;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace TaskManagerAPI.Tests
{
    public class TarefaControllerTests
    {
        private readonly Mock<ITarefaRepository> _repositoryMock;
        private readonly TarefaController _controller;

        public TarefaControllerTests()
        {
            _repositoryMock = new Mock<ITarefaRepository>();
            _controller = new TarefaController(_repositoryMock.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetTasksByUser_ShouldReturnOkWithTasks_WhenUserHasTasks()
        {
            // Arrange
            int userId = 1;
            var mockTasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Tarefa 1", Description = "Descrição 1", IsCompleted = false, UserId = userId },
                new TaskItem { Id = 2, Title = "Tarefa 2", Description = "Descrição 2", IsCompleted = true, UserId = userId }
            };

            _repositoryMock.Setup(repo => repo.GetTasksByUserIdAsync(userId, It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(mockTasks);

            // Act
            var result = await _controller.GetTasksByUser(userId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var value = okResult.Value;
            value.Should().NotBeNull();
            
            var dataProp = value!.GetType().GetProperty("data");
            dataProp.Should().NotBeNull();
            
            var returnedTasks = dataProp!.GetValue(value) as IEnumerable<TaskItem>;
            returnedTasks.Should().NotBeNull();
            returnedTasks.Should().HaveCount(2);
            
            _repositoryMock.Verify(repo => repo.GetTasksByUserIdAsync(userId, 1, 20), Times.Once);
        }

        [Fact]
        public async Task CreateTask_ShouldReturnCreatedAtAction_WithCreatedTask()
        {
            // Arrange
            var dto = new TarefaDTO
            {
                Title = "Nova Tarefa",
                Description = "Nova Descrição",
                IsCompleted = false,
                UserId = 1
            };

            var createdTask = new TaskItem
            {
                Id = 10,
                Title = dto.Title,
                Description = dto.Description,
                IsCompleted = dto.IsCompleted,
                UserId = dto.UserId
            };

            _repositoryMock.Setup(repo => repo.AddTaskAsync(It.IsAny<TaskItem>()))
                .ReturnsAsync(createdTask);

            // Act
            var result = await _controller.CreateTask(dto);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.ActionName.Should().Be(nameof(TarefaController.GetTaskById));
            createdResult.RouteValues.Should().NotBeNull();
            createdResult.RouteValues!["id"].Should().Be(10);
            
            var returnedTask = createdResult.Value.Should().BeOfType<TaskItem>().Subject;
            returnedTask.Id.Should().Be(10);
            returnedTask.Title.Should().Be(dto.Title);
            
            _repositoryMock.Verify(repo => repo.AddTaskAsync(It.Is<TaskItem>(t => 
                t.Title == dto.Title && 
                t.Description == dto.Description && 
                t.UserId == dto.UserId
            )), Times.Once);
        }

        [Fact]
        public async Task UpdateTask_ShouldReturnNoContent_WhenUpdateIsSuccessful()
        {
            // Arrange
            int taskId = 5;
            var existingTask = new TaskItem { Id = taskId, Title = "Antigo Título", UserId = 1 };
            var dto = new TarefaDTO { Title = "Novo Título", Description = "Nova Descrição", IsCompleted = true, UserId = 1 };

            _repositoryMock.Setup(repo => repo.GetTaskByIdAsync(taskId))
                .ReturnsAsync(existingTask);
            _repositoryMock.Setup(repo => repo.UpdateTaskAsync(It.IsAny<TaskItem>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateTask(taskId, dto);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            existingTask.Title.Should().Be(dto.Title);
            existingTask.Description.Should().Be(dto.Description);
            existingTask.IsCompleted.Should().Be(dto.IsCompleted);

            _repositoryMock.Verify(repo => repo.GetTaskByIdAsync(taskId), Times.Once);
            _repositoryMock.Verify(repo => repo.UpdateTaskAsync(existingTask), Times.Once);
        }

        [Fact]
        public async Task UpdateTask_ShouldReturnNotFound_WhenTaskDoesNotExist()
        {
            // Arrange
            int taskId = 99;
            var dto = new TarefaDTO { Title = "Título", UserId = 1 };

            _repositoryMock.Setup(repo => repo.GetTaskByIdAsync(taskId))
                .ReturnsAsync((TaskItem?)null);

            // Act
            var result = await _controller.UpdateTask(taskId, dto);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            _repositoryMock.Verify(repo => repo.GetTaskByIdAsync(taskId), Times.Once);
            _repositoryMock.Verify(repo => repo.UpdateTaskAsync(It.IsAny<TaskItem>()), Times.Never);
        }

        [Fact]
        public async Task DeleteTask_ShouldReturnNoContent_WhenDeleteIsSuccessful()
        {
            // Arrange
            int taskId = 8;
            var existingTask = new TaskItem { Id = taskId, Title = "Tarefa para deletar", UserId = 1 };

            _repositoryMock.Setup(repo => repo.GetTaskByIdAsync(taskId))
                .ReturnsAsync(existingTask);
            _repositoryMock.Setup(repo => repo.DeleteTaskAsync(It.IsAny<TaskItem>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteTask(taskId);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            _repositoryMock.Verify(repo => repo.GetTaskByIdAsync(taskId), Times.Once);
            _repositoryMock.Verify(repo => repo.DeleteTaskAsync(existingTask), Times.Once);
        }

        [Fact]
        public async Task DeleteTask_ShouldReturnNotFound_WhenTaskDoesNotExist()
        {
            // Arrange
            int taskId = 99;

            _repositoryMock.Setup(repo => repo.GetTaskByIdAsync(taskId))
                .ReturnsAsync((TaskItem?)null);

            // Act
            var result = await _controller.DeleteTask(taskId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            _repositoryMock.Verify(repo => repo.GetTaskByIdAsync(taskId), Times.Once);
            _repositoryMock.Verify(repo => repo.DeleteTaskAsync(It.IsAny<TaskItem>()), Times.Never);
        }
    }
}
