// Domain/Entities/Subject.cs
using System.ComponentModel.DataAnnotations;
namespace AssignmentManagement.Domain.Entities
{
    public class Subject
    {
        public Guid Id { get; set; }
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;
        public Guid ClassId { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public Class Class { get; set; } = null!;
        public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}