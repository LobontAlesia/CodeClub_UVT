using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserChapterCompletedAtTimestamp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "UserLessons",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "UserLearningCourses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ChapterId1",
                table: "UserChapters",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "UserChapters",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "UserChapters",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "UserChapters",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_UserChapters_ChapterId1",
                table: "UserChapters",
                column: "ChapterId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UserChapters_Chapters_ChapterId1",
                table: "UserChapters",
                column: "ChapterId1",
                principalTable: "Chapters",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserChapters_Chapters_ChapterId1",
                table: "UserChapters");

            migrationBuilder.DropIndex(
                name: "IX_UserChapters_ChapterId1",
                table: "UserChapters");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "UserLessons");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "UserLearningCourses");

            migrationBuilder.DropColumn(
                name: "ChapterId1",
                table: "UserChapters");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "UserChapters");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "UserChapters");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "UserChapters");
        }
    }
}
