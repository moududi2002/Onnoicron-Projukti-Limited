// API/Controllers/AssignmentController.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubmissionController : ControllerBase
    {
        private readonly ISubmissionService _submissionService;
        private readonly ILogger<SubmissionController> _logger;

        public SubmissionController(
            ISubmissionService submissionService,
            ILogger<SubmissionController> logger)
        {
            _submissionService = submissionService;
            _logger = logger;
        }

        // GET: api/submission (Admin - all submissions with filters)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PaginatedResponseDto<SubmissionDto>>> GetAllSubmissions(
            [FromQuery] string? status = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] Guid? assignmentId = null,
            [FromQuery] Guid? studentId = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var submissions = await _submissionService.GetAllSubmissionsAsync(
                    status, searchTerm, assignmentId, studentId, page, limit);
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all submissions");
                return StatusCode(500, new { message = "An error occurred while fetching submissions" });
            }
        }

        // GET: api/submission/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<SubmissionDto>> GetSubmission(Guid id)
        {
            try
            {
                var submission = await _submissionService.GetSubmissionByIdAsync(id);
                return Ok(submission);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Submission not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting submission {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/submission/assignment/{assignmentId}
        [HttpGet("assignment/{assignmentId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<PaginatedResponseDto<SubmissionDto>>> GetSubmissionsForAssignment(
            Guid assignmentId,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var submissions = await _submissionService.GetSubmissionsForAssignmentAsync(assignmentId, page, limit);
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting submissions for assignment {assignmentId}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/submission/student
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetStudentSubmissions()
        {
            try
            {
                var studentId = GetCurrentUserId();
                var submissions = await _submissionService.GetStudentSubmissionsAsync(studentId);
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student submissions");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/submission
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<SubmissionDto>> CreateSubmission([FromBody] CreateSubmissionDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var studentId = GetCurrentUserId();
                var submission = await _submissionService.SubmitAssignmentAsync(dto, studentId);
                return CreatedAtAction(nameof(GetSubmission), new { id = submission.Id }, submission);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating submission");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // PUT: api/submission/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<SubmissionDto>> UpdateSubmission(Guid id, [FromBody] UpdateSubmissionDto dto)
        {
            try
            {
                var studentId = GetCurrentUserId();
                var submission = await _submissionService.UpdateSubmissionAsync(id, dto, studentId);
                return Ok(submission);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Submission not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating submission {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // PUT: api/submission/{id}/grade
        [HttpPut("{id}/grade")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<SubmissionDto>> GradeSubmission(Guid id, [FromBody] GradeSubmissionDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var teacherId = GetCurrentUserId();
                var submission = await _submissionService.GradeSubmissionAsync(id, dto, teacherId);
                return Ok(submission);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Submission not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error grading submission {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/submission/check/{assignmentId}
        [HttpGet("check/{assignmentId}")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<bool>> CheckSubmission(Guid assignmentId)
        {
            try
            {
                var studentId = GetCurrentUserId();
                var hasSubmitted = await _submissionService.HasStudentSubmittedAsync(assignmentId, studentId);
                return Ok(new { hasSubmitted });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking submission for assignment {assignmentId}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userId, out var parsedUserId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user ID.");
            }

            return parsedUserId;
        }

    }
}