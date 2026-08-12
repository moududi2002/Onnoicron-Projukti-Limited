// Domain/Entities/AssignmentAttachment.cs
namespace AssignmentManagement.Domain.Entities
{
    public class AssignmentAttachment
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public Assignment Assignment { get; set; } = null!;
    }
}