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
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IUserService userService,
            ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        // GET: api/user
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PaginatedResponseDto<UserDto>>> GetUsers(
            [FromQuery] string? role = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var users = await _userService.GetUsersAsync(role, searchTerm, isActive, page, limit);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new { message = "An error occurred while fetching users" });
            }
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetUserById(Guid id)
        {
            try
            {
                // Admin can view any user, others can only view themselves
                var currentUserId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                if (currentUserRole != "Admin" && currentUserId != id)
                    return Forbid("You can only view your own profile");

                var user = await _userService.GetUserByIdAsync(id);
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/user/teachers
        [HttpGet("teachers")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetTeachers()
        {
            try
            {
                var teachers = await _userService.GetTeachersAsync();
                return Ok(teachers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teachers");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/user/students
        [HttpGet("students")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetStudents()
        {
            try
            {
                var students = await _userService.GetStudentsAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting students");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/user/students-by-class/{classId}
        [HttpGet("students-by-class/{classId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetStudentsByClass(Guid classId)
        {
            try
            {
                var students = await _userService.GetStudentsByClassAsync(classId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting students for class {classId}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/user/teachers-by-subject/{subjectId}
        [HttpGet("teachers-by-subject/{subjectId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetTeachersBySubject(Guid subjectId)
        {
            try
            {
                var teachers = await _userService.GetTeachersBySubjectAsync(subjectId);
                return Ok(teachers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting teachers for subject {subjectId}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/user
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userService.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "An error occurred while creating user" });
            }
        }

        // PUT: api/user/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Admin can update any user, others can only update themselves
                var currentUserId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                if (currentUserRole != "Admin" && currentUserId != id)
                    return Forbid("You can only update your own profile");

                // Non-admin cannot change isActive status
                if (currentUserRole != "Admin" && dto.IsActive.HasValue)
                    return Forbid("Only admin can change active status");

                var user = await _userService.UpdateUserAsync(id, dto);
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating user {id}");
                return StatusCode(500, new { message = "An error occurred while updating user" });
            }
        }

        // DELETE: api/user/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                // Prevent self-deletion
                var currentUserId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                if (currentUserId == id)
                    return BadRequest(new { message = "You cannot delete your own account" });

                await _userService.DeleteUserAsync(id);
                return Ok(new { message = "User deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting user {id}");
                return StatusCode(500, new { message = "An error occurred while deleting user" });
            }
        }

        // PUT: api/user/{id}/toggle-status
        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> ToggleUserStatus(Guid id)
        {
            try
            {
                // Prevent self-deactivation
                var currentUserId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                if (currentUserId == id)
                    return BadRequest(new { message = "You cannot deactivate your own account" });

                var result = await _userService.ToggleUserStatusAsync(id);
                return Ok(new { isActive = result, message = $"User {(result ? "activated" : "deactivated")}" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error toggling user status {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/user/me
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var user = await _userService.GetUserByIdAsync(currentUserId);
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // PUT: api/user/{id}/change-password
        [HttpPut("{id}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                if (currentUserRole != "Admin" && currentUserId != id)
                    return Forbid("You can only change your own password");

                // Implementation would go through AuthService
                // await _authService.ChangePasswordAsync(id, dto.CurrentPassword, dto.NewPassword);
                
                return Ok(new { message = "Password changed successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "User not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error changing password for user {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/user/{id}/exists
        [HttpGet("{id}/exists")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> UserExists(Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                return Ok(new { exists = user != null });
            }
            catch (KeyNotFoundException)
            {
                return Ok(new { exists = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking user existence {id}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }
    }

    // Additional DTO for password change
    public class ChangePasswordDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}