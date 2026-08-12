// Application/Interfaces/IDashboardService.cs
using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetAdminDashboardStatsAsync();
        Task<DashboardStatsDto> GetTeacherDashboardStatsAsync(Guid teacherId);
        Task<DashboardStatsDto> GetStudentDashboardStatsAsync(Guid studentId);
        Task<DashboardStatsDto> GetComprehensiveDashboardAsync();
        Task<IEnumerable<RecentActivityDto>> GetRecentActivitiesAsync(Guid? userId, string role, int count = 10);
        Task<IEnumerable<ChartDataDto>> GetSubmissionChartDataAsync(Guid? teacherId = null, int days = 30);
        Task<IEnumerable<ChartDataDto>> GetGradeDistributionAsync(Guid teacherId);
    }
}