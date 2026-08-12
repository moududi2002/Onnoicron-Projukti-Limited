// API/Controllers/DashboardController.cs
using AssignmentManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AssignmentManagement.Application.DTOs;
namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DashboardStatsDto>> GetAdminDashboard()
        {
            try
            {
                var stats = await _dashboardService.GetAdminDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin dashboard");
                return StatusCode(500, new { message = "Error loading dashboard" });
            }
        }

        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DashboardStatsDto>> GetTeacherDashboard()
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var stats = await _dashboardService.GetTeacherDashboardStatsAsync(teacherId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher dashboard");
                return StatusCode(500, new { message = "Error loading dashboard" });
            }
        }

        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<DashboardStatsDto>> GetStudentDashboard()
        {
            try
            {
                var studentId = GetCurrentUserId();
                var stats = await _dashboardService.GetStudentDashboardStatsAsync(studentId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student dashboard");
                return StatusCode(500, new { message = "Error loading dashboard" });
            }
        }

        [HttpGet("comprehensive")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DashboardStatsDto>> GetComprehensiveDashboard()
        {
            try
            {
                var stats = await _dashboardService.GetComprehensiveDashboardAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comprehensive dashboard");
                return StatusCode(500, new { message = "Error loading dashboard" });
            }
        }

        [HttpGet("activities")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RecentActivityDto>>> GetRecentActivities([FromQuery] int count = 10)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var role = User.FindFirstValue(ClaimTypes.Role);
                
                var activities = await _dashboardService.GetRecentActivitiesAsync(
                    userId != null ? Guid.Parse(userId) : null, 
                    role ?? "Student", 
                    count);
                
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activities");
                return StatusCode(500, new { message = "Error loading activities" });
            }
        }

        [HttpGet("charts/submissions")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<ChartDataDto>>> GetSubmissionChart([FromQuery] int days = 30)
        {
            try
            {
                Guid? teacherId = null;
                if (User.IsInRole("Teacher"))
                {
                    teacherId = GetCurrentUserId();
                }

                var chartData = await _dashboardService.GetSubmissionChartDataAsync(teacherId, days);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting submission chart");
                return StatusCode(500, new { message = "Error loading chart data" });
            }
        }

        [HttpGet("charts/grades")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<ChartDataDto>>> GetGradeDistribution()
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var chartData = await _dashboardService.GetGradeDistributionAsync(teacherId);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting grade distribution");
                return StatusCode(500, new { message = "Error loading chart data" });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userId, out var id))
                throw new UnauthorizedAccessException("Invalid user ID.");

            return id;
        }
    }
}