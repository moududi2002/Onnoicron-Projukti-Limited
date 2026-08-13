// Application/DTOs/GradeSubmissionDto.cs
using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.DTOs
{
    public class GradeSubmissionDto
    {
        [Required(ErrorMessage = "Marks is required")]
        [Range(0, 1000, ErrorMessage = "Marks must be between 0 and 1000")]
        public int Marks { get; set; }

        [StringLength(2000, ErrorMessage = "Feedback cannot exceed 2000 characters")]
        public string? Feedback { get; set; }

        [StringLength(500, ErrorMessage = "Strengths cannot exceed 500 characters")]
        public string? Strengths { get; set; }

        [StringLength(500, ErrorMessage = "Areas for improvement cannot exceed 500 characters")]
        public string? AreasForImprovement { get; set; }

        [StringLength(10, ErrorMessage = "Grade cannot exceed 10 characters")]
        public string? Grade { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Graded;
    }
}