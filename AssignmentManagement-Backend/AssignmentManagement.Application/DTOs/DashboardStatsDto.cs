// Application/DTOs/DashboardStatsDto.cs
namespace AssignmentManagement.Application.DTOs
{
    public class DashboardStatsDto
    {
        // User Statistics
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalAdmins { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }

        // Class & Subject Statistics
        public int TotalClasses { get; set; }
        public int ActiveClasses { get; set; }
        public int TotalSubjects { get; set; }
        public int ActiveSubjects { get; set; }

        // Assignment Statistics
        public int TotalAssignments { get; set; }
        public int PublishedAssignments { get; set; }
        public int DraftAssignments { get; set; }
        public int ClosedAssignments { get; set; }
        public int AssignmentsThisMonth { get; set; }
        public int AssignmentsThisWeek { get; set; }

        // Submission Statistics
        public int TotalSubmissions { get; set; }
        public int SubmittedOnTime { get; set; }
        public int LateSubmissions { get; set; }
        public int PendingGrading { get; set; }
        public int GradedSubmissions { get; set; }
        public int RejectedSubmissions { get; set; }
        public int ResubmissionRequests { get; set; }

        // Grade Statistics
        public double AverageGrade { get; set; }
        public double HighestGrade { get; set; }
        public double LowestGrade { get; set; }
        public double PassPercentage { get; set; }
        public int StudentsAbove90Percent { get; set; }
        public int StudentsBelow40Percent { get; set; }

        // Performance Metrics
        public double SubmissionRate { get; set; } // Percentage of students who submitted
        public double GradingRate { get; set; } // Percentage of submissions graded
        public double OnTimeSubmissionRate { get; set; }
        public double AverageResponseTime { get; set; } // Hours between submission and grading

        // Trend Data
        public double AssignmentGrowthRate { get; set; } // Percentage increase from last month
        public double SubmissionGrowthRate { get; set; }
        public double GradeImprovementRate { get; set; }

        // Charts Data
        public List<ChartDataDto> SubmissionTrends { get; set; } = new();
        public List<ChartDataDto> GradeDistribution { get; set; } = new();
        public List<ChartDataDto> ClassPerformance { get; set; } = new();
        public List<ChartDataDto> SubjectPerformance { get; set; } = new();
        public List<ChartDataDto> DailySubmissions { get; set; } = new();
        public List<ChartDataDto> MonthlySubmissions { get; set; } = new();

        // Recent Activities
        public List<RecentActivityDto> RecentActivities { get; set; } = new();

        // Top Performers
        public List<TopPerformerDto> TopStudents { get; set; } = new();
        public List<TopPerformerDto> TopClasses { get; set; } = new();
        public List<TopPerformerDto> TopSubjects { get; set; } = new();

        // Deadlines
        public List<UpcomingDeadlineDto> UpcomingDeadlines { get; set; } = new();
        public int OverdueAssignments { get; set; }

        // System Health
        public int TotalFilesUploaded { get; set; }
        public long TotalStorageUsed { get; set; } // In bytes
        public int ActiveUsersToday { get; set; }
        public DateTime LastActivityDate { get; set; }
    }

    public class ChartDataDto
    {
        public string Label { get; set; } = string.Empty;
        public double Value { get; set; }
        public string? Color { get; set; }
        public string? Category { get; set; }
        public Dictionary<string, object>? AdditionalData { get; set; }
    }

    public class RecentActivityDto
    {
        public Guid Id { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? UserRole { get; set; }
        public string? EntityType { get; set; }
        public Guid? EntityId { get; set; }
        public DateTime Timestamp { get; set; }
        public string TimeAgo => GetTimeAgo();

        private string GetTimeAgo()
        {
            var timeSpan = DateTime.UtcNow - Timestamp;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes}m ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours}h ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays}d ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)}w ago";
            if (timeSpan.TotalDays < 365)
                return Timestamp.ToString("MMM dd");
            
            return Timestamp.ToString("MMM dd, yyyy");
        }
    }

    public class TopPerformerDto
    {
        public string Name { get; set; } = string.Empty;
        public Guid Id { get; set; }
        public double AverageGrade { get; set; }
        public int TotalSubmissions { get; set; }
        public int CompletedAssignments { get; set; }
        public double CompletionRate { get; set; }
        public string? Avatar { get; set; }
        public string? Category { get; set; }
    }

    public class UpcomingDeadlineDto
    {
        public Guid AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int TotalStudents { get; set; }
        public int SubmittedCount { get; set; }
        public int RemainingCount => TotalStudents - SubmittedCount;
        public double SubmissionRate => TotalStudents > 0 ? (double)SubmittedCount / TotalStudents * 100 : 0;
        public string TimeRemaining => GetTimeRemaining();
        public bool IsUrgent => (Deadline - DateTime.UtcNow).TotalHours < 24;
        public bool IsOverdue => DateTime.UtcNow > Deadline;

        private string GetTimeRemaining()
        {
            var remaining = Deadline - DateTime.UtcNow;
            
            if (remaining.TotalSeconds <= 0)
                return "Overdue";

            if (remaining.TotalDays >= 1)
                return $"{remaining.Days}d {remaining.Hours}h";
            
            if (remaining.TotalHours >= 1)
                return $"{remaining.Hours}h {remaining.Minutes}m";
            
            return $"{remaining.Minutes}m remaining";
        }
    }
}