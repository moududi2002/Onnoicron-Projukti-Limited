// Application/Interfaces/IFileUploadService.cs
using Microsoft.AspNetCore.Http;

namespace AssignmentManagement.Application.Interfaces
{
    public interface IFileUploadService
    {
        Task<FileUploadResult> UploadFileAsync(IFormFile file, string folderName);
        Task<IEnumerable<FileUploadResult>> UploadMultipleFilesAsync(IEnumerable<IFormFile> files, string folderName);
        Task DeleteFileAsync(string fileUrl);
        bool FileExists(string fileUrl);
        string GetFilePath(string fileUrl);
        Task<byte[]> ReadFileAsync(string fileUrl);
    }

    public class FileUploadResult
    {
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }
}