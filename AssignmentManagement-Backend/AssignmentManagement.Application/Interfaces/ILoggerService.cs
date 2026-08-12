// Application/Interfaces/ILoggerService.cs

using AssignmentManagement.Application.Services;
using AssignmentManagement.Application.Validators;
using FluentValidation;
namespace AssignmentManagement.Application.Interfaces
{
    public interface ILoggerService
    {
        void LogInformation(string message);
        void LogWarning(string message);
        void LogError(string message, Exception? exception = null);
        void LogDebug(string message);
        void LogTrace(string message);
        void LogCritical(string message, Exception? exception = null);
    }
}