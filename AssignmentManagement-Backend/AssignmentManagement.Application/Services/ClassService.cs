// Application/Services/ClassService.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Application.Services
{
    public class ClassService : IClassService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClassService> _logger;

        public ClassService(ApplicationDbContext context, ILogger<ClassService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PaginatedResponseDto<ClassDto>> GetClassesAsync(
            string? searchTerm = null,
            bool? isActive = null,
            int page = 1, 
            int limit = 10)
        {
            var query = _context.Classes
                .Include(c => c.StudentClasses)
                .Include(c => c.Subjects)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(c => 
                    c.Name.ToLower().Contains(searchTerm) || 
                    (c.Description != null && c.Description.ToLower().Contains(searchTerm)));
            }

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);

            var total = await query.CountAsync();

            var classes = await query
                .OrderBy(c => c.Name)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PaginatedResponseDto<ClassDto>
            {
                Data = classes.Select(MapToDto).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<ClassDto> GetClassByIdAsync(Guid id)
        {
            var classEntity = await _context.Classes
                .Include(c => c.StudentClasses)
                .Include(c => c.Subjects)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (classEntity == null)
                throw new KeyNotFoundException("Class not found");

            return MapToDto(classEntity);
        }

        public async Task<ClassDto> CreateClassAsync(CreateClassDto dto)
        {
            // Check if class name already exists for the same academic year
            var exists = await _context.Classes
                .AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower() && c.AcademicYear == dto.AcademicYear);

            if (exists)
                throw new InvalidOperationException("Class with this name already exists for the same academic year");

            var classEntity = new Class
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                AcademicYear = dto.AcademicYear,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Classes.Add(classEntity);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Class created: {classEntity.Name} (ID: {classEntity.Id})");

            return MapToDto(classEntity);
        }

        public async Task<ClassDto> UpdateClassAsync(Guid id, UpdateClassDto dto)
        {
            var classEntity = await _context.Classes.FindAsync(id);
            if (classEntity == null)
                throw new KeyNotFoundException("Class not found");

            if (dto.Name != null)
            {
                // Check if new name conflicts with existing class
                var exists = await _context.Classes
                    .AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower() && 
                                   c.AcademicYear == (dto.AcademicYear ?? classEntity.AcademicYear) && 
                                   c.Id != id);

                if (exists)
                    throw new InvalidOperationException("Class with this name already exists for the same academic year");

                classEntity.Name = dto.Name;
            }

            if (dto.Description != null)
                classEntity.Description = dto.Description;

            if (dto.AcademicYear != null)
                classEntity.AcademicYear = dto.AcademicYear;

            if (dto.IsActive.HasValue)
                classEntity.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Class updated: {classEntity.Name} (ID: {id})");

            return await GetClassByIdAsync(id);
        }

        public async Task DeleteClassAsync(Guid id)
        {
            var classEntity = await _context.Classes
                .Include(c => c.StudentClasses)
                .Include(c => c.Subjects)
                .Include(c => c.Assignments)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (classEntity == null)
                throw new KeyNotFoundException("Class not found");

            // Check if class has active dependencies
            if (classEntity.StudentClasses.Any())
                throw new InvalidOperationException($"Cannot delete class with {classEntity.StudentClasses.Count} enrolled students");

            if (classEntity.Assignments.Any())
                throw new InvalidOperationException($"Cannot delete class with {classEntity.Assignments.Count} assignments");

            _context.Classes.Remove(classEntity);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Class deleted: {classEntity.Name} (ID: {id})");
        }

        public async Task<bool> ToggleClassStatusAsync(Guid id)
        {
            var classEntity = await _context.Classes.FindAsync(id);
            if (classEntity == null)
                throw new KeyNotFoundException("Class not found");

            classEntity.IsActive = !classEntity.IsActive;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Class status toggled: {classEntity.Name}, Active: {classEntity.IsActive}");

            return classEntity.IsActive;
        }

        public async Task<IEnumerable<ClassDto>> GetActiveClassesAsync()
        {
            var classes = await _context.Classes
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return classes.Select(MapToDto);
        }

        public async Task<bool> IsClassExistsAsync(Guid id)
        {
            return await _context.Classes.AnyAsync(c => c.Id == id);
        }

        public async Task<int> GetStudentCountAsync(Guid classId)
        {
            return await _context.StudentClasses
                .CountAsync(sc => sc.ClassId == classId);
        }

        public async Task<IEnumerable<UserDto>> GetStudentsInClassAsync(Guid classId)
        {
            var students = await _context.StudentClasses
                .Where(sc => sc.ClassId == classId)
                .Include(sc => sc.Student)
                .Select(sc => sc.Student)
                .OrderBy(s => s.FirstName)
                .ThenBy(s => s.LastName)
                .ToListAsync();

            return students.Select(s => new UserDto
            {
                Id = s.Id,
                Username = s.Username,
                Email = s.Email,
                Role = s.Role,
                FirstName = s.FirstName,
                LastName = s.LastName,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            });
        }

        public async Task AddStudentToClassAsync(Guid classId, Guid studentId)
        {
            // Check if class exists
            if (!await _context.Classes.AnyAsync(c => c.Id == classId))
                throw new KeyNotFoundException("Class not found");

            // Check if student exists
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentId && u.Role == UserRole.Student);
            if (student == null)
                throw new KeyNotFoundException("Student not found");

            // Check if already enrolled
            var alreadyEnrolled = await _context.StudentClasses
                .AnyAsync(sc => sc.ClassId == classId && sc.StudentId == studentId);

            if (alreadyEnrolled)
                throw new InvalidOperationException("Student is already enrolled in this class");

            var studentClass = new StudentClass
            {
                StudentId = studentId,
                ClassId = classId,
                EnrolledAt = DateTime.UtcNow
            };

            _context.StudentClasses.Add(studentClass);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Student {studentId} added to class {classId}");
        }

        public async Task RemoveStudentFromClassAsync(Guid classId, Guid studentId)
        {
            var studentClass = await _context.StudentClasses
                .FirstOrDefaultAsync(sc => sc.ClassId == classId && sc.StudentId == studentId);

            if (studentClass == null)
                throw new KeyNotFoundException("Student is not enrolled in this class");

            // Check if student has submissions for this class
            var hasSubmissions = await _context.Submissions
                .AnyAsync(s => s.StudentId == studentId && s.Assignment.ClassId == classId);

            if (hasSubmissions)
                throw new InvalidOperationException("Cannot remove student with existing submissions");

            _context.StudentClasses.Remove(studentClass);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Student {studentId} removed from class {classId}");
        }

        private static ClassDto MapToDto(Class classEntity)
        {
            return new ClassDto
            {
                Id = classEntity.Id,
                Name = classEntity.Name,
                Description = classEntity.Description,
                AcademicYear = classEntity.AcademicYear,
                IsActive = classEntity.IsActive,
                StudentCount = classEntity.StudentClasses?.Count ?? 0,
                SubjectCount = classEntity.Subjects?.Count ?? 0,
                CreatedAt = classEntity.CreatedAt
            };
        }
    }
}