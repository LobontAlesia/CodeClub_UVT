using Microsoft.EntityFrameworkCore.Migrations;

namespace API.Migrations;

public partial class RenameUserIdColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Drop foreign keys first
        migrationBuilder.DropForeignKey(
            name: "FK_BadgeUser_Users_UserId",
            table: "BadgeUser");

        migrationBuilder.DropForeignKey(
            name: "FK_UserChapters_Users_UserId",
            table: "UserChapters");

        migrationBuilder.DropForeignKey(
            name: "FK_UserLearningCourses_Users_UserId",
            table: "UserLearningCourses");

        migrationBuilder.DropForeignKey(
            name: "FK_UserLessons_Users_UserId",
            table: "UserLessons");

        // Add back foreign keys pointing to Id column
        migrationBuilder.AddForeignKey(
            name: "FK_BadgeUser_Users_UserId",
            table: "BadgeUser",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_UserChapters_Users_UserId",
            table: "UserChapters",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_UserLearningCourses_Users_UserId",
            table: "UserLearningCourses",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_UserLessons_Users_UserId",
            table: "UserLessons",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Drop foreign keys
        migrationBuilder.DropForeignKey(
            name: "FK_BadgeUser_Users_UserId",
            table: "BadgeUser");

        migrationBuilder.DropForeignKey(
            name: "FK_UserChapters_Users_UserId",
            table: "UserChapters");

        migrationBuilder.DropForeignKey(
            name: "FK_UserLearningCourses_Users_UserId",
            table: "UserLearningCourses");

        migrationBuilder.DropForeignKey(
            name: "FK_UserLessons_Users_UserId",
            table: "UserLessons");

        // Add back original foreign keys
        migrationBuilder.AddForeignKey(
            name: "FK_BadgeUser_Users_UserId",
            table: "BadgeUser",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_UserChapters_Users_UserId",
            table: "UserChapters",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_UserLearningCourses_Users_UserId",
            table: "UserLearningCourses",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_UserLessons_Users_UserId",
            table: "UserLessons",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }
}
