using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models
{
    public class TarefaDTO
    {
        [Required(ErrorMessage = "O título é obrigatório.")]
        [StringLength(100, ErrorMessage = "O título não pode exceder 100 caracteres.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição não pode exceder 500 caracteres.")]
        public string? Description { get; set; }

        public bool IsCompleted { get; set; }

        [Required(ErrorMessage = "O ID do usuário é obrigatório.")]
        public int UserId { get; set; }
    }
}
