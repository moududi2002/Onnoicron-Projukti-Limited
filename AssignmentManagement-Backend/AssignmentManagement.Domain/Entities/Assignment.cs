// Domain/Entities/Assignment.cs

using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Domain.Entities
{
    public enum AssignmentStatus
    {
        Draft,
        Published,
        Closed
    }

    public class Assignment
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime Deadline { get; set; }

        public int MaximumMarks { get; set; }

        public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;

        public Guid ClassId { get; set; }

        public Guid SubjectId { get; set; }

        public Guid CreatedById { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Class Class { get; set; } = null!;

        public Subject Subject { get; set; } = null!;

        public User CreatedBy { get; set; } = null!;

        public ICollection<Submission> Submissions { get; set; } =
            new List<Submission>();

        public ICollection<AssignmentAttachment> Attachments { get; set; } =
            new List<AssignmentAttachment>();
    }
}