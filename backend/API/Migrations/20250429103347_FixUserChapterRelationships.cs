using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class FixUserChapterRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleUser_Users_UsersUserId",
                table: "RoleUser");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserChapters",
                table: "UserChapters");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "UsersUserId",
                table: "RoleUser",
                newName: "UsersId");

            migrationBuilder.RenameIndex(
                name: "IX_RoleUser_UsersUserId",
                table: "RoleUser",
                newName: "IX_RoleUser_UsersId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserChapters",
                table: "UserChapters",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UserChapters_UserId",
                table: "UserChapters",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUser_Users_UsersId",
                table: "RoleUser",
                column: "UsersId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleUser_Users_UsersId",
                table: "RoleUser");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserChapters",
                table: "UserChapters");

            migrationBuilder.DropIndex(
                name: "IX_UserChapters_UserId",
                table: "UserChapters");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Users",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "UsersId",
                table: "RoleUser",
                newName: "UsersUserId");

            migrationBuilder.RenameIndex(
                name: "IX_RoleUser_UsersId",
                table: "RoleUser",
                newName: "IX_RoleUser_UsersUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserChapters",
                table: "UserChapters",
                columns: new[] { "UserId", "ChapterId" });

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUser_Users_UsersUserId",
                table: "RoleUser",
                column: "UsersUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
