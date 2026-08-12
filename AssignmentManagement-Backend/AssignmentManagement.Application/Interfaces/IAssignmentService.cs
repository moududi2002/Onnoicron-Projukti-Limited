// Application/Interfaces/IAssignmentService.cs
using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface IAssignmentService
    {
        Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto dto, Guid teacherId);
        Task<AssignmentDto> UpdateAssignmentAsync(Guid id, UpdateAssignmentDto dto, Guid teacherId);
        Task DeleteAssignmentAsync(Guid id, Guid teacherId);
        Task<AssignmentDto> GetAssignmentByIdAsync(Guid id);
        Task<PaginatedResponseDto<AssignmentDto>> GetAssignmentsAsync(
            Guid? classId = null, 
            Guid? subjectId = null, 
            string? status = null,
            int page = 1, 
            int limit = 10);
        Task<IEnumerable<AssignmentDto>> GetAssignmentsForStudentAsync(Guid studentId);
        Task<IEnumerable<AssignmentDto>> GetTeacherAssignmentsAsync(Guid teacherId);
        Task<AssignmentDto> PublishAssignmentAsync(Guid id, Guid teacherId);
        Task<AssignmentDto> CloseAssignmentAsync(Guid id, Guid teacherId);
        Task<DashboardStatsDto> GetTeacherDashboardStatsAsync(Guid teacherId);
        Task<bool> IsAssignmentExistsAsync(Guid id);
    }
}