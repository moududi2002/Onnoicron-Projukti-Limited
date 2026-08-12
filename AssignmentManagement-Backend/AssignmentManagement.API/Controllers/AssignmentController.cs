// API/Controllers/AssignmentController.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AssignmentManagement.Application.Interfaces;

namespace AssignmentManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpPost]
        [Authorize(Policy = "TeacherOnly")]
        public async Task<ActionResult<AssignmentDto>> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            var teacherId = GetCurrentUserId();
            var assignment = await _assignmentService.CreateAssignmentAsync(dto, teacherId);
            return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignment);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AssignmentDto>> GetAssignment(Guid id)
        {
            var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
            if (assignment == null)
                return NotFound();
            return Ok(assignment);
        }

        [HttpGet("student")]
        [Authorize(Policy = "StudentOnly")]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetStudentAssignments()
        {
            var studentId = GetCurrentUserId();
            var assignments = await _assignmentService.GetAssignmentsForStudentAsync(studentId);
            return Ok(assignments);
        }

        [HttpPost("{id}/publish")]
        [Authorize(Policy = "TeacherOnly")]
        public async Task<ActionResult<AssignmentDto>> PublishAssignment(Guid id)
        {
            var teacherId = GetCurrentUserId();
            var assignment = await _assignmentService.PublishAssignmentAsync(id, teacherId);
            return Ok(assignment);
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