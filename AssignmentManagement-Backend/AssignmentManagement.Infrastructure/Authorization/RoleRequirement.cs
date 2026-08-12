// Infrastructure/Authorization/RoleRequirement.cs
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AssignmentManagement.Infrastructure.Authorization
{
    public class RoleRequirement : IAuthorizationRequirement
    {
        public string[] Roles { get; }

        public RoleRequirement(params string[] roles)
        {
            Roles = roles;
        }
    }

    public class RoleHandler : AuthorizationHandler<RoleRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            RoleRequirement requirement)
        {
            var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != null && requirement.Roles.Contains(userRole))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}