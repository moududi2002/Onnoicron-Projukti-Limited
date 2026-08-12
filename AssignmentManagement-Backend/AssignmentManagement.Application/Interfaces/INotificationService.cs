// Application/Interfaces/INotificationService.cs
namespace AssignmentManagement.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendAssignmentCreatedNotificationAsync(Guid assignmentId, Guid classId);
        Task SendSubmissionReceivedNotificationAsync(Guid submissionId);
        Task SendGradeNotificationAsync(Guid submissionId);
        Task SendDeadlineReminderAsync(Guid assignmentId);
        Task SendBulkNotificationAsync(string message, List<Guid> userIds);
    }
}