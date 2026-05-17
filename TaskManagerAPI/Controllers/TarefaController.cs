using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskManagerAPI.Models;
using TaskManagerAPI.Repositories;

namespace TaskManagerAPI.Controllers
{
    [ApiController]
    [Route("api/tarefas")]
    public class TarefaController : ControllerBase
    {
        private readonly ITarefaRepository _repository;

        public TarefaController(ITarefaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("usuario/{userId}")]
        [SwaggerOperation(Summary = "Retorna as tarefas de um usuário com paginação")]
        [ProducesResponseType(typeof(IEnumerable<TaskItem>), 200)]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasksByUser(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var tasks = await _repository.GetTasksByUserIdAsync(userId, page, pageSize);
            return Ok(new { data = tasks, page, pageSize });
        }

        [HttpGet("{id}")]
        [SwaggerOperation(Summary = "Retorna os detalhes de uma tarefa pelo ID")]
        [ProducesResponseType(typeof(TaskItem), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<TaskItem>> GetTaskById(int id)
        {
            var task = await _repository.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { message = "Tarefa não encontrada." });
            }
            return Ok(task);
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Cria uma nova tarefa")]
        [ProducesResponseType(typeof(TaskItem), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<TaskItem>> CreateTask([FromBody] TarefaDTO dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                IsCompleted = dto.IsCompleted,
                UserId = dto.UserId
            };

            var createdTask = await _repository.AddTaskAsync(task);
            return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
        }

        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "Atualiza os dados de uma tarefa existente")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TarefaDTO dto)
        {
            var task = await _repository.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { message = "Tarefa não encontrada." });
            }

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.IsCompleted = dto.IsCompleted;
            task.UserId = dto.UserId;

            await _repository.UpdateTaskAsync(task);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [SwaggerOperation(Summary = "Exclui uma tarefa pelo ID")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _repository.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { message = "Tarefa não encontrada." });
            }

            await _repository.DeleteTaskAsync(task);
            return NoContent();
        }
    }
}
