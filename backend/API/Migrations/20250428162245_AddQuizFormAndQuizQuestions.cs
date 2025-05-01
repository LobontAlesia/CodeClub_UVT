using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizFormAndQuizQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChapterElements_QuizForm_FormId",
                table: "ChapterElements");

            migrationBuilder.DropForeignKey(
                name: "FK_Chapters_Lessons_LessonId",
                table: "Chapters");

            migrationBuilder.DropPrimaryKey(
                name: "PK_QuizForm",
                table: "QuizForm");

            migrationBuilder.RenameTable(
                name: "QuizForm",
                newName: "QuizForms");

            migrationBuilder.AlterColumn<Guid>(
                name: "LessonId",
                table: "Chapters",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "QuizForms",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AddPrimaryKey(
                name: "PK_QuizForms",
                table: "QuizForms",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    Answer1 = table.Column<string>(type: "text", nullable: false),
                    Answer2 = table.Column<string>(type: "text", nullable: false),
                    Answer3 = table.Column<string>(type: "text", nullable: false),
                    Answer4 = table.Column<string>(type: "text", nullable: false),
                    CorrectAnswerIndex = table.Column<int>(type: "integer", nullable: false),
                    QuizFormId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_QuizForms_QuizFormId",
                        column: x => x.QuizFormId,
                        principalTable: "QuizForms",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_QuizFormId",
                table: "QuizQuestions",
                column: "QuizFormId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChapterElements_QuizForms_FormId",
                table: "ChapterElements",
                column: "FormId",
                principalTable: "QuizForms",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Chapters_Lessons_LessonId",
                table: "Chapters",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChapterElements_QuizForms_FormId",
                table: "ChapterElements");

            migrationBuilder.DropForeignKey(
                name: "FK_Chapters_Lessons_LessonId",
                table: "Chapters");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_QuizForms",
                table: "QuizForms");

            migrationBuilder.RenameTable(
                name: "QuizForms",
                newName: "QuizForm");

            migrationBuilder.AlterColumn<Guid>(
                name: "LessonId",
                table: "Chapters",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "QuizForm",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_QuizForm",
                table: "QuizForm",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChapterElements_QuizForm_FormId",
                table: "ChapterElements",
                column: "FormId",
                principalTable: "QuizForm",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Chapters_Lessons_LessonId",
                table: "Chapters",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id");
        }
    }
}
