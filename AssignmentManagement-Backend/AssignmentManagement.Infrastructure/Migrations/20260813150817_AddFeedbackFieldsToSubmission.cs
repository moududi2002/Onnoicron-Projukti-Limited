using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssignmentManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackFieldsToSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Feedback",
                table: "Submissions",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AreasForImprovement",
                table: "Submissions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Submissions",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Strengths",
                table: "Submissions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AreasForImprovement",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "Strengths",
                table: "Submissions");

            migrationBuilder.AlterColumn<string>(
                name: "Feedback",
                table: "Submissions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);
        }
    }
}
