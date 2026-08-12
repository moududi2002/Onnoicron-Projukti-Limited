// Application/Interfaces/IUserService.cs
using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface IUserService
    {
        Task<PaginatedResponseDto<UserDto>> GetUsersAsync(
            string? role = null, 
            string? searchTerm = null, 
            bool? isActive = null,
            int page = 1, 
            int limit = 10);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto);
        Task DeleteUserAsync(Guid id);
        Task<bool> ToggleUserStatusAsync(Guid id);
        Task<IEnumerable<UserDto>> GetTeachersAsync();
        Task<IEnumerable<UserDto>> GetStudentsAsync();
        Task<IEnumerable<UserDto>> GetTeachersBySubjectAsync(Guid subjectId);
        Task<IEnumerable<UserDto>> GetStudentsByClassAsync(Guid classId);
    }
}