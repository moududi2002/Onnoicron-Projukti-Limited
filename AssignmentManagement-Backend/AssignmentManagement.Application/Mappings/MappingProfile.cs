// Application/Mappings/MappingProfile.cs
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Assignment mappings
            CreateMap<Assignment, AssignmentDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.Class.Name))
                .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.Subject.Name))
                .ForMember(dest => dest.CreatedByName, opt => 
                    opt.MapFrom(src => $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}"))
                .ForMember(dest => dest.SubmissionCount, opt => 
                    opt.MapFrom(src => src.Submissions.Count))
                .ForMember(dest => dest.GradedCount, opt => 
                    opt.MapFrom(src => src.Submissions.Count(s => s.Status == SubmissionStatus.Graded)));

            CreateMap<CreateAssignmentDto, Assignment>();
            CreateMap<UpdateAssignmentDto, Assignment>();

            // Submission mappings
            CreateMap<Submission, SubmissionDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.StudentName, opt => 
                    opt.MapFrom(src => $"{src.Student.FirstName} {src.Student.LastName}"))
                .ForMember(dest => dest.AssignmentTitle, opt => 
                    opt.MapFrom(src => src.Assignment.Title))
                .ForMember(dest => dest.MaximumMarks, opt => 
                    opt.MapFrom(src => src.Assignment.MaximumMarks));

            CreateMap<CreateSubmissionDto, Submission>();
            CreateMap<GradeSubmissionDto, Submission>();

            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<CreateUserDto, User>();

            // Class mappings
            CreateMap<Class, ClassDto>()
                .ForMember(dest => dest.StudentCount, opt => 
                    opt.MapFrom(src => src.StudentClasses.Count))
                .ForMember(dest => dest.SubjectCount, opt => 
                    opt.MapFrom(src => src.Subjects.Count));

            CreateMap<CreateClassDto, Class>();

            // Subject mappings
            CreateMap<Subject, SubjectDto>()
                .ForMember(dest => dest.ClassName, opt => 
                    opt.MapFrom(src => src.Class.Name))
                .ForMember(dest => dest.TeacherCount, opt => 
                    opt.MapFrom(src => src.TeacherAssignments.Count));

            CreateMap<CreateSubjectDto, Subject>();

            // File mappings
            CreateMap<AssignmentAttachment, AttachmentDto>();
            CreateMap<SubmissionAttachment, AttachmentDto>();
        }
    }
}