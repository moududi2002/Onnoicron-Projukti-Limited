// Application/Interfaces/ISubmissionService.cs
using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface ISubmissionService
    {
        Task<SubmissionDto> SubmitAssignmentAsync(CreateSubmissionDto dto, Guid studentId);
        Task<SubmissionDto> UpdateSubmissionAsync(Guid id, UpdateSubmissionDto dto, Guid studentId);
        Task<SubmissionDto> GradeSubmissionAsync(Guid id, GradeSubmissionDto dto, Guid teacherId);
        Task<SubmissionDto> GetSubmissionByIdAsync(Guid id);
        Task<PaginatedResponseDto<SubmissionDto>> GetSubmissionsForAssignmentAsync(
            Guid assignmentId, int page = 1, int limit = 10);
        Task<IEnumerable<SubmissionDto>> GetStudentSubmissionsAsync(Guid studentId);
        Task<bool> HasStudentSubmittedAsync(Guid assignmentId, Guid studentId);
        Task<DashboardStatsDto> GetStudentDashboardStatsAsync(Guid studentId);
        Task<bool> CanSubmitAssignmentAsync(Guid assignmentId, Guid studentId);
    }
}