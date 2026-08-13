// Application/DTOs/SubmissionDto.cs
using AssignmentManagement.Application.DTOs;


namespace AssignmentManagement.Application.DTOs
{
    public class SubmissionDto
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public string? AssignmentTitle { get; set; }
        public Guid StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentEmail { get; set; }
        public string? Content { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? Marks { get; set; }
        public int? MaximumMarks { get; set; }
        public string? Feedback { get; set; }
        public string? Strengths { get; set; }
        public string? AreasForImprovement { get; set; }
        public string? Grade { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? GradedAt { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new();
        public bool IsLate => Status == "LateSubmitted";
        public bool IsGraded => Status == "Graded";
        public string? GradePercentage => Marks.HasValue && MaximumMarks.HasValue 
            ? $"{((double)Marks.Value / MaximumMarks.Value * 100):F1}%" 
            : null;
    }
}