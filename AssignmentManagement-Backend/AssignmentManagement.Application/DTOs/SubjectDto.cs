// Application/DTOs/SubjectDto.cs
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs
{
    public class SubjectDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public Guid ClassId { get; set; }
        public string? ClassName { get; set; }
        public bool IsActive { get; set; }
        public int TeacherCount { get; set; }
    }

    public class CreateSubjectDto
    {
        [Required(ErrorMessage = "Subject name is required")]
        [StringLength(200, ErrorMessage = "Subject name cannot exceed 200 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Subject code is required")]
        [StringLength(100, ErrorMessage = "Subject code cannot exceed 100 characters")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Class is required")]
        public Guid ClassId { get; set; }
    }

    public class UpdateSubjectDto
    {
        [StringLength(200)]
        public string? Name { get; set; }

        [StringLength(100)]
        public string? Code { get; set; }

        public Guid? ClassId { get; set; }
        public bool? IsActive { get; set; }
    }
}