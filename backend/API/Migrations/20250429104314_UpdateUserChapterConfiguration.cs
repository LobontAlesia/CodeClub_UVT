using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserChapterConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserChapters_Chapters_ChapterId1",
                table: "UserChapters");

            migrationBuilder.DropIndex(
                name: "IX_UserChapters_ChapterId1",
                table: "UserChapters");

            migrationBuilder.DropColumn(
                name: "ChapterId1",
                table: "UserChapters");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ChapterId1",
                table: "UserChapters",
                type: "uuid",
                nullable: true);

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
    }
}
