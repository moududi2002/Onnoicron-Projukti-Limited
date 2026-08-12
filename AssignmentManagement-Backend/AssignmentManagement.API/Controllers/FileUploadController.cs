// API/Controllers/FileUploadController.cs
using AssignmentManagement.Application.Interfaces;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileUploadController : ControllerBase
    {
        private readonly IFileUploadService _fileUploadService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(
            IFileUploadService fileUploadService, 
            ApplicationDbContext context,
            ILogger<FileUploadController> logger)
        {
            _fileUploadService = fileUploadService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("assignment/{assignmentId}")]
        [Authorize(Policy = "TeacherOnly")]
        public async Task<ActionResult<AssignmentAttachment>> UploadAssignmentFile(
            Guid assignmentId, IFormFile file)
        {
            try
            {
                var assignment = await _context.Assignments.FindAsync(assignmentId);
                if (assignment == null)
                    return NotFound(new { message = "Assignment not found" });

                // Check if teacher owns this assignment
                var teacherId = GetCurrentUserId();
                if (assignment.CreatedById != teacherId && User.FindFirstValue(ClaimTypes.Role) != "Admin")
                    return Forbid();

                var result = await _fileUploadService.UploadFileAsync(file, "assignments");

                var attachment = new AssignmentAttachment
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = assignmentId,
                    FileName = result.FileName,
                    FileUrl = result.FileUrl,
                    ContentType = result.ContentType,
                    FileSize = result.FileSize,
                    UploadedAt = DateTime.UtcNow
                };

                _context.AssignmentAttachments.Add(attachment);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"File uploaded for assignment {assignmentId}: {result.FileName}");

                return Ok(attachment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading assignment file");
                return StatusCode(500, new { message = "An error occurred while uploading file" });
            }
        }

        [HttpPost("submission/{submissionId}")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<ActionResult<SubmissionAttachment>> UploadSubmissionFile(
            Guid submissionId, IFormFile file)
        {
            try
            {
                var submission = await _context.Submissions.FindAsync(submissionId);
                if (submission == null)
                    return NotFound(new { message = "Submission not found" });

                // Check if student owns this submission
                var studentId = GetCurrentUserId();
                if (submission.StudentId != studentId)
                    return Forbid();

                // Check if submission is still editable
                if (submission.Status == Domain.Entities.SubmissionStatus.Graded)
                    return BadRequest(new { message = "Cannot upload files to a graded submission" });

                var result = await _fileUploadService.UploadFileAsync(file, "submissions");

                var attachment = new SubmissionAttachment
                {
                    Id = Guid.NewGuid(),
                    SubmissionId = submissionId,
                    FileName = result.FileName,
                    FileUrl = result.FileUrl,
                    ContentType = result.ContentType,
                    FileSize = result.FileSize,
                    UploadedAt = DateTime.UtcNow
                };

                _context.SubmissionAttachments.Add(attachment);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"File uploaded for submission {submissionId}: {result.FileName}");

                return Ok(attachment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading submission file");
                return StatusCode(500, new { message = "An error occurred while uploading file" });
            }
        }

        [HttpGet("download")]
        [AllowAnonymous] // Or [Authorize] based on your requirements
        public IActionResult DownloadFile([FromQuery] string fileUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(fileUrl))
                    return BadRequest(new { message = "File URL is required" });

                if (!_fileUploadService.FileExists(fileUrl))
                    return NotFound(new { message = "File not found" });

                var filePath = _fileUploadService.GetFilePath(fileUrl);
                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var fileName = Path.GetFileName(filePath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file");
                return StatusCode(500, new { message = "An error occurred while downloading file" });
            }
        }

        [HttpDelete("assignment/{attachmentId}")]
        [Authorize(Policy = "TeacherOnly")]
        public async Task<IActionResult> DeleteAssignmentFile(Guid attachmentId)
        {
            try
            {
                var attachment = await _context.AssignmentAttachments
                    .Include(a => a.Assignment)
                    .FirstOrDefaultAsync(a => a.Id == attachmentId);

                if (attachment == null)
                    return NotFound(new { message = "Attachment not found" });

                var teacherId = GetCurrentUserId();
                if (attachment.Assignment.CreatedById != teacherId && User.FindFirstValue(ClaimTypes.Role) != "Admin")
                    return Forbid();

                await _fileUploadService.DeleteFileAsync(attachment.FileUrl);
                _context.AssignmentAttachments.Remove(attachment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "File deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting assignment file");
                return StatusCode(500, new { message = "An error occurred while deleting file" });
            }
        }

        [HttpDelete("submission/{attachmentId}")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<IActionResult> DeleteSubmissionFile(Guid attachmentId)
        {
            try
            {
                var attachment = await _context.SubmissionAttachments
                    .Include(a => a.Submission)
                    .FirstOrDefaultAsync(a => a.Id == attachmentId);

                if (attachment == null)
                    return NotFound(new { message = "Attachment not found" });

                var studentId = GetCurrentUserId();
                if (attachment.Submission.StudentId != studentId)
                    return Forbid();

                if (attachment.Submission.Status == Domain.Entities.SubmissionStatus.Graded)
                    return BadRequest(new { message = "Cannot delete files from a graded submission" });

                await _fileUploadService.DeleteFileAsync(attachment.FileUrl);
                _context.SubmissionAttachments.Remove(attachment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "File deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting submission file");
                return StatusCode(500, new { message = "An error occurred while deleting file" });
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLower();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".txt" => "text/plain",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".zip" => "application/zip",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                _ => "application/octet-stream",
            };
        }

        private Guid GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userId, out var id))
                throw new UnauthorizedAccessException("Invalid user ID.");

            return id;
        }

       
    }
}