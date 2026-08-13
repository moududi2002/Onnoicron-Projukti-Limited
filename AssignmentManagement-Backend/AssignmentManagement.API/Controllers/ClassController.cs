// API/Controllers/ClassController.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClassController : ControllerBase
    {
        private readonly IClassService _classService;
        private readonly ILogger<ClassController> _logger;

        public ClassController(
            IClassService classService,
            ILogger<ClassController> logger)
        {
            _classService = classService;
            _logger = logger;
        }

        // GET: api/class
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<PaginatedResponseDto<ClassDto>>> GetClasses(
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var classes = await _classService.GetClassesAsync(searchTerm, isActive, page, limit);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting classes");
                return StatusCode(500, new { message = "An error occurred while fetching classes" });
            }
        }

        // GET: api/class/active
        [HttpGet("active")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<ClassDto>>> GetActiveClasses()
        {
            try
            {
                var classes = await _classService.GetActiveClassesAsync();
                return Ok(classes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active classes");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/class/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ClassDto>> GetClassById(Guid id)
        {
            try
            {
                var classEntity = await _classService.GetClassByIdAsync(id);
                return Ok(classEntity);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Class not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting class {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/class
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassDto>> CreateClass([FromBody] CreateClassDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var classEntity = await _classService.CreateClassAsync(dto);
                return CreatedAtAction(nameof(GetClassById), new { id = classEntity.Id }, classEntity);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating class");
                return StatusCode(500, new { message = "An error occurred while creating class" });
            }
        }

        // PUT: api/class/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassDto>> UpdateClass(Guid id, [FromBody] UpdateClassDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var classEntity = await _classService.UpdateClassAsync(id, dto);
                return Ok(classEntity);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Class not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating class {id}");
                return StatusCode(500, new { message = "An error occurred while updating class" });
            }
        }

        // DELETE: api/class/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteClass(Guid id)
        {
            try
            {
                await _classService.DeleteClassAsync(id);
                return Ok(new { message = "Class deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Class not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting class {id}");
                return StatusCode(500, new { message = "An error occurred while deleting class" });
            }
        }

        // PUT: api/class/{id}/toggle-status
        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> ToggleClassStatus(Guid id)
        {
            try
            {
                var result = await _classService.ToggleClassStatusAsync(id);
                return Ok(new { isActive = result, message = $"Class {(result ? "activated" : "deactivated")}" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Class not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error toggling class status {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/class/{id}/students
        [HttpGet("{id}/students")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetStudentsInClass(Guid id)
        {
            try
            {
                var students = await _classService.GetStudentsInClassAsync(id);
                return Ok(students);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Class not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting students for class {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/class/{id}/add-student/{studentId}
        [HttpPost("{id}/add-student/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddStudentToClass(Guid id, Guid studentId)
        {
            try
            {
                await _classService.AddStudentToClassAsync(id, studentId);
                return Ok(new { message = "Student added to class successfully" });
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
                _logger.LogError(ex, $"Error adding student {studentId} to class {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // DELETE: api/class/{id}/remove-student/{studentId}
        [HttpDelete("{id}/remove-student/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveStudentFromClass(Guid id, Guid studentId)
        {
            try
            {
                await _classService.RemoveStudentFromClassAsync(id, studentId);
                return Ok(new { message = "Student removed from class successfully" });
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
                _logger.LogError(ex, $"Error removing student {studentId} from class {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/class/{id}/student-count
        [HttpGet("{id}/student-count")]
        [Authorize]
        public async Task<ActionResult<int>> GetStudentCount(Guid id)
        {
            try
            {
                var count = await _classService.GetStudentCountAsync(id);
                return Ok(new { studentCount = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting student count for class {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }
    }
}