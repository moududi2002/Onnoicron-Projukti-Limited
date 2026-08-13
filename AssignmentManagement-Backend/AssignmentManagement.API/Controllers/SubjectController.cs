// API/Controllers/SubjectController.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        private readonly ILogger<SubjectController> _logger;

        public SubjectController(
            ISubjectService subjectService,
            ILogger<SubjectController> logger)
        {
            _subjectService = subjectService;
            _logger = logger;
        }

        // GET: api/subject
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<PaginatedResponseDto<SubjectDto>>> GetSubjects(
            [FromQuery] Guid? classId = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var subjects = await _subjectService.GetSubjectsAsync(classId, searchTerm, isActive, page, limit);
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subjects");
                return StatusCode(500, new { message = "An error occurred while fetching subjects" });
            }
        }

        // GET: api/subject/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<SubjectDto>> GetSubjectById(Guid id)
        {
            try
            {
                var subject = await _subjectService.GetSubjectByIdAsync(id);
                return Ok(subject);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Subject not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting subject {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/subject/class/{classId}
        [HttpGet("class/{classId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SubjectDto>>> GetSubjectsByClass(Guid classId)
        {
            try
            {
                var subjects = await _subjectService.GetSubjectsByClassAsync(classId);
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting subjects for class {classId}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/subject/teacher
        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<SubjectDto>>> GetTeacherSubjects()
        {
            try
            {
                var teacherId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var subjects = await _subjectService.GetTeacherSubjectsAsync(teacherId);
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher subjects");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/subject
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectDto>> CreateSubject([FromBody] CreateSubjectDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var subject = await _subjectService.CreateSubjectAsync(dto);
                return CreatedAtAction(nameof(GetSubjectById), new { id = subject.Id }, subject);
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
                _logger.LogError(ex, "Error creating subject");
                return StatusCode(500, new { message = "An error occurred while creating subject" });
            }
        }

        // PUT: api/subject/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectDto>> UpdateSubject(Guid id, [FromBody] UpdateSubjectDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var subject = await _subjectService.UpdateSubjectAsync(id, dto);
                return Ok(subject);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Subject not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating subject {id}");
                return StatusCode(500, new { message = "An error occurred while updating subject" });
            }
        }

        // DELETE: api/subject/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubject(Guid id)
        {
            try
            {
                await _subjectService.DeleteSubjectAsync(id);
                return Ok(new { message = "Subject deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Subject not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting subject {id}");
                return StatusCode(500, new { message = "An error occurred while deleting subject" });
            }
        }

        // PUT: api/subject/{id}/toggle-status
        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> ToggleSubjectStatus(Guid id)
        {
            try
            {
                var result = await _subjectService.ToggleSubjectStatusAsync(id);
                return Ok(new { isActive = result, message = $"Subject {(result ? "activated" : "deactivated")}" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Subject not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error toggling subject status {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/subject/{id}/assign-teacher/{teacherId}
        [HttpPost("{id}/assign-teacher/{teacherId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTeacherToSubject(Guid id, Guid teacherId)
        {
            try
            {
                await _subjectService.AssignTeacherToSubjectAsync(id, teacherId);
                return Ok(new { message = "Teacher assigned to subject successfully" });
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
                _logger.LogError(ex, $"Error assigning teacher {teacherId} to subject {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // DELETE: api/subject/{id}/remove-teacher/{teacherId}
        [HttpDelete("{id}/remove-teacher/{teacherId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveTeacherFromSubject(Guid id, Guid teacherId)
        {
            try
            {
                await _subjectService.RemoveTeacherFromSubjectAsync(id, teacherId);
                return Ok(new { message = "Teacher removed from subject successfully" });
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
                _logger.LogError(ex, $"Error removing teacher {teacherId} from subject {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/subject/{id}/teachers
        [HttpGet("{id}/teachers")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetTeachersBySubject(Guid id)
        {
            try
            {
                var teachers = await _subjectService.GetTeachersBySubjectAsync(id);
                return Ok(teachers);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Subject not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting teachers for subject {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/subject/{id}/exists
        [HttpGet("{id}/exists")]
        [Authorize]
        public async Task<ActionResult<bool>> SubjectExists(Guid id)
        {
            try
            {
                var exists = await _subjectService.IsSubjectExistsAsync(id);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking subject existence {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }
    }
}