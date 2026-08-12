// Application/Services/FileValidator.cs
using AssignmentManagement.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace AssignmentManagement.Application.Services
{
    public class FileValidator : IFileValidator
    {
        private readonly Dictionary<string, List<string>> _allowedMimeTypes = new()
        {
            { ".pdf", new List<string> { "application/pdf" } },
            { ".doc", new List<string> { "application/msword" } },
            { ".docx", new List<string> { "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } },
            { ".txt", new List<string> { "text/plain" } },
            { ".jpg", new List<string> { "image/jpeg" } },
            { ".jpeg", new List<string> { "image/jpeg" } },
            { ".png", new List<string> { "image/png" } },
            { ".zip", new List<string> { "application/zip", "application/x-zip-compressed" } },
            { ".xlsx", new List<string> { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } },
            { ".pptx", new List<string> { "application/vnd.openxmlformats-officedocument.presentationml.presentation" } }
        };

        private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB default
        private readonly List<string> _allowedExtensions;

        public FileValidator()
        {
            _allowedExtensions = _allowedMimeTypes.Keys.ToList();
        }

        public bool IsValidFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (!IsValidFileSize(file.Length, _maxFileSize))
                return false;

            if (!IsValidFileExtension(file.FileName))
                return false;

            if (!IsValidMimeType(file.ContentType))
                return false;

            return true;
        }

        public bool IsValidFileSize(long fileSize, long maxSize)
        {
            return fileSize > 0 && fileSize <= maxSize;
        }

        public bool IsValidFileExtension(string fileName)
        {
            var extension = GetFileExtension(fileName);
            return _allowedExtensions.Contains(extension);
        }

        public bool IsValidMimeType(string mimeType)
        {
            return _allowedMimeTypes.Values.Any(types => types.Contains(mimeType.ToLower()));
        }

        public string GetFileExtension(string fileName)
        {
            return Path.GetExtension(fileName).ToLower();
        }

        public string GetFileCategory(string fileName)
        {
            var extension = GetFileExtension(fileName);
            
            return extension switch
            {
                ".pdf" => "Document",
                ".doc" or ".docx" => "Document",
                ".txt" => "Document",
                ".jpg" or ".jpeg" or ".png" => "Image",
                ".zip" => "Archive",
                ".xlsx" => "Spreadsheet",
                ".pptx" => "Presentation",
                _ => "Other"
            };
        }
    }
}