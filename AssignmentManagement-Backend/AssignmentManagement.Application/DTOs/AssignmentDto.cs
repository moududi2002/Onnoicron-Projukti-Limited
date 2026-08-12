// Application/DTOs/AssignmentDto.cs
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.DTOs
{
    public class AssignmentDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Deadline { get; set; }
        public int MaximumMarks { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid ClassId { get; set; }
        public string? ClassName { get; set; }
        public Guid SubjectId { get; set; }
        public string? SubjectName { get; set; }
        public Guid CreatedById { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int SubmissionCount { get; set; }
        public int GradedCount { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new();
        public bool IsDeadlinePassed => DateTime.UtcNow > Deadline;
        public string TimeRemaining => GetTimeRemaining();

        private string GetTimeRemaining()
        {
            var remaining = Deadline - DateTime.UtcNow;
            if (remaining.TotalSeconds <= 0)
                return "Deadline passed";

            if (remaining.TotalDays >= 1)
                return $"{(int)remaining.TotalDays}d {remaining.Hours}h remaining";
            
            if (remaining.TotalHours >= 1)
                return $"{(int)remaining.TotalHours}h {remaining.Minutes}m remaining";
            
            return $"{(int)remaining.TotalMinutes}m remaining";
        }
    }

    public class AttachmentDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}