using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    public class UsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuarioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Password))
            {
                return BadRequest("Nome de usuário e senha são obrigatórios.");
            }

            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
            {
                return BadRequest("Usuário já existe.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.Username });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginData)
        {
            if (string.IsNullOrWhiteSpace(loginData.Username) || string.IsNullOrWhiteSpace(loginData.Password))
            {
                return BadRequest("Nome de usuário e senha são obrigatórios.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginData.Username);
            if (user == null)
            {
                return Unauthorized("Usuário ou senha inválidos.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginData.Password, user.Password);
            if (!isPasswordValid)
            {
                return Unauthorized("Usuário ou senha inválidos.");
            }

            return Ok(new { user.Id, user.Username });
        }
    }
}
