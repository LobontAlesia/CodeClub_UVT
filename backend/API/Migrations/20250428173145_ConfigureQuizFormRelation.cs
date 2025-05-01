using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureQuizFormRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizQuestions_QuizForms_QuizFormId",
                table: "QuizQuestions");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "ChapterElements",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64);

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "ChapterElements",
                type: "text",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuizQuestions_QuizForms_QuizFormId",
                table: "QuizQuestions",
                column: "QuizFormId",
                principalTable: "QuizForms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizQuestions_QuizForms_QuizFormId",
                table: "QuizQuestions");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "ChapterElements",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<byte[]>(
                name: "Image",
                table: "ChapterElements",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuizQuestions_QuizForms_QuizFormId",
                table: "QuizQuestions",
                column: "QuizFormId",
                principalTable: "QuizForms",
                principalColumn: "Id");
        }
    }
}
