using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(ApplicationDbContext context)
        {
            // Apply pending migrations
            await context.Database.MigrateAsync();

            // =========================
            // Admin user seed
            // =========================
            var adminUser = await context.Users
                .FirstOrDefaultAsync(u => u.Username == "admin");

            if (adminUser == null)
            {
                adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "admin",
                    Email = "admin@school.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Role = UserRole.Admin,
                    FirstName = "System",
                    LastName = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
            }

            // =========================
            // Teacher user seed
            // =========================
            var teacherUser = await context.Users
                .FirstOrDefaultAsync(u => u.Username == "teacher1");

            if (teacherUser == null)
            {
                teacherUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "teacher1",
                    Email = "teacher1@school.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
                    Role = UserRole.Teacher,
                    FirstName = "John",
                    LastName = "Smith",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(teacherUser);
            }

            // =========================
            // Student user seed
            // =========================
            var studentUser = await context.Users
                .FirstOrDefaultAsync(u => u.Username == "student1");

            if (studentUser == null)
            {
                studentUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "student1",
                    Email = "student1@school.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                    Role = UserRole.Student,
                    FirstName = "Alice",
                    LastName = "Johnson",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(studentUser);
            }

            // Save users before querying them again
            await context.SaveChangesAsync();

            // =========================
            // Sample Class
            // =========================
            var existingClass = await context.Classes
                .FirstOrDefaultAsync();

            if (existingClass == null)
            {
                existingClass = new Class
                {
                    Id = Guid.NewGuid(),
                    Name = "Class 10-A",
                    Description = "Science Section",
                    AcademicYear = "2024-2025",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Classes.Add(existingClass);

                // Save class before using it in another query
                await context.SaveChangesAsync();
            }

            // =========================
            // Sample Subject
            // =========================
            var existingSubject = await context.Subjects
                .FirstOrDefaultAsync();

            if (existingSubject == null)
            {
                var subject1 = new Subject
                {
                    Id = Guid.NewGuid(),
                    Name = "Mathematics",
                    Code = "MATH101",
                    ClassId = existingClass.Id,
                    IsActive = true
                };

                context.Subjects.Add(subject1);

                // Save subject first so it can be used for TeacherAssignment
                await context.SaveChangesAsync();

                // =========================
                // Assign teacher to subject
                // =========================
                var existingTeacherAssignment =
                    await context.TeacherAssignments
                        .FirstOrDefaultAsync(ta =>
                            ta.TeacherId == teacherUser.Id &&
                            ta.SubjectId == subject1.Id);

                if (existingTeacherAssignment == null)
                {
                    var teacherAssignment = new TeacherAssignment
                    {
                        TeacherId = teacherUser.Id,
                        SubjectId = subject1.Id,
                        AssignedAt = DateTime.UtcNow
                    };

                    context.TeacherAssignments.Add(teacherAssignment);

                    await context.SaveChangesAsync();
                }
            }

            // =========================
            // Enroll student in class
            // =========================
            var existingStudentClass =
                await context.StudentClasses
                    .FirstOrDefaultAsync(sc =>
                        sc.StudentId == studentUser.Id &&
                        sc.ClassId == existingClass.Id);

            if (existingStudentClass == null)
            {
                var studentClass = new StudentClass
                {
                    StudentId = studentUser.Id,
                    ClassId = existingClass.Id,
                    EnrolledAt = DateTime.UtcNow
                };

                context.StudentClasses.Add(studentClass);

                await context.SaveChangesAsync();
            }
        }
    }
}