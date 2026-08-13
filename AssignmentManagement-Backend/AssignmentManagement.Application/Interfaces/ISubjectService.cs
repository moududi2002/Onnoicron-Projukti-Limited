using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface ISubjectService
    {
        Task<PaginatedResponseDto<SubjectDto>> GetSubjectsAsync(
            Guid? classId = null,
            string? searchTerm = null,
            bool? isActive = null,
            int page = 1,
            int limit = 10);
        Task<SubjectDto> GetSubjectByIdAsync(Guid id);
        Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto);
        Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectDto dto);
        Task DeleteSubjectAsync(Guid id);
        Task<bool> ToggleSubjectStatusAsync(Guid id);
        Task<IEnumerable<SubjectDto>> GetSubjectsByClassAsync(Guid classId);
        Task<IEnumerable<SubjectDto>> GetTeacherSubjectsAsync(Guid teacherId);
        Task<bool> IsSubjectExistsAsync(Guid id);
        Task AssignTeacherToSubjectAsync(Guid subjectId, Guid teacherId);
        Task RemoveTeacherFromSubjectAsync(Guid subjectId, Guid teacherId);
        Task<IEnumerable<UserDto>> GetTeachersBySubjectAsync(Guid subjectId);

        // Teacher Assignment methods
        Task<IEnumerable<TeacherAssignmentDto>> GetAllTeacherAssignmentsAsync();
        Task<TeacherAssignmentDto> GetTeacherAssignmentByIdAsync(Guid subjectId, Guid teacherId);
        Task<IEnumerable<TeacherAssignmentDto>> GetTeacherAssignmentsBySubjectAsync(Guid subjectId);
        Task<IEnumerable<TeacherAssignmentDto>> GetTeacherAssignmentsByTeacherAsync(Guid teacherId);

        // Update methods - Single method with optional parameters
        Task UpdateTeacherAssignmentAsync(Guid subjectId, Guid teacherId, UpdateTeacherAssignmentDto dto);
        Task UpdateTeacherAssignmentAsync(Guid subjectId, Guid oldTeacherId, Guid newTeacherId);
    }
}