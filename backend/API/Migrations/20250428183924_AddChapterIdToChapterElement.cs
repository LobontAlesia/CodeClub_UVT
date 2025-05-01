using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddChapterIdToChapterElement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChapterElements_Chapters_ChapterId",
                table: "ChapterElements");

            migrationBuilder.AlterColumn<Guid>(
                name: "ChapterId",
                table: "ChapterElements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ChapterElements_Chapters_ChapterId",
                table: "ChapterElements",
                column: "ChapterId",
                principalTable: "Chapters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChapterElements_Chapters_ChapterId",
                table: "ChapterElements");

            migrationBuilder.AlterColumn<Guid>(
                name: "ChapterId",
                table: "ChapterElements",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_ChapterElements_Chapters_ChapterId",
                table: "ChapterElements",
                column: "ChapterId",
                principalTable: "Chapters",
                principalColumn: "Id");
        }
    }
}
