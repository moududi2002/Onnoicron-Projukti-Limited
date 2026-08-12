// Domain/Entities/TeacherAssignment.cs (Junction table)
namespace AssignmentManagement.Domain.Entities
{
    public class TeacherAssignment
    {
        public Guid TeacherId { get; set; }
        public Guid SubjectId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public User Teacher { get; set; } = null!;
        public Subject Subject { get; set; } = null!;
    }
}