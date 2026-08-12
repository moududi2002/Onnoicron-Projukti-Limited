// Domain/Entities/SubmissionAttachment.cs
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Domain.Entities
{
    public class SubmissionAttachment
    {
        public Guid Id { get; set; }
        
        public Guid SubmissionId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string FileUrl { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string ContentType { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public Submission Submission { get; set; } = null!;
    }
}