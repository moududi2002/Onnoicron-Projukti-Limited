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
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Subject code is required")]
        [StringLength(100)]
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

    // New DTOs
    public class TeacherAssignmentDto
    {
        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public string TeacherEmail { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public Guid ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateTeacherAssignmentDto
    {
        public Guid? NewSubjectId { get; set; }
        public Guid? NewTeacherId { get; set; }
    }
}