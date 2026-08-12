// Domain/Entities/Class.cs
using System.ComponentModel.DataAnnotations;
namespace AssignmentManagement.Domain.Entities
{
    public class Class
    {
        public Guid Id { get; set; }
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(500)]
        public string? Description { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<StudentClass> StudentClasses { get; set; } = new List<StudentClass>();
        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}