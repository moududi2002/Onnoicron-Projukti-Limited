// Application/Services/NotificationService.cs
using AssignmentManagement.Application.Interfaces;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AssignmentManagement.Domain.Entities;


namespace AssignmentManagement.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task SendAssignmentCreatedNotificationAsync(Guid assignmentId, Guid classId)
        {
            try
            {
                var assignment = await _context.Assignments
                    .Include(a => a.Subject)
                    .Include(a => a.Class)
                    .FirstOrDefaultAsync(a => a.Id == assignmentId);

                if (assignment == null) return;

                // Get all students in the class
                var students = await _context.StudentClasses
                    .Where(sc => sc.ClassId == classId)
                    .Include(sc => sc.Student)
                    .Select(sc => sc.Student)
                    .ToListAsync();

                foreach (var student in students)
                {
                    // TODO: Implement actual notification (email, push notification, etc.)
                    _logger.LogInformation($"Notification: New assignment '{assignment.Title}' for student {student.Email}");
                    
                    // Send email notification
                    await _emailService.SendEmailAsync(
                        student.Email,
                        $"New Assignment: {assignment.Title}",
                        $@"
                            <h2>New Assignment Available</h2>
                            <p>Dear {student.FirstName},</p>
                            <p>A new assignment has been posted for your class <strong>{assignment.Class.Name}</strong>.</p>
                            <p><strong>Subject:</strong> {assignment.Subject.Name}</p>
                            <p><strong>Title:</strong> {assignment.Title}</p>
                            <p><strong>Deadline:</strong> {assignment.Deadline:MMMM dd, yyyy 'at' HH:mm}</p>
                            <p><strong>Maximum Marks:</strong> {assignment.MaximumMarks}</p>
                            <p>Please submit your work before the deadline.</p>
                        ");
                }

                _logger.LogInformation($"Sent {students.Count} notifications for assignment {assignmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending assignment creation notifications for {assignmentId}");
            }
        }

        public async Task SendSubmissionReceivedNotificationAsync(Guid submissionId)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.Assignment)
                        .ThenInclude(a => a.CreatedBy)
                    .Include(s => s.Student)
                    .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null) return;

                // Notify teacher
                var teacher = submission.Assignment.CreatedBy;
                if (teacher != null)
                {
                    await _emailService.SendEmailAsync(
                        teacher.Email,
                        $"New Submission: {submission.Assignment.Title}",
                        $@"
                            <h2>New Submission Received</h2>
                            <p>Dear {teacher.FirstName},</p>
                            <p><strong>{submission.Student.FirstName} {submission.Student.LastName}</strong> has submitted their work for <strong>{submission.Assignment.Title}</strong>.</p>
                            <p><strong>Submitted:</strong> {submission.SubmittedAt:MMMM dd, yyyy 'at' HH:mm}</p>
                            <p><strong>Status:</strong> {submission.Status}</p>
                            <p>Please review and grade the submission.</p>
                        ");
                }

                _logger.LogInformation($"Sent submission notification for {submissionId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending submission notification for {submissionId}");
            }
        }

        public async Task SendGradeNotificationAsync(Guid submissionId)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.Assignment)
                    .Include(s => s.Student)
                    .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null || !submission.Marks.HasValue) return;

                // Notify student
                var student = submission.Student;
                if (student != null)
                {
                    var message = $@"
                        <h2>Your Submission Has Been Graded</h2>
                        <p>Dear {student.FirstName},</p>
                        <p>Your submission for <strong>{submission.Assignment.Title}</strong> has been graded.</p>
                        <p><strong>Marks:</strong> {submission.Marks}/{submission.Assignment.MaximumMarks}</p>
                        <p><strong>Status:</strong> {submission.Status}</p>";

                    if (!string.IsNullOrEmpty(submission.Feedback))
                    {
                        message += $@"
                        <p><strong>Feedback:</strong></p>
                        <blockquote>{submission.Feedback}</blockquote>";
                    }

                    message += "</p>";

                    await _emailService.SendEmailAsync(
                        student.Email,
                        $"Assignment Graded: {submission.Assignment.Title}",
                        message
                    );
                }

                _logger.LogInformation($"Sent grade notification for submission {submissionId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending grade notification for {submissionId}");
            }
        }

        public async Task SendDeadlineReminderAsync(Guid assignmentId)
        {
            try
            {
                var assignment = await _context.Assignments
                    .Include(a => a.Class)
                    .Include(a => a.Subject)
                    .FirstOrDefaultAsync(a => a.Id == assignmentId);

                if (assignment == null || assignment.Status != AssignmentStatus.Published) return;

                // Get students who haven't submitted
                var submittedStudentIds = await _context.Submissions
                    .Where(s => s.AssignmentId == assignmentId)
                    .Select(s => s.StudentId)
                    .ToListAsync();

                var students = await _context.StudentClasses
                    .Where(sc => sc.ClassId == assignment.ClassId && !submittedStudentIds.Contains(sc.StudentId))
                    .Include(sc => sc.Student)
                    .Select(sc => sc.Student)
                    .ToListAsync();

                foreach (var student in students)
                {
                    var timeRemaining = assignment.Deadline - DateTime.UtcNow;
                    
                    await _emailService.SendEmailAsync(
                        student.Email,
                        $"Deadline Reminder: {assignment.Title}",
                        $@"
                            <h2>Assignment Deadline Reminder</h2>
                            <p>Dear {student.FirstName},</p>
                            <p>This is a reminder that the deadline for <strong>{assignment.Title}</strong> is approaching.</p>
                            <p><strong>Time Remaining:</strong> {timeRemaining.Days}d {timeRemaining.Hours}h {timeRemaining.Minutes}m</p>
                            <p><strong>Subject:</strong> {assignment.Subject.Name}</p>
                            <p><strong>Class:</strong> {assignment.Class.Name}</p>
                            <p>Please submit your work before the deadline to avoid penalties.</p>
                        ");
                }

                _logger.LogInformation($"Sent {students.Count} deadline reminders for assignment {assignmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending deadline reminders for {assignmentId}");
            }
        }

        public async Task SendBulkNotificationAsync(string message, List<Guid> userIds)
        {
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToListAsync();

            foreach (var user in users)
            {
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Notification from Assignment Management System",
                    message
                );
            }

            _logger.LogInformation($"Sent bulk notification to {users.Count} users");
        }
    }
}