// Infrastructure/Data/ApplicationDbContext.cs

using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Infrastructure.Data;



namespace AssignmentManagement.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Class> Classes => Set<Class>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<Assignment> Assignments => Set<Assignment>();
        public DbSet<Submission> Submissions => Set<Submission>();
        public DbSet<StudentClass> StudentClasses => Set<StudentClass>();
        public DbSet<TeacherAssignment> TeacherAssignments => Set<TeacherAssignment>();
        public DbSet<AssignmentAttachment> AssignmentAttachments => Set<AssignmentAttachment>();
        public DbSet<SubmissionAttachment> SubmissionAttachments => Set<SubmissionAttachment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // StudentClass composite key
            modelBuilder.Entity<StudentClass>()
                .HasKey(sc => new { sc.StudentId, sc.ClassId });

            modelBuilder.Entity<StudentClass>()
                .HasOne(sc => sc.Student)
                .WithMany(u => u.StudentClasses)
                .HasForeignKey(sc => sc.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentClass>()
                .HasOne(sc => sc.Class)
                .WithMany(c => c.StudentClasses)
                .HasForeignKey(sc => sc.ClassId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeacherAssignment composite key
            modelBuilder.Entity<TeacherAssignment>()
                .HasKey(ta => new { ta.TeacherId, ta.SubjectId });

            modelBuilder.Entity<TeacherAssignment>()
                .HasOne(ta => ta.Teacher)
                .WithMany(u => u.TeacherAssignments)
                .HasForeignKey(ta => ta.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherAssignment>()
                .HasOne(ta => ta.Subject)
                .WithMany(s => s.TeacherAssignments)
                .HasForeignKey(ta => ta.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // Submission constraints
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(s => s.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Student)
                .WithMany(u => u.Submissions)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Assignment constraints
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Class)
                .WithMany(c => c.Assignments)
                .HasForeignKey(a => a.ClassId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Subject)
                .WithMany(s => s.Assignments)
                .HasForeignKey(a => a.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.CreatedBy)
                .WithMany()
                .HasForeignKey(a => a.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // AssignmentAttachment
            modelBuilder.Entity<AssignmentAttachment>(entity =>
            {
                entity.HasOne(a => a.Assignment)
                    .WithMany(a => a.Attachments)
                    .HasForeignKey(a => a.AssignmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // SubmissionAttachment
            modelBuilder.Entity<SubmissionAttachment>(entity =>
            {
                entity.HasOne(s => s.Submission)
                    .WithMany(s => s.Attachments)
                    .HasForeignKey(s => s.SubmissionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}