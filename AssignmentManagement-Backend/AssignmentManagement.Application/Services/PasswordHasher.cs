// Application/Services/PasswordHasher.cs
using AssignmentManagement.Application.Interfaces;

namespace AssignmentManagement.Application.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool NeedsRehash(string hashedPassword)
        {
            try
            {
                // Check if the hash needs to be updated (e.g., work factor changed)
                return BCrypt.Net.BCrypt.PasswordNeedsRehash(hashedPassword, 12);
            }
            catch (Exception)
            {
                return true;
            }
        }
    }
}