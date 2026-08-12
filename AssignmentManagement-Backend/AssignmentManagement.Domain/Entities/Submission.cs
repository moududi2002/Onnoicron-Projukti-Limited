// Domain/Entities/Submission.cs

namespace AssignmentManagement.Domain.Entities
{
    public enum SubmissionStatus
    {
        Submitted,
        LateSubmitted,
        Graded,
        Rejected,
        Resubmitted
    }

    public class Submission
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid StudentId { get; set; }
        public string? Content { get; set; }
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
        public int? Marks { get; set; }
        public string? Feedback { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? GradedAt { get; set; }

        // Navigation properties
        public Assignment Assignment { get; set; } = null!;
        public User Student { get; set; } = null!;
        public ICollection<SubmissionAttachment> Attachments { get; set; } = new List<SubmissionAttachment>();
    }
}