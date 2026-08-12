// Application/Interfaces/IPasswordHasher.cs
namespace AssignmentManagement.Application.Interfaces
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        bool NeedsRehash(string hashedPassword);
    }
}