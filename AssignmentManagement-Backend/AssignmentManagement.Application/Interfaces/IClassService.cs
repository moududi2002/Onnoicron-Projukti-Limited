// Application/Interfaces/IClassService.cs
using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface IClassService
    {
        Task<PaginatedResponseDto<ClassDto>> GetClassesAsync(
            string? searchTerm = null,
            bool? isActive = null,
            int page = 1, 
            int limit = 10);
        Task<ClassDto> GetClassByIdAsync(Guid id);
        Task<ClassDto> CreateClassAsync(CreateClassDto dto);
        Task<ClassDto> UpdateClassAsync(Guid id, UpdateClassDto dto);
        Task DeleteClassAsync(Guid id);
        Task<bool> ToggleClassStatusAsync(Guid id);
        Task<IEnumerable<ClassDto>> GetActiveClassesAsync();
        Task<bool> IsClassExistsAsync(Guid id);
        Task<int> GetStudentCountAsync(Guid classId);
        Task<IEnumerable<UserDto>> GetStudentsInClassAsync(Guid classId);
        Task AddStudentToClassAsync(Guid classId, Guid studentId);
        Task RemoveStudentFromClassAsync(Guid classId, Guid studentId);
    }
}