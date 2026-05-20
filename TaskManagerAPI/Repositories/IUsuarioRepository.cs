using TaskManagerAPI.Models;

namespace TaskManagerAPI.Repositories
{
    public interface IUsuarioRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User> AddUserAsync(User user);
        Task<bool> UserExistsAsync(string username);
    }
}
