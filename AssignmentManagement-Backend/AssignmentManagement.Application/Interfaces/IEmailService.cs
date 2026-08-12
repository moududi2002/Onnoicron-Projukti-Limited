// Application/Interfaces/IEmailService.cs
namespace AssignmentManagement.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendEmailWithAttachmentAsync(string to, string subject, string body, string attachmentPath);
        Task SendWelcomeEmailAsync(string to, string username, string password);
        Task SendPasswordResetEmailAsync(string to, string resetLink);
        Task SendGradeNotificationEmailAsync(string to, string assignmentTitle, int marks, string feedback);
    }
}