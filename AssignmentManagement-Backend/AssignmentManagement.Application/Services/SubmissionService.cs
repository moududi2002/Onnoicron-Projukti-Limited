// Application/Services/SubmissionService.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AssignmentManagement.Application.Interfaces;

namespace AssignmentManagement.Application.Services
{
    public class SubmissionService : ISubmissionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubmissionService> _logger;

        public SubmissionService(ApplicationDbContext context, ILogger<SubmissionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SubmissionDto> SubmitAssignmentAsync(CreateSubmissionDto dto, Guid studentId)
        {
            var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
            
            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found");

            if (assignment.Status != AssignmentStatus.Published)
                throw new InvalidOperationException("Cannot submit to an unpublished assignment");

            // Check if student belongs to the class
            var isStudentInClass = await _context.StudentClasses
                .AnyAsync(sc => sc.StudentId == studentId && sc.ClassId == assignment.ClassId);

            if (!isStudentInClass)
                throw new UnauthorizedAccessException("You are not enrolled in this class");

            // Check for existing submission
            var existingSubmission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);

            if (existingSubmission != null)
                throw new InvalidOperationException("You have already submitted this assignment");

            var isLate = DateTime.UtcNow > assignment.Deadline;

            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = dto.AssignmentId,
                StudentId = studentId,
                Content = dto.Content,
                Status = isLate ? SubmissionStatus.LateSubmitted : SubmissionStatus.Submitted,
                SubmittedAt = DateTime.UtcNow
            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Submission {submission.Id} created by student {studentId} for assignment {dto.AssignmentId}");
            
            return await GetSubmissionByIdAsync(submission.Id);
        }

        public async Task<SubmissionDto> UpdateSubmissionAsync(Guid id, UpdateSubmissionDto dto, Guid studentId)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Attachments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
                throw new KeyNotFoundException("Submission not found");

            if (submission.StudentId != studentId)
                throw new UnauthorizedAccessException("You can only update your own submissions");

            if (submission.Status == SubmissionStatus.Graded)
                throw new InvalidOperationException("Cannot update a graded submission");

            // Check deadline
            if (DateTime.UtcNow > submission.Assignment.Deadline)
                throw new InvalidOperationException("Cannot update submission after deadline");

            submission.Content = dto.Content;
            submission.UpdatedAt = DateTime.UtcNow;

            // Remove attachments that are not in the keep list
            if (dto.KeepAttachmentIds != null)
            {
                var attachmentsToRemove = submission.Attachments
                    .Where(a => !dto.KeepAttachmentIds.Contains(a.Id))
                    .ToList();

                _context.SubmissionAttachments.RemoveRange(attachmentsToRemove);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Submission {id} updated by student {studentId}");

            return await GetSubmissionByIdAsync(submission.Id);
        }

        public async Task<SubmissionDto> GradeSubmissionAsync(Guid id, GradeSubmissionDto dto, Guid teacherId)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
                throw new KeyNotFoundException("Submission not found");

            if (submission.Assignment.CreatedById != teacherId)
                throw new UnauthorizedAccessException("You can only grade submissions for your assignments");

            if (dto.Marks > submission.Assignment.MaximumMarks)
                throw new InvalidOperationException($"Marks cannot exceed maximum marks ({submission.Assignment.MaximumMarks})");

            if (dto.Marks < 0)
                throw new InvalidOperationException("Marks cannot be negative");

            submission.Marks = dto.Marks;
            submission.Feedback = dto.Feedback;
            submission.Status = dto.Status;
            submission.GradedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Submission {id} graded by teacher {teacherId}. Marks: {dto.Marks}, Status: {dto.Status}");

            return await GetSubmissionByIdAsync(submission.Id);
        }

        public async Task<SubmissionDto> GetSubmissionByIdAsync(Guid id)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .Include(s => s.Attachments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
                throw new KeyNotFoundException("Submission not found");

            return MapToDto(submission);
        }

        public async Task<PaginatedResponseDto<SubmissionDto>> GetSubmissionsForAssignmentAsync(
            Guid assignmentId, int page = 1, int limit = 10)
        {
            var query = _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.Attachments)
                .Where(s => s.AssignmentId == assignmentId)
                .AsQueryable();

            var total = await query.CountAsync();

            var submissions = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PaginatedResponseDto<SubmissionDto>
            {
                Data = submissions.Select(MapToDto).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<IEnumerable<SubmissionDto>> GetStudentSubmissionsAsync(Guid studentId)
        {
            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                    .ThenInclude(a => a.Subject)
                .Include(s => s.Attachments)
                .Where(s => s.StudentId == studentId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return submissions.Select(MapToDto);
        }

        public async Task<bool> HasStudentSubmittedAsync(Guid assignmentId, Guid studentId)
        {
            return await _context.Submissions
                .AnyAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);
        }

        public async Task<DashboardStatsDto> GetStudentDashboardStatsAsync(Guid studentId)
        {
            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .Where(s => s.StudentId == studentId)
                .ToListAsync();

            var totalAssignments = await _context.Assignments
                .Join(_context.StudentClasses,
                    a => a.ClassId,
                    sc => sc.ClassId,
                    (a, sc) => new { Assignment = a, StudentClass = sc })
                .Where(x => x.StudentClass.StudentId == studentId && x.Assignment.Status == AssignmentStatus.Published)
                .CountAsync();

            var gradedSubmissions = submissions.Where(s => s.Marks.HasValue).ToList();
            var averageGrade = gradedSubmissions.Any() 
                ? gradedSubmissions.Average(s => s.Marks!.Value) 
                : 0;

            return new DashboardStatsDto
            {
                TotalAssignments = totalAssignments,
                TotalSubmissions = submissions.Count,
                PendingGrading = totalAssignments - submissions.Count,
                AverageGrade = averageGrade
            };
        }


        public async Task<bool> CanSubmitAssignmentAsync(Guid assignmentId, Guid studentId)
        {
            // Check if assignment exists and is published
            var assignment = await _context.Assignments.FindAsync(assignmentId);
            if (assignment == null || assignment.Status != Domain.Entities.AssignmentStatus.Published)
                return false;

            // Check if student is enrolled in the class
            var isEnrolled = await _context.StudentClasses
                .AnyAsync(sc => sc.StudentId == studentId && sc.ClassId == assignment.ClassId);
            
            if (!isEnrolled)
                return false;

            // Check if already submitted
            var alreadySubmitted = await _context.Submissions
                .AnyAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);
            
            if (alreadySubmitted)
                return false;

            // Check if deadline has passed
            if (DateTime.UtcNow > assignment.Deadline && assignment.Status != Domain.Entities.AssignmentStatus.Closed)
                return true; // Allow late submission but mark it

            return true;
        }

        private static SubmissionDto MapToDto(Submission submission)
        {
            return new SubmissionDto
            {
                Id = submission.Id,
                AssignmentId = submission.AssignmentId,
                AssignmentTitle = submission.Assignment?.Title,
                StudentId = submission.StudentId,
                StudentName = $"{submission.Student?.FirstName} {submission.Student?.LastName}",
                StudentEmail = submission.Student?.Email,
                Content = submission.Content,
                Status = submission.Status.ToString(),
                Marks = submission.Marks,
                MaximumMarks = submission.Assignment?.MaximumMarks,
                Feedback = submission.Feedback,
                SubmittedAt = submission.SubmittedAt,
                UpdatedAt = submission.UpdatedAt,
                GradedAt = submission.GradedAt,
                Attachments = submission.Attachments?.Select(a => new AttachmentDto
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

        public async Task<PaginatedResponseDto<SubmissionDto>> GetAllSubmissionsAsync(
            string? status = null,
            string? searchTerm = null,
            Guid? assignmentId = null,
            Guid? studentId = null,
            int page = 1,
            int limit = 10)
        {
            var query = _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.Assignment)
                .Include(s => s.Attachments)
                .AsQueryable();

            // Filter by status
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<SubmissionStatus>(status, out var statusEnum))
                query = query.Where(s => s.Status == statusEnum);

            // Filter by assignment
            if (assignmentId.HasValue)
                query = query.Where(s => s.AssignmentId == assignmentId.Value);

            // Filter by student
            if (studentId.HasValue)
                query = query.Where(s => s.StudentId == studentId.Value);

            // Search by student name or assignment title
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(s =>
                    (s.Student.FirstName + " " + s.Student.LastName).ToLower().Contains(searchTerm) ||
                    s.Assignment.Title.ToLower().Contains(searchTerm));
            }

            var total = await query.CountAsync();

            var submissions = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PaginatedResponseDto<SubmissionDto>
            {
                Data = submissions.Select(MapToDto).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }
    }
}