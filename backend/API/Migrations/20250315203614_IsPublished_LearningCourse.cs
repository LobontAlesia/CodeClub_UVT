using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class IsPublished_LearningCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_LearningCourses_LearningCourseId",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "Lessons");

            migrationBuilder.AlterColumn<Guid>(
                name: "LearningCourseId",
                table: "Lessons",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "LearningCourses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_LearningCourses_LearningCourseId",
                table: "Lessons",
                column: "LearningCourseId",
                principalTable: "LearningCourses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_LearningCourses_LearningCourseId",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "LearningCourses");

            migrationBuilder.AlterColumn<Guid>(
                name: "LearningCourseId",
                table: "Lessons",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "CourseId",
                table: "Lessons",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_LearningCourses_LearningCourseId",
                table: "Lessons",
                column: "LearningCourseId",
                principalTable: "LearningCourses",
                principalColumn: "Id");
        }
    }
}
