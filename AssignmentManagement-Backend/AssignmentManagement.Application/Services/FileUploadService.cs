// Application/Services/FileUploadService.cs
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AssignmentManagement.Application.Interfaces;

namespace AssignmentManagement.Application.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FileUploadService> _logger;
        private readonly string _uploadBasePath;

        public FileUploadService(IConfiguration configuration, ILogger<FileUploadService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _uploadBasePath = _configuration["FileStorage:BasePath"] ?? "Uploads";
        }

        public async Task<FileUploadResult> UploadFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                throw new InvalidOperationException("File size exceeds 10MB limit");

            // Validate file type
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".zip", ".xlsx", ".pptx" };
            var allowedMimeTypes = new[] 
            { 
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
                "image/jpeg",
                "image/png",
                "application/zip",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            };

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            
            if (!allowedExtensions.Contains(fileExtension))
                throw new InvalidOperationException($"File type {fileExtension} is not allowed");

            if (!allowedMimeTypes.Contains(file.ContentType))
                throw new InvalidOperationException($"File type {file.ContentType} is not allowed");

            // Create folder if not exists
            var uploadFolder = Path.Combine(_uploadBasePath, folderName, DateTime.UtcNow.ToString("yyyy-MM"));
            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadFolder, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{folderName}/{DateTime.UtcNow:yyyy-MM}/{uniqueFileName}";
            
            _logger.LogInformation($"File uploaded: {fileUrl}");

            return new FileUploadResult
            {
                FileName = file.FileName,
                FileUrl = fileUrl,
                ContentType = file.ContentType,
                FileSize = file.Length
            };
        }

        public Task DeleteFileAsync(string fileUrl)
        {
            var filePath = GetFilePath(fileUrl);
            
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation($"File deleted: {fileUrl}");
            }

            return Task.CompletedTask;
        }

        public bool FileExists(string fileUrl)
        {
            var filePath = GetFilePath(fileUrl);
            return File.Exists(filePath);
        }

        public string GetFilePath(string fileUrl)
        {
            // Remove leading slash and replace with local path
            var relativePath = fileUrl.TrimStart('/');
            return Path.Combine(Directory.GetCurrentDirectory(), relativePath);
        }

        public async Task<IEnumerable<FileUploadResult>> UploadMultipleFilesAsync(IEnumerable<IFormFile> files, string folderName)
        {
            var results = new List<FileUploadResult>();
            
            foreach (var file in files)
            {
                var result = await UploadFileAsync(file, folderName);
                results.Add(result);
            }
            
            return results;
        }

        public async Task<byte[]> ReadFileAsync(string fileUrl)
        {
            var filePath = GetFilePath(fileUrl);
            
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"File not found: {fileUrl}");
            
            return await File.ReadAllBytesAsync(filePath);
        }
    }
}