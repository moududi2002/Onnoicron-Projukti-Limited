// API/Controllers/AssignmentController.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;



namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;
        private readonly ILogger<AssignmentController> _logger;
        private readonly ApplicationDbContext _context;

        public AssignmentController(
        IAssignmentService assignmentService,
        ILogger<AssignmentController> logger,
        ApplicationDbContext context)
    {
        _assignmentService = assignmentService;
        _logger = logger;
        _context = context;
    }

        // GET: api/assignment (Admin - all assignments with filters)
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<PaginatedResponseDto<AssignmentDto>>> GetAssignments(
            [FromQuery] Guid? classId = null,
            [FromQuery] Guid? subjectId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var assignments = await _assignmentService.GetAssignmentsAsync(
                    classId, subjectId, status, searchTerm, page, limit);

               
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting assignments");
                return StatusCode(500, new { message = "An error occurred while fetching assignments" });
            }
        }

        // GET: api/assignment/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AssignmentDto>> GetAssignment(Guid id)
        {
            try
            {
                var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
                return Ok(assignment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Assignment not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting assignment {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/assignment
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentDto>> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var teacherId = GetCurrentUserId();
                var assignment = await _assignmentService.CreateAssignmentAsync(dto, teacherId);
                return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignment);
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
                _logger.LogError(ex, "Error creating assignment");
                return StatusCode(500, new { message = "An error occurred while creating assignment" });
            }
        }

        // PUT: api/assignment/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentDto>> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var assignment = await _assignmentService.UpdateAssignmentAsync(id, dto, teacherId);
                return Ok(assignment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Assignment not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating assignment {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // DELETE: api/assignment/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                await _assignmentService.DeleteAssignmentAsync(id, teacherId);
                return Ok(new { message = "Assignment deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Assignment not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting assignment {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/assignment/{id}/publish
        [HttpPost("{id}/publish")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentDto>> PublishAssignment(Guid id)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var assignment = await _assignmentService.PublishAssignmentAsync(id, teacherId);
                return Ok(assignment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Assignment not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error publishing assignment {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/assignment/{id}/close
        [HttpPost("{id}/close")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentDto>> CloseAssignment(Guid id)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var assignment = await _assignmentService.CloseAssignmentAsync(id, teacherId);
                return Ok(assignment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Assignment not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error closing assignment {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/assignment/student
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetStudentAssignments()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userId, out var studentId))
                    {
                        return Unauthorized(new { message = "Invalid user ID" });
                    }       
                var assignments = await _assignmentService.GetAssignmentsForStudentAsync(studentId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student assignments");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/assignment/teacher
        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetTeacherAssignments()
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var assignments = await _assignmentService.GetTeacherAssignmentsAsync(teacherId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher assignments");
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


        // GET: api/assignment/teacher/classes
        [HttpGet("teacher/classes")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<ClassDto>>> GetTeacherClasses()
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var classes = await _context.TeacherAssignments
                    .Where(ta => ta.TeacherId == teacherId)
                    .Include(ta => ta.Subject)
                    .ThenInclude(s => s.Class)
                    .Select(ta => ta.Subject.Class)
                    .Distinct()
                    .Select(c => new ClassDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        AcademicYear = c.AcademicYear,
                        IsActive = c.IsActive,
                        StudentCount = c.StudentClasses.Count,
                        SubjectCount = c.Subjects.Count,
                        CreatedAt = c.CreatedAt
                    })
                    .ToListAsync();

                return Ok(classes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher classes");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/assignment/teacher/classes/{classId}/subjects
        [HttpGet("teacher/classes/{classId}/subjects")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<SubjectDto>>> GetTeacherSubjectsByClass(Guid classId)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var subjects = await _context.TeacherAssignments
                    .Where(ta => ta.TeacherId == teacherId && ta.Subject.ClassId == classId)
                    .Include(ta => ta.Subject)
                        .ThenInclude(s => s.Class)
                    .Select(ta => new SubjectDto
                    {
                        Id = ta.Subject.Id,
                        Name = ta.Subject.Name,
                        Code = ta.Subject.Code,
                        ClassId = ta.Subject.ClassId,
                        ClassName = ta.Subject.Class.Name,
                        IsActive = ta.Subject.IsActive
                    })
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting teacher subjects for class {classId}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

    }
}