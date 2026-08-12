// Application/Interfaces/IAuthService.cs
using AssignmentManagement.Application.DTOs;

namespace AssignmentManagement.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto?> ValidateUserAsync(string username, string password);
        Task<UserDto> RegisterUserAsync(CreateUserDto dto);
        Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task<bool> ResetPasswordAsync(string email);
        Task<UserDto> GetUserByIdAsync(Guid userId);
        Task<bool> IsUsernameAvailableAsync(string username);
        Task<bool> IsEmailAvailableAsync(string email);
    }
}