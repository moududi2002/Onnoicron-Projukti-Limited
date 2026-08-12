// Application/Services/DashboardService.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            ApplicationDbContext context,
            ILogger<DashboardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<DashboardStatsDto> GetAdminDashboardStatsAsync()
        {
            var stats = new DashboardStatsDto
            {
                TotalUsers = await _context.Users.CountAsync(u => u.IsActive),
                TotalStudents = await _context.Users.CountAsync(
                    u => u.Role == UserRole.Student && u.IsActive),
                TotalTeachers = await _context.Users.CountAsync(
                    u => u.Role == UserRole.Teacher && u.IsActive),
                TotalAdmins = await _context.Users.CountAsync(
                    u => u.Role == UserRole.Admin && u.IsActive),
                ActiveUsers = await _context.Users.CountAsync(u => u.IsActive),
                TotalClasses = await _context.Classes.CountAsync(c => c.IsActive),
                ActiveClasses = await _context.Classes.CountAsync(c => c.IsActive),
                TotalSubjects = await _context.Subjects.CountAsync(s => s.IsActive),
                ActiveSubjects = await _context.Subjects.CountAsync(s => s.IsActive),
                TotalAssignments = await _context.Assignments.CountAsync(),
                PublishedAssignments = await _context.Assignments.CountAsync(
                    a => a.Status == AssignmentStatus.Published),
                DraftAssignments = await _context.Assignments.CountAsync(
                    a => a.Status == AssignmentStatus.Draft),
                ClosedAssignments = await _context.Assignments.CountAsync(
                    a => a.Status == AssignmentStatus.Closed),
                TotalSubmissions = await _context.Submissions.CountAsync(),
                PendingGrading = await _context.Submissions.CountAsync(
                    s => s.Status == SubmissionStatus.Submitted ||
                         s.Status == SubmissionStatus.LateSubmitted),
                SubmittedOnTime = await _context.Submissions.CountAsync(
                    s => s.Status == SubmissionStatus.Submitted),
                LateSubmissions = await _context.Submissions.CountAsync(
                    s => s.Status == SubmissionStatus.LateSubmitted),
                GradedSubmissions = await _context.Submissions.CountAsync(
                    s => s.Status == SubmissionStatus.Graded),
                RejectedSubmissions = await _context.Submissions.CountAsync(
                    s => s.Status == SubmissionStatus.Rejected),
                ResubmissionRequests = await _context.Submissions.CountAsync(
                    s => s.Status == SubmissionStatus.Resubmitted),
            };

            // Calculate average grade
            var gradedSubmissions = await _context.Submissions
                .Where(s => s.Marks.HasValue)
                .Select(s => s.Marks!.Value)
                .ToListAsync();

            stats.AverageGrade = gradedSubmissions.Any()
                ? Math.Round(gradedSubmissions.Average(), 2)
                : 0;

            if (gradedSubmissions.Any())
            {
                stats.HighestGrade = gradedSubmissions.Max();
                stats.LowestGrade = gradedSubmissions.Min();
            }

            // Calculate submission rate
            var totalStudents = await _context.Users.CountAsync(
                u => u.Role == UserRole.Student && u.IsActive);
            var publishedAssignments = await _context.Assignments
                .CountAsync(a => a.Status == AssignmentStatus.Published);
            var expectedSubmissions = totalStudents * publishedAssignments;
            
            stats.SubmissionRate = expectedSubmissions > 0
                ? Math.Round((double)stats.TotalSubmissions / expectedSubmissions * 100, 2)
                : 0;

            stats.GradingRate = stats.TotalSubmissions > 0
                ? Math.Round((double)stats.GradedSubmissions / stats.TotalSubmissions * 100, 2)
                : 0;

            // Get recent activities with nullable Guid
            stats.RecentActivities = (await GetRecentActivitiesAsync(null, "Admin", 10)).ToList();

            // Get upcoming deadlines
            stats.UpcomingDeadlines = await _context.Assignments
                .Where(a => a.Status == AssignmentStatus.Published && a.Deadline > DateTime.UtcNow)
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .OrderBy(a => a.Deadline)
                .Take(5)
                .Select(a => new UpcomingDeadlineDto
                {
                    AssignmentId = a.Id,
                    AssignmentTitle = a.Title,
                    SubjectName = a.Subject.Name,
                    ClassName = a.Class.Name,
                    Deadline = a.Deadline,
                    TotalStudents = a.Class.StudentClasses.Count,
                    SubmittedCount = a.Submissions.Count
                })
                .ToListAsync();

            stats.OverdueAssignments = await _context.Assignments
                .CountAsync(a => a.Status == AssignmentStatus.Published && a.Deadline < DateTime.UtcNow);

            return stats;
        }

        public async Task<DashboardStatsDto> GetTeacherDashboardStatsAsync(Guid teacherId)
        {
            var teacherAssignments = await _context.Assignments
                .Include(a => a.Submissions)
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .Where(a => a.CreatedById == teacherId)
                .ToListAsync();

            var totalSubmissions = teacherAssignments.Sum(a => a.Submissions.Count);

            var pendingGrading = teacherAssignments.Sum(a =>
                a.Submissions.Count(s =>
                    s.Status == SubmissionStatus.Submitted ||
                    s.Status == SubmissionStatus.LateSubmitted));

            var stats = new DashboardStatsDto
            {
                TotalAssignments = teacherAssignments.Count(
                    a => a.Status != AssignmentStatus.Closed),
                PublishedAssignments = teacherAssignments.Count(
                    a => a.Status == AssignmentStatus.Published),
                DraftAssignments = teacherAssignments.Count(
                    a => a.Status == AssignmentStatus.Draft),
                ClosedAssignments = teacherAssignments.Count(
                    a => a.Status == AssignmentStatus.Closed),
                TotalSubmissions = totalSubmissions,
                SubmittedOnTime = teacherAssignments.Sum(
                    a => a.Submissions.Count(s => s.Status == SubmissionStatus.Submitted)),
                LateSubmissions = teacherAssignments.Sum(
                    a => a.Submissions.Count(s => s.Status == SubmissionStatus.LateSubmitted)),
                PendingGrading = pendingGrading,
                GradedSubmissions = teacherAssignments.Sum(
                    a => a.Submissions.Count(s => s.Status == SubmissionStatus.Graded)),
                TotalStudents = await _context.StudentClasses
                    .CountAsync(sc =>
                        teacherAssignments
                            .Select(a => a.ClassId)
                            .Distinct()
                            .Contains(sc.ClassId)),
                RecentActivities = (await GetRecentActivitiesAsync(teacherId, "Teacher", 10)).ToList()
            };

            // Calculate average grade for teacher's assignments
            var gradedSubmissions = teacherAssignments
                .SelectMany(a => a.Submissions)
                .Where(s => s.Marks.HasValue)
                .ToList();

            if (gradedSubmissions.Any())
            {
                var marks = gradedSubmissions.Select(s => s.Marks!.Value).ToList();
                stats.AverageGrade = Math.Round(marks.Average(), 2);
                stats.HighestGrade = marks.Max();
                stats.LowestGrade = marks.Min();
            }

            // Calculate grading rate
            stats.GradingRate = totalSubmissions > 0
                ? Math.Round((double)stats.GradedSubmissions / totalSubmissions * 100, 2)
                : 0;

            // Get upcoming deadlines for teacher
            stats.UpcomingDeadlines = await _context.Assignments
                .Where(a => a.CreatedById == teacherId && 
                           a.Status == AssignmentStatus.Published && 
                           a.Deadline > DateTime.UtcNow)
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .OrderBy(a => a.Deadline)
                .Take(5)
                .Select(a => new UpcomingDeadlineDto
                {
                    AssignmentId = a.Id,
                    AssignmentTitle = a.Title,
                    SubjectName = a.Subject.Name,
                    ClassName = a.Class.Name,
                    Deadline = a.Deadline,
                    TotalStudents = a.Class.StudentClasses.Count,
                    SubmittedCount = a.Submissions.Count
                })
                .ToListAsync();

            return stats;
        }

        public async Task<DashboardStatsDto> GetStudentDashboardStatsAsync(Guid studentId)
        {
            var studentClasses = await _context.StudentClasses
                .Where(sc => sc.StudentId == studentId)
                .Select(sc => sc.ClassId)
                .ToListAsync();

            var totalAssignments = await _context.Assignments
                .CountAsync(a =>
                    studentClasses.Contains(a.ClassId) &&
                    a.Status == AssignmentStatus.Published);

            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .Where(s => s.StudentId == studentId)
                .ToListAsync();

            var pendingSubmissions = totalAssignments - submissions.Count;

            var gradedSubmissions = submissions
                .Where(s => s.Marks.HasValue)
                .ToList();

            var stats = new DashboardStatsDto
            {
                TotalAssignments = totalAssignments,
                TotalSubmissions = submissions.Count,
                SubmittedOnTime = submissions.Count(
                    s => s.Status == SubmissionStatus.Submitted),
                LateSubmissions = submissions.Count(
                    s => s.Status == SubmissionStatus.LateSubmitted),
                PendingGrading = pendingSubmissions,
                GradedSubmissions = submissions.Count(
                    s => s.Status == SubmissionStatus.Graded),
                RecentActivities = (await GetRecentActivitiesAsync(studentId, "Student", 10)).ToList()
            };

            if (gradedSubmissions.Any())
            {
                var marks = gradedSubmissions.Select(s => s.Marks!.Value).ToList();
                stats.AverageGrade = Math.Round(marks.Average(), 2);
                stats.HighestGrade = marks.Max();
                stats.LowestGrade = marks.Min();
            }

            // Calculate submission rate
            stats.SubmissionRate = totalAssignments > 0
                ? Math.Round((double)submissions.Count / totalAssignments * 100, 2)
                : 0;

            // Get upcoming deadlines for student
            stats.UpcomingDeadlines = await _context.Assignments
                .Where(a => studentClasses.Contains(a.ClassId) &&
                           a.Status == AssignmentStatus.Published &&
                           a.Deadline > DateTime.UtcNow)
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .OrderBy(a => a.Deadline)
                .Take(5)
                .Select(a => new UpcomingDeadlineDto
                {
                    AssignmentId = a.Id,
                    AssignmentTitle = a.Title,
                    SubjectName = a.Subject.Name,
                    ClassName = a.Class.Name,
                    Deadline = a.Deadline,
                    TotalStudents = a.Class.StudentClasses.Count,
                    SubmittedCount = a.Submissions.Count
                })
                .ToListAsync();

            return stats;
        }

        public async Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(
            Guid? userId,
            string role,
            int count = 10)
        {
            var activities = new List<RecentActivityDto>();

            // RECENT ASSIGNMENTS
            IQueryable<Assignment> assignmentQuery = _context.Assignments
                .Include(a => a.CreatedBy)
                .Include(a => a.Subject)
                .Include(a => a.Class);

            if (role == "Teacher" && userId.HasValue && userId.Value != Guid.Empty)
            {
                assignmentQuery = assignmentQuery.Where(a => a.CreatedById == userId.Value);
            }
            else if (role == "Student" && userId.HasValue && userId.Value != Guid.Empty)
            {
                assignmentQuery = assignmentQuery
                    .Join(
                        _context.StudentClasses,
                        a => a.ClassId,
                        sc => sc.ClassId,
                        (a, sc) => new { Assignment = a, StudentClass = sc })
                    .Where(x => x.StudentClass.StudentId == userId.Value)
                    .Select(x => x.Assignment);
            }

            var assignments = await assignmentQuery
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

            foreach (var assignment in assignments)
            {
                activities.Add(new RecentActivityDto
                {
                    Id = assignment.Id,
                    ActivityType = assignment.Status == AssignmentStatus.Published
                        ? "AssignmentPublished"
                        : "AssignmentCreated",
                    Description = $"Assignment: {assignment.Title} for {assignment.Subject?.Name}",
                    UserName = assignment.CreatedBy != null
                        ? $"{assignment.CreatedBy.FirstName} {assignment.CreatedBy.LastName}"
                        : "Unknown",
                    Timestamp = assignment.CreatedAt
                });
            }

            // RECENT SUBMISSIONS
            IQueryable<Submission> submissionQuery = _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.Assignment)
                    .ThenInclude(a => a.Subject);

            if (role == "Teacher" && userId.HasValue && userId.Value != Guid.Empty)
            {
                submissionQuery = submissionQuery.Where(s => s.Assignment.CreatedById == userId.Value);
            }
            else if (role == "Student" && userId.HasValue && userId.Value != Guid.Empty)
            {
                submissionQuery = submissionQuery.Where(s => s.StudentId == userId.Value);
            }

            var submissions = await submissionQuery
                .OrderByDescending(s => s.SubmittedAt)
                .Take(count)
                .ToListAsync();

            foreach (var submission in submissions)
            {
                var activityType = submission.Status == SubmissionStatus.Graded
                    ? "SubmissionGraded"
                    : submission.Status == SubmissionStatus.LateSubmitted
                        ? "LateSubmission"
                        : "SubmissionReceived";

                var description = submission.Status == SubmissionStatus.Graded
                    ? $"Graded: {submission.Marks}/{submission.Assignment.MaximumMarks} marks"
                    : $"Submitted: {submission.Assignment.Title}";

                activities.Add(new RecentActivityDto
                {
                    Id = submission.Id,
                    ActivityType = activityType,
                    Description = description,
                    UserName = submission.Student != null
                        ? $"{submission.Student.FirstName} {submission.Student.LastName}"
                        : "Unknown",
                    Timestamp = submission.Status == SubmissionStatus.Graded && submission.GradedAt.HasValue
                        ? submission.GradedAt.Value
                        : submission.SubmittedAt
                });
            }

            // RECENT CLASS ENROLLMENTS (Admin only)
            if (role == "Admin")
            {
                var recentEnrollments = await _context.StudentClasses
                    .Include(sc => sc.Student)
                    .Include(sc => sc.Class)
                    .OrderByDescending(sc => sc.EnrolledAt)
                    .Take(count)
                    .ToListAsync();

                foreach (var enrollment in recentEnrollments)
                {
                    activities.Add(new RecentActivityDto
                    {
                        Id = enrollment.StudentId,
                        ActivityType = "StudentEnrolled",
                        Description = $"Student enrolled in {enrollment.Class.Name}",
                        UserName = $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
                        Timestamp = enrollment.EnrolledAt
                    });
                }
            }

            // SORT AND LIMIT
            return activities
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .ToList();
        }

        public async Task<IEnumerable<ChartDataDto>> GetSubmissionChartDataAsync(
            Guid? teacherId = null,
            int days = 30)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            var endDate = DateTime.UtcNow;

            var query = _context.Submissions.AsQueryable();

            if (teacherId.HasValue)
            {
                query = query.Where(s => s.Assignment.CreatedById == teacherId.Value);
            }

            var submissions = await query
                .Where(s => s.SubmittedAt >= startDate && s.SubmittedAt <= endDate)
                .GroupBy(s => s.SubmittedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var chartData = new List<ChartDataDto>();

            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var submission = submissions.FirstOrDefault(s => s.Date == date);
                chartData.Add(new ChartDataDto
                {
                    Label = date.ToString("MMM dd"),
                    Value = submission?.Count ?? 0
                });
            }

            return chartData;
        }

        public async Task<IEnumerable<ChartDataDto>> GetGradeDistributionAsync(Guid teacherId)
        {
            var submissions = await _context.Submissions
                .Where(s => s.Assignment.CreatedById == teacherId && s.Marks.HasValue)
                .Select(s => s.Marks!.Value)
                .ToListAsync();

            if (!submissions.Any())
                return new List<ChartDataDto>();

            var maxMarks = submissions.Max();
            var ranges = new[] { "0-25%", "26-50%", "51-75%", "76-90%", "91-100%" };
            var colors = new[] { "#EF4444", "#F59E0B", "#FCD34D", "#34D399", "#10B981" };
            var distribution = new List<ChartDataDto>();

            for (int i = 0; i < ranges.Length; i++)
            {
                var lowerBound = i * 25;
                var upperBound = i == ranges.Length - 1 ? 100 : (i + 1) * 25;

                var count = submissions.Count(m =>
                {
                    var percentage = (m * 100.0) / maxMarks;
                    return percentage >= lowerBound && percentage <= upperBound;
                });

                distribution.Add(new ChartDataDto
                {
                    Label = ranges[i],
                    Value = count,
                    Color = colors[i]
                });
            }

            return distribution;
        }

        public async Task<DashboardStatsDto> GetComprehensiveDashboardAsync()
        {
            var stats = new DashboardStatsDto();

            // Basic counts
            stats.TotalUsers = await _context.Users.CountAsync();
            stats.TotalStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student);
            stats.TotalTeachers = await _context.Users.CountAsync(u => u.Role == UserRole.Teacher);
            stats.TotalAdmins = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
            stats.ActiveUsers = await _context.Users.CountAsync(u => u.IsActive);
            stats.InactiveUsers = stats.TotalUsers - stats.ActiveUsers;

            // Class and Subject stats
            stats.TotalClasses = await _context.Classes.CountAsync();
            stats.ActiveClasses = await _context.Classes.CountAsync(c => c.IsActive);
            stats.TotalSubjects = await _context.Subjects.CountAsync();
            stats.ActiveSubjects = await _context.Subjects.CountAsync(s => s.IsActive);

            // Assignment stats
            stats.TotalAssignments = await _context.Assignments.CountAsync();
            stats.PublishedAssignments = await _context.Assignments.CountAsync(a => a.Status == AssignmentStatus.Published);
            stats.DraftAssignments = await _context.Assignments.CountAsync(a => a.Status == AssignmentStatus.Draft);
            stats.ClosedAssignments = await _context.Assignments.CountAsync(a => a.Status == AssignmentStatus.Closed);
            
            var thisMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            stats.AssignmentsThisMonth = await _context.Assignments.CountAsync(a => a.CreatedAt >= thisMonth);
            
            var thisWeek = DateTime.UtcNow.AddDays(-7);
            stats.AssignmentsThisWeek = await _context.Assignments.CountAsync(a => a.CreatedAt >= thisWeek);

            // Submission stats
            stats.TotalSubmissions = await _context.Submissions.CountAsync();
            stats.SubmittedOnTime = await _context.Submissions.CountAsync(s => s.Status == SubmissionStatus.Submitted);
            stats.LateSubmissions = await _context.Submissions.CountAsync(s => s.Status == SubmissionStatus.LateSubmitted);
            stats.PendingGrading = await _context.Submissions.CountAsync(s => 
                s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.LateSubmitted);
            stats.GradedSubmissions = await _context.Submissions.CountAsync(s => s.Status == SubmissionStatus.Graded);
            stats.RejectedSubmissions = await _context.Submissions.CountAsync(s => s.Status == SubmissionStatus.Rejected);
            stats.ResubmissionRequests = await _context.Submissions.CountAsync(s => s.Status == SubmissionStatus.Resubmitted);

            // Grade stats
            var gradedSubmissions = await _context.Submissions
                .Where(s => s.Marks.HasValue)
                .ToListAsync();

            if (gradedSubmissions.Any())
            {
                var marks = gradedSubmissions.Select(s => s.Marks!.Value).ToList();
                stats.AverageGrade = Math.Round(marks.Average(), 2);
                stats.HighestGrade = marks.Max();
                stats.LowestGrade = marks.Min();
                
                var percentages = new List<double>();
                foreach (var submission in gradedSubmissions)
                {
                    var assignment = await _context.Assignments.FindAsync(submission.AssignmentId);
                    if (assignment != null)
                    {
                        percentages.Add((double)submission.Marks!.Value / assignment.MaximumMarks * 100);
                    }
                }
                
                if (percentages.Any())
                {
                    stats.PassPercentage = Math.Round((double)percentages.Count(p => p >= 40) / percentages.Count * 100, 2);
                    stats.StudentsAbove90Percent = percentages.Count(p => p >= 90);
                    stats.StudentsBelow40Percent = percentages.Count(p => p < 40);
                }
            }

            // Calculate rates
            if (stats.TotalStudents > 0 && stats.PublishedAssignments > 0)
            {
                var expectedSubmissions = stats.TotalStudents * stats.PublishedAssignments;
                stats.SubmissionRate = expectedSubmissions > 0 
                    ? Math.Round((double)stats.TotalSubmissions / expectedSubmissions * 100, 2) 
                    : 0;
            }

            stats.GradingRate = stats.TotalSubmissions > 0 
                ? Math.Round((double)stats.GradedSubmissions / stats.TotalSubmissions * 100, 2) 
                : 0;

            stats.OnTimeSubmissionRate = stats.TotalSubmissions > 0 
                ? Math.Round((double)stats.SubmittedOnTime / stats.TotalSubmissions * 100, 2) 
                : 0;

            // Average response time
            var gradedWithDates = await _context.Submissions
                .Where(s => s.GradedAt.HasValue)
                .Select(s => new { s.SubmittedAt, s.GradedAt })
                .ToListAsync();

            if (gradedWithDates.Any())
            {
                stats.AverageResponseTime = Math.Round(
                    gradedWithDates.Average(s => ((DateTime)s.GradedAt! - s.SubmittedAt).TotalHours), 2);
            }

            // Growth rates
            var lastMonth = thisMonth.AddMonths(-1);
            var lastMonthAssignments = await _context.Assignments.CountAsync(a => a.CreatedAt >= lastMonth && a.CreatedAt < thisMonth);
            var lastMonthSubmissions = await _context.Submissions.CountAsync(s => s.SubmittedAt >= lastMonth && s.SubmittedAt < thisMonth);

            stats.AssignmentGrowthRate = lastMonthAssignments > 0 
                ? Math.Round((double)(stats.AssignmentsThisMonth - lastMonthAssignments) / lastMonthAssignments * 100, 2)
                : 100;

            stats.SubmissionGrowthRate = lastMonthSubmissions > 0 
                ? Math.Round((double)(stats.TotalSubmissions - lastMonthSubmissions) / lastMonthSubmissions * 100, 2)
                : 100;

            // Upcoming deadlines
            stats.UpcomingDeadlines = await _context.Assignments
                .Where(a => a.Status == AssignmentStatus.Published && a.Deadline > DateTime.UtcNow)
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .OrderBy(a => a.Deadline)
                .Take(5)
                .Select(a => new UpcomingDeadlineDto
                {
                    AssignmentId = a.Id,
                    AssignmentTitle = a.Title,
                    SubjectName = a.Subject.Name,
                    ClassName = a.Class.Name,
                    Deadline = a.Deadline,
                    TotalStudents = a.Class.StudentClasses.Count,
                    SubmittedCount = a.Submissions.Count
                })
                .ToListAsync();

            stats.OverdueAssignments = await _context.Assignments
                .CountAsync(a => a.Status == AssignmentStatus.Published && a.Deadline < DateTime.UtcNow);

            // File statistics
            stats.TotalFilesUploaded = await _context.AssignmentAttachments.CountAsync() + 
                                     await _context.SubmissionAttachments.CountAsync();

            // Recent activities
            stats.RecentActivities = (await GetRecentActivitiesAsync(null, "Admin", 10)).ToList();

            stats.LastActivityDate = stats.RecentActivities.Any() 
                ? stats.RecentActivities.First().Timestamp 
                : DateTime.UtcNow;

            return stats;
        }
    }
}