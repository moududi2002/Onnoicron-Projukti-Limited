// Domain/Entities/StudentClass.cs (Junction table)
namespace AssignmentManagement.Domain.Entities
{
    public class StudentClass
    {
        public Guid StudentId { get; set; }
        public Guid ClassId { get; set; }
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        public User Student { get; set; } = null!;
        public Class Class { get; set; } = null!;
    }
}