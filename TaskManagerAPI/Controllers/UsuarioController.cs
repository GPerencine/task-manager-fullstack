using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;
using TaskManagerAPI.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TaskManagerAPI.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioController(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Password))
            {
                return BadRequest("Nome de usuário e senha são obrigatórios.");
            }

            if (await _usuarioRepository.UserExistsAsync(user.Username))
            {
                return BadRequest("Usuário já existe.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            await _usuarioRepository.AddUserAsync(user);

            return Ok(new { user.Id, user.Username });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginData, [FromServices] IConfiguration config)
        {
            if (string.IsNullOrWhiteSpace(loginData.Username) || string.IsNullOrWhiteSpace(loginData.Password))
            {
                return BadRequest("Nome de usuário e senha são obrigatórios.");
            }

            var user = await _usuarioRepository.GetUserByUsernameAsync(loginData.Username);
            if (user == null)
            {
                return Unauthorized("Usuário ou senha inválidos.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginData.Password, user.Password);
            if (!isPasswordValid)
            {
                return Unauthorized("Usuário ou senha inválidos.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = config["Jwt:Key"] ?? "uma_chave_secreta_super_longa_para_desenvolvimento_12345!";
            var key = Encoding.ASCII.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new { 
                Id = user.Id, 
                Username = user.Username, 
                Token = tokenHandler.WriteToken(token) 
            });
        }
    }
}
