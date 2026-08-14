// Application/Services/AssignmentService.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AssignmentManagement.Application.Interfaces;


namespace AssignmentManagement.Application.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AssignmentService> _logger;

        public AssignmentService(ApplicationDbContext context, ILogger<AssignmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto dto, Guid teacherId)
        {
            // Validate teacher is assigned to this subject
            var teacherAssignment = await _context.TeacherAssignments
                .FirstOrDefaultAsync(ta => ta.TeacherId == teacherId && ta.SubjectId == dto.SubjectId);

            if (teacherAssignment == null)
                throw new UnauthorizedAccessException("You are not assigned to this subject");

            // Validate class and subject exist
            var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
            if (!classExists)
                throw new KeyNotFoundException("Class not found");

            var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
            if (!subjectExists)
                throw new KeyNotFoundException("Subject not found");

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                //Deadline = dto.Deadline,
                Deadline = dto.Deadline.ToUniversalTime(),
                MaximumMarks = dto.MaximumMarks,
                Status = dto.Status,
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId,
                CreatedById = teacherId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Assignment {assignment.Id} created by teacher {teacherId}");
            
            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task<AssignmentDto> UpdateAssignmentAsync(Guid id, UpdateAssignmentDto dto, Guid teacherId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found");

            if (assignment.CreatedById != teacherId)
                throw new UnauthorizedAccessException("You can only update your own assignments");

            if (assignment.Status == AssignmentStatus.Closed)
                throw new InvalidOperationException("Cannot update a closed assignment");

            // Check if there are submissions already
            var hasSubmissions = await _context.Submissions
                .AnyAsync(s => s.AssignmentId == id);

            if (hasSubmissions)
                throw new InvalidOperationException("Cannot update assignment with existing submissions");

            assignment.Title = dto.Title;
            assignment.Description = dto.Description;
            assignment.Deadline = dto.Deadline;
            assignment.MaximumMarks = dto.MaximumMarks;
            assignment.ClassId = dto.ClassId;
            assignment.SubjectId = dto.SubjectId;
            assignment.Status = dto.Status;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Assignment {id} updated by teacher {teacherId}");

            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task DeleteAssignmentAsync(Guid id, Guid teacherId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Submissions)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found");

            if (assignment.CreatedById != teacherId)
                throw new UnauthorizedAccessException("You can only delete your own assignments");

            if (assignment.Status == AssignmentStatus.Published && assignment.Submissions.Any())
                throw new InvalidOperationException("Cannot delete assignment with submissions");

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Assignment {id} deleted by teacher {teacherId}");
        }

        public async Task<AssignmentDto> GetAssignmentByIdAsync(Guid id)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.CreatedBy)
                .Include(a => a.Submissions)
                .Include(a => a.Attachments)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found");

            return MapToDto(assignment);
        }

            public async Task<PaginatedResponseDto<AssignmentDto>> GetAssignmentsAsync(
                Guid? classId = null,
                Guid? subjectId = null,
                string? status = null,
                string? searchTerm = null,
                int page = 1,
                int limit = 10)
                {
                    var query = _context.Assignments
                        .Include(a => a.Class)
                        .Include(a => a.Subject)
                        .Include(a => a.CreatedBy)
                        .Include(a => a.Submissions)
                        .Include(a => a.Attachments)
                        .AsQueryable();

                    if (classId.HasValue)
                        query = query.Where(a => a.ClassId == classId.Value);

                    if (subjectId.HasValue)
                        query = query.Where(a => a.SubjectId == subjectId.Value);

                    if (!string.IsNullOrEmpty(status) && Enum.TryParse<AssignmentStatus>(status, out var statusEnum))
                        query = query.Where(a => a.Status == statusEnum);

                    // Search by title
                    if (!string.IsNullOrEmpty(searchTerm))
                    {
                        searchTerm = searchTerm.ToLower();
                        query = query.Where(a => a.Title.ToLower().Contains(searchTerm));
                    }

                    var total = await query.CountAsync();

                    var assignments = await query
                        .OrderByDescending(a => a.CreatedAt)
                        .Skip((page - 1) * limit)
                        .Take(limit)
                        .ToListAsync();

                    return new PaginatedResponseDto<AssignmentDto>
                    {
                        Data = assignments.Select(MapToDto).ToList(),
                        Total = total,
                        Page = page,
                        Limit = limit
                    };
                }

        public async Task<IEnumerable<AssignmentDto>> GetAssignmentsForStudentAsync(Guid studentId)
        {
            var studentClasses = await _context.StudentClasses
                .Where(sc => sc.StudentId == studentId)
                .Select(sc => sc.ClassId)
                .ToListAsync();

            var assignments = await _context.Assignments
                .Include(a => a.Subject)
                .Include(a => a.CreatedBy)
                .Include(a => a.Submissions)
                .Where(a => studentClasses.Contains(a.ClassId) && a.Status == AssignmentStatus.Published)
                .OrderByDescending(a => a.Deadline)
                .ToListAsync();

            return assignments.Select(MapToDto);
        }

        public async Task<IEnumerable<AssignmentDto>> GetTeacherAssignmentsAsync(Guid teacherId)
        {
            var assignments = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.Submissions)
                .Where(a => a.CreatedById == teacherId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return assignments.Select(MapToDto);
        }

        public async Task<AssignmentDto> PublishAssignmentAsync(Guid id, Guid teacherId)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            
            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found");
            
            if (assignment.CreatedById != teacherId)
                throw new UnauthorizedAccessException("You can only publish your own assignments");

            if (assignment.Status != AssignmentStatus.Draft)
                throw new InvalidOperationException("Only draft assignments can be published");

            assignment.Status = AssignmentStatus.Published;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Assignment {id} published");
            
            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task<AssignmentDto> CloseAssignmentAsync(Guid id, Guid teacherId)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            
            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found");
            
            if (assignment.CreatedById != teacherId)
                throw new UnauthorizedAccessException("You can only close your own assignments");

            assignment.Status = AssignmentStatus.Closed;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Assignment {id} closed");
            
            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task<DashboardStatsDto> GetTeacherDashboardStatsAsync(Guid teacherId)
        {
            var assignments = await _context.Assignments
                .Include(a => a.Submissions)
                .Where(a => a.CreatedById == teacherId)
                .ToListAsync();

            var totalSubmissions = assignments.Sum(a => a.Submissions.Count);
            var pendingGrading = assignments.Sum(a => 
                a.Submissions.Count(s => s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.LateSubmitted));
            
            var gradedSubmissions = assignments
                .SelectMany(a => a.Submissions)
                .Where(s => s.Marks.HasValue)
                .ToList();

            var averageGrade = gradedSubmissions.Any() 
                ? gradedSubmissions.Average(s => s.Marks!.Value) 
                : 0;

            return new DashboardStatsDto
            {
                TotalAssignments = assignments.Count,
                TotalSubmissions = totalSubmissions,
                PendingGrading = pendingGrading,
                AverageGrade = averageGrade
            };
        }

        private static AssignmentDto MapToDto(Assignment assignment)
        {
            return new AssignmentDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                Deadline = assignment.Deadline,
                MaximumMarks = assignment.MaximumMarks,
                Status = assignment.Status.ToString(),
                ClassId = assignment.ClassId,
                ClassName = assignment.Class?.Name,
                SubjectId = assignment.SubjectId,
                SubjectName = assignment.Subject?.Name,
                CreatedById = assignment.CreatedById,
                CreatedByName = $"{assignment.CreatedBy?.FirstName} {assignment.CreatedBy?.LastName}",
                CreatedAt = assignment.CreatedAt,
                UpdatedAt = assignment.UpdatedAt,
                SubmissionCount = assignment.Submissions?.Count ?? 0,
                GradedCount = assignment.Submissions?.Count(s => s.Status == SubmissionStatus.Graded) ?? 0,
                Attachments = assignment.Attachments?.Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    ContentType = a.ContentType,
                    FileSize = a.FileSize,
                    UploadedAt = a.UploadedAt
                }).ToList() ?? new List<AttachmentDto>()
            };
        }

        public async Task<bool> IsAssignmentExistsAsync(Guid id)
        {
            return await _context.Assignments.AnyAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<ClassDto>> GetTeacherClassesAsync(Guid teacherId)
        {
            var classes = await _context.Classes
                .Include(c => c.StudentClasses)
                .Include(c => c.Subjects)
                .Where(c => c.Subjects.Any(s =>
                    s.TeacherAssignments.Any(ta => ta.TeacherId == teacherId)))
                .OrderBy(c => c.Name)
                .ToListAsync();

            return classes.Select(c => new ClassDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                AcademicYear = c.AcademicYear,
                IsActive = c.IsActive,
                StudentCount = c.StudentClasses.Count,
                SubjectCount = c.Subjects.Count,
                CreatedAt = c.CreatedAt
            });
        }

    }
}