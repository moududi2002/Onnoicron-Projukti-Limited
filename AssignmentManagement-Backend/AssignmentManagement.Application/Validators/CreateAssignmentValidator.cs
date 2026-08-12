// Application/Validators/CreateAssignmentValidator.cs
using AssignmentManagement.Application.DTOs;
using FluentValidation;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Application.Validators;



namespace AssignmentManagement.Application.Validators

{
    public class CreateAssignmentValidator : AbstractValidator<CreateAssignmentDto>
    {
        public CreateAssignmentValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(500).WithMessage("Title cannot exceed 500 characters");

            RuleFor(x => x.Description)
                .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters");

            RuleFor(x => x.Deadline)
                .NotEmpty().WithMessage("Deadline is required")
                .Must(BeFutureDate).WithMessage("Deadline must be in the future");

            RuleFor(x => x.MaximumMarks)
                .NotEmpty().WithMessage("Maximum marks is required")
                .InclusiveBetween(1, 1000).WithMessage("Maximum marks must be between 1 and 1000");

            RuleFor(x => x.ClassId)
                .NotEmpty().WithMessage("Class is required");

            RuleFor(x => x.SubjectId)
                .NotEmpty().WithMessage("Subject is required");
        }

        private bool BeFutureDate(DateTime date)
        {
            return date > DateTime.UtcNow;
        }
    }

    public class UpdateAssignmentValidator : AbstractValidator<UpdateAssignmentDto>
    {
        public UpdateAssignmentValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(500);

            RuleFor(x => x.Description)
                .MaximumLength(5000);

            RuleFor(x => x.Deadline)
                .NotEmpty().WithMessage("Deadline is required");

            RuleFor(x => x.MaximumMarks)
                .InclusiveBetween(1, 1000);

            RuleFor(x => x.ClassId)
                .NotEmpty();

            RuleFor(x => x.SubjectId)
                .NotEmpty();
        }
    }

    public class CreateSubmissionValidator : AbstractValidator<CreateSubmissionDto>
    {
        public CreateSubmissionValidator()
        {
            RuleFor(x => x.AssignmentId)
                .NotEmpty().WithMessage("Assignment ID is required");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required")
                .Length(10, 10000).WithMessage("Content must be between 10 and 10000 characters");
        }
    }

    public class GradeSubmissionValidator : AbstractValidator<GradeSubmissionDto>
    {
        public GradeSubmissionValidator()
        {
            RuleFor(x => x.Marks)
                .InclusiveBetween(0, 1000).WithMessage("Marks must be between 0 and 1000");

            RuleFor(x => x.Feedback)
                .MaximumLength(2000).WithMessage("Feedback cannot exceed 2000 characters");
        }
    }
}