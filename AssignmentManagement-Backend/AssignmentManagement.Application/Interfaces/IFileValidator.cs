// Application/Interfaces/IFileValidator.cs
using Microsoft.AspNetCore.Http;
namespace AssignmentManagement.Application.Interfaces
{
    public interface IFileValidator
    {
        bool IsValidFile(IFormFile file);
        bool IsValidFileSize(long fileSize, long maxSize);
        bool IsValidFileExtension(string fileName);
        bool IsValidMimeType(string mimeType);
        string GetFileExtension(string fileName);
    }
}