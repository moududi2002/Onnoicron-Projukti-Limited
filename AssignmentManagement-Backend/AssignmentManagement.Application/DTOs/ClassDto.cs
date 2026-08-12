// Application/DTOs/ClassDto.cs
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs
{
    public class ClassDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int StudentCount { get; set; }
        public int SubjectCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateClassDto
    {
        [Required(ErrorMessage = "Class name is required")]
        [StringLength(200, ErrorMessage = "Class name cannot exceed 200 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Academic year is required")]
        public string AcademicYear { get; set; } = string.Empty;
    }

    public class UpdateClassDto
    {
        [StringLength(200)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public string? AcademicYear { get; set; }
        public bool? IsActive { get; set; }
    }
}