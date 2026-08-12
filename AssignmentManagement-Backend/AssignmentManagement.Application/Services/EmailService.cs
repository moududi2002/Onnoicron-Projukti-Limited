// Application/Services/EmailService.cs
using AssignmentManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace AssignmentManagement.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpClient = CreateSmtpClient();
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_configuration["Email:From"] ?? "noreply@school.com"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                await smtpClient.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Email sent to {to}: {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {to}");
                throw;
            }
        }

        public async Task SendEmailWithAttachmentAsync(string to, string subject, string body, string attachmentPath)
        {
            try
            {
                var smtpClient = CreateSmtpClient();
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_configuration["Email:From"] ?? "noreply@school.com"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                if (File.Exists(attachmentPath))
                {
                    mailMessage.Attachments.Add(new Attachment(attachmentPath));
                }

                await smtpClient.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Email with attachment sent to {to}: {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email with attachment to {to}");
                throw;
            }
        }

        public async Task SendWelcomeEmailAsync(string to, string username, string password)
        {
            var subject = "Welcome to Assignment Management System";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; background-color: #F9FAFB; }}
                        .credentials {{ background-color: #E5E7EB; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                        .footer {{ text-align: center; padding: 20px; color: #6B7280; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome!</h1>
                        </div>
                        <div class='content'>
                            <h2>Your Account Has Been Created</h2>
                            <p>Hello,</p>
                            <p>Your account has been created in the Assignment Management System.</p>
                            <div class='credentials'>
                                <p><strong>Username:</strong> {username}</p>
                                <p><strong>Password:</strong> {password}</p>
                            </div>
                            <p>Please login and change your password after your first login.</p>
                            <p><strong>Login URL:</strong> <a href='https://yourschool.com/login'>https://yourschool.com/login</a></p>
                        </div>
                        <div class='footer'>
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string to, string resetLink)
        {
            var subject = "Password Reset Request";
            var body = $@"
                <html>
                <body>
                    <h2>Password Reset</h2>
                    <p>You have requested to reset your password.</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href='{resetLink}'>{resetLink}</a></p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>This link will expire in 1 hour.</p>
                </body>
                </html>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendGradeNotificationEmailAsync(string to, string assignmentTitle, int marks, string feedback)
        {
            var subject = $"Assignment Graded: {assignmentTitle}";
            var body = $@"
                <h2>Assignment Graded</h2>
                <p>Your assignment <strong>{assignmentTitle}</strong> has been graded.</p>
                <p><strong>Marks:</strong> {marks}</p>
                <p><strong>Feedback:</strong> {feedback}</p>";

            await SendEmailAsync(to, subject, body);
        }

        private SmtpClient CreateSmtpClient()
        {
            var smtpClient = new SmtpClient
            {
                Host = _configuration["Email:Smtp:Host"] ?? "smtp.gmail.com",
                Port = int.Parse(_configuration["Email:Smtp:Port"] ?? "587"),
                EnableSsl = bool.Parse(_configuration["Email:Smtp:EnableSsl"] ?? "true"),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(
                    _configuration["Email:Smtp:Username"],
                    _configuration["Email:Smtp:Password"]
                )
            };

            return smtpClient;
        }
    }
}