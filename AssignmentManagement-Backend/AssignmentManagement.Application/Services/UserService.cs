// Application/Services/UserService.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AssignmentManagement.Application.Interfaces;

namespace AssignmentManagement.Application.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                throw new KeyNotFoundException("User not found");

            return MapToDto(user);
        }

        public async Task<PaginatedResponseDto<UserDto>> GetUsersAsync(
            string? role = null, 
            string? searchTerm = null, 
            bool? isActive = null,
            int page = 1, 
            int limit = 10)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, out var roleEnum))
                query = query.Where(u => u.Role == roleEnum);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(u => 
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm) ||
                    u.Username.ToLower().Contains(searchTerm));
            }

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            var total = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PaginatedResponseDto<UserDto>
            {
                Data = users.Select(MapToDto).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        // Add these missing methods

        public async Task<IEnumerable<UserDto>> GetTeachersBySubjectAsync(Guid subjectId)
        {
            var teachers = await _context.TeacherAssignments
                .Where(ta => ta.SubjectId == subjectId)
                .Include(ta => ta.Teacher)
                .Select(ta => ta.Teacher)
                .Where(t => t.IsActive)
                .OrderBy(t => t.FirstName)
                .ThenBy(t => t.LastName)
                .ToListAsync();

            return teachers.Select(MapToDto);
        }

        public async Task<IEnumerable<UserDto>> GetStudentsByClassAsync(Guid classId)
        {
            var students = await _context.StudentClasses
                .Where(sc => sc.ClassId == classId)
                .Include(sc => sc.Student)
                .Select(sc => sc.Student)
                .Where(s => s.IsActive)
                .OrderBy(s => s.FirstName)
                .ThenBy(s => s.LastName)
                .ToListAsync();

            return students.Select(MapToDto);
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                throw new InvalidOperationException("Username already exists");

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new InvalidOperationException("Email already exists");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User created: {user.Username} (ID: {user.Id})");

            return MapToDto(user);
        }

        public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (dto.FirstName != null)
                user.FirstName = dto.FirstName;

            if (dto.LastName != null)
                user.LastName = dto.LastName;

            if (dto.Email != null)
            {
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id))
                    throw new InvalidOperationException("Email already exists");
                user.Email = dto.Email;
            }

            if (dto.IsActive.HasValue)
                user.IsActive = dto.IsActive.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"User updated: {user.Username} (ID: {id})");

            return MapToDto(user);
        }

        public async Task DeleteUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Check if user has any dependencies
            var hasSubmissions = await _context.Submissions.AnyAsync(s => s.StudentId == id);
            var hasAssignments = await _context.Assignments.AnyAsync(a => a.CreatedById == id);

            if (hasSubmissions || hasAssignments)
                throw new InvalidOperationException("Cannot delete user with existing submissions or assignments. Consider deactivating instead.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User deleted: {user.Username} (ID: {id})");
        }

        public async Task<bool> ToggleUserStatusAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"User status toggled: {user.Username} (ID: {id}), Active: {user.IsActive}");

            return user.IsActive;
        }

        public async Task<IEnumerable<UserDto>> GetTeachersAsync()
        {
            var teachers = await _context.Users
                .Where(u => u.Role == UserRole.Teacher && u.IsActive)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            return teachers.Select(MapToDto);
        }

        public async Task<IEnumerable<UserDto>> GetStudentsAsync()
        {
            var students = await _context.Users
                .Where(u => u.Role == UserRole.Student && u.IsActive)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            return students.Select(MapToDto);
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}