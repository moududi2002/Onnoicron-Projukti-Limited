// Application/Services/SubjectService.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Application.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubjectService> _logger;

        public SubjectService(ApplicationDbContext context, ILogger<SubjectService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PaginatedResponseDto<SubjectDto>> GetSubjectsAsync(
            Guid? classId = null,
            string? searchTerm = null,
            bool? isActive = null,
            int page = 1, 
            int limit = 10)
        {
            var query = _context.Subjects
                .Include(s => s.Class)
                .Include(s => s.TeacherAssignments)
                .AsQueryable();

            if (classId.HasValue)
                query = query.Where(s => s.ClassId == classId.Value);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(s => 
                    s.Name.ToLower().Contains(searchTerm) || 
                    s.Code.ToLower().Contains(searchTerm));
            }

            if (isActive.HasValue)
                query = query.Where(s => s.IsActive == isActive.Value);

            var total = await query.CountAsync();

            var subjects = await query
                .OrderBy(s => s.Class.Name)
                .ThenBy(s => s.Name)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PaginatedResponseDto<SubjectDto>
            {
                Data = subjects.Select(MapToDto).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<SubjectDto> GetSubjectByIdAsync(Guid id)
        {
            var subject = await _context.Subjects
                .Include(s => s.Class)
                .Include(s => s.TeacherAssignments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                throw new KeyNotFoundException("Subject not found");

            return MapToDto(subject);
        }

        public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto)
        {
            // Check if class exists
            if (!await _context.Classes.AnyAsync(c => c.Id == dto.ClassId))
                throw new KeyNotFoundException("Class not found");

            // Check if subject code already exists for the class
            var exists = await _context.Subjects
                .AnyAsync(s => s.Code.ToLower() == dto.Code.ToLower() && s.ClassId == dto.ClassId);

            if (exists)
                throw new InvalidOperationException("Subject with this code already exists for this class");

            var subject = new Subject
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Code = dto.Code,
                ClassId = dto.ClassId,
                IsActive = true
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Subject created: {subject.Name} (Code: {subject.Code})");

            return await GetSubjectByIdAsync(subject.Id);
        }

        public async Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectDto dto)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null)
                throw new KeyNotFoundException("Subject not found");

            if (dto.Name != null)
                subject.Name = dto.Name;

            if (dto.Code != null)
            {
                var exists = await _context.Subjects
                    .AnyAsync(s => s.Code.ToLower() == dto.Code.ToLower() && 
                                   s.ClassId == (dto.ClassId ?? subject.ClassId) && 
                                   s.Id != id);

                if (exists)
                    throw new InvalidOperationException("Subject with this code already exists for this class");

                subject.Code = dto.Code;
            }

            if (dto.ClassId.HasValue)
            {
                if (!await _context.Classes.AnyAsync(c => c.Id == dto.ClassId.Value))
                    throw new KeyNotFoundException("Class not found");

                subject.ClassId = dto.ClassId.Value;
            }

            if (dto.IsActive.HasValue)
                subject.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Subject updated: {subject.Name} (ID: {id})");

            return await GetSubjectByIdAsync(id);
        }

        public async Task DeleteSubjectAsync(Guid id)
        {
            var subject = await _context.Subjects
                .Include(s => s.TeacherAssignments)
                .Include(s => s.Assignments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                throw new KeyNotFoundException("Subject not found");

            if (subject.Assignments.Any())
                throw new InvalidOperationException($"Cannot delete subject with {subject.Assignments.Count} assignments");

            if (subject.TeacherAssignments.Any())
                _context.TeacherAssignments.RemoveRange(subject.TeacherAssignments);

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Subject deleted: {subject.Name} (ID: {id})");
        }

        public async Task<bool> ToggleSubjectStatusAsync(Guid id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null)
                throw new KeyNotFoundException("Subject not found");

            subject.IsActive = !subject.IsActive;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Subject status toggled: {subject.Name}, Active: {subject.IsActive}");

            return subject.IsActive;
        }

        public async Task<IEnumerable<SubjectDto>> GetSubjectsByClassAsync(Guid classId)
        {
            var subjects = await _context.Subjects
                .Include(s => s.Class)
                .Include(s => s.TeacherAssignments)
                .Where(s => s.ClassId == classId && s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();

            return subjects.Select(MapToDto);
        }

        public async Task<IEnumerable<SubjectDto>> GetTeacherSubjectsAsync(Guid teacherId)
        {
            var subjects = await _context.TeacherAssignments
                .Where(ta => ta.TeacherId == teacherId)
                .Include(ta => ta.Subject)
                    .ThenInclude(s => s.Class)
                .Select(ta => ta.Subject)
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();

            return subjects.Select(MapToDto);
        }

        public async Task<bool> IsSubjectExistsAsync(Guid id)
        {
            return await _context.Subjects.AnyAsync(s => s.Id == id);
        }

        public async Task AssignTeacherToSubjectAsync(Guid subjectId, Guid teacherId)
        {
            if (!await _context.Subjects.AnyAsync(s => s.Id == subjectId))
                throw new KeyNotFoundException("Subject not found");

            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId && u.Role == UserRole.Teacher);
            if (teacher == null)
                throw new KeyNotFoundException("Teacher not found");

            var alreadyAssigned = await _context.TeacherAssignments
                .AnyAsync(ta => ta.SubjectId == subjectId && ta.TeacherId == teacherId);

            if (alreadyAssigned)
                throw new InvalidOperationException("Teacher is already assigned to this subject");

            var teacherAssignment = new TeacherAssignment
            {
                TeacherId = teacherId,
                SubjectId = subjectId,
                AssignedAt = DateTime.UtcNow
            };

            _context.TeacherAssignments.Add(teacherAssignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Teacher {teacherId} assigned to subject {subjectId}");
        }

        public async Task RemoveTeacherFromSubjectAsync(Guid subjectId, Guid teacherId)
        {
            var teacherAssignment = await _context.TeacherAssignments
                .FirstOrDefaultAsync(ta => ta.SubjectId == subjectId && ta.TeacherId == teacherId);

            if (teacherAssignment == null)
                throw new KeyNotFoundException("Teacher is not assigned to this subject");

            // Check if teacher has assignments for this subject
            var hasAssignments = await _context.Assignments
                .AnyAsync(a => a.SubjectId == subjectId && a.CreatedById == teacherId);

            if (hasAssignments)
                throw new InvalidOperationException("Cannot remove teacher with existing assignments for this subject");

            _context.TeacherAssignments.Remove(teacherAssignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Teacher {teacherId} removed from subject {subjectId}");
        }

        public async Task<IEnumerable<UserDto>> GetTeachersBySubjectAsync(Guid subjectId)
        {
            var teachers = await _context.TeacherAssignments
                .Where(ta => ta.SubjectId == subjectId)
                .Include(ta => ta.Teacher)
                .Select(ta => ta.Teacher)
                .OrderBy(t => t.FirstName)
                .ThenBy(t => t.LastName)
                .ToListAsync();

            return teachers.Select(t => new UserDto
            {
                Id = t.Id,
                Username = t.Username,
                Email = t.Email,
                Role = t.Role,
                FirstName = t.FirstName,
                LastName = t.LastName,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt
            });
        }

        private static SubjectDto MapToDto(Subject subject)
        {
            return new SubjectDto
            {
                Id = subject.Id,
                Name = subject.Name,
                Code = subject.Code,
                ClassId = subject.ClassId,
                ClassName = subject.Class?.Name,
                IsActive = subject.IsActive,
                TeacherCount = subject.TeacherAssignments?.Count ?? 0
            };
        }
    }
}