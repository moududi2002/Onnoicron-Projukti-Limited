// Application/DTOs/UpdateSubmissionDto.cs
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs
{
    public class UpdateSubmissionDto
    {
        [Required(ErrorMessage = "Content is required")]
        [StringLength(10000, MinimumLength = 10, ErrorMessage = "Content must be between 10 and 10000 characters")]
        public string Content { get; set; } = string.Empty;

        // Attachments to keep (by ID)
        public List<Guid>? KeepAttachmentIds { get; set; }

        // New attachments will be uploaded separately
        public List<Guid>? NewAttachmentIds { get; set; }
    }
}