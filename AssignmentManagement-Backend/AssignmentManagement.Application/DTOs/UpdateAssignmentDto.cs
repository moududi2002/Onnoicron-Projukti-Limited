// Application/DTOs/UpdateAssignmentDto.cs
using AssignmentManagement.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs
{
    public class UpdateAssignmentDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public string Title { get; set; } = string.Empty;

        [StringLength(5000, ErrorMessage = "Description cannot exceed 5000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Deadline is required")]
        [DataType(DataType.DateTime)]
        public DateTime Deadline { get; set; }

        [Required(ErrorMessage = "Maximum marks is required")]
        [Range(1, 1000, ErrorMessage = "Maximum marks must be between 1 and 1000")]
        public int MaximumMarks { get; set; }

        [Required(ErrorMessage = "Class is required")]
        public Guid ClassId { get; set; }

        [Required(ErrorMessage = "Subject is required")]
        public Guid SubjectId { get; set; }

        public AssignmentStatus Status { get; set; }
    }
}