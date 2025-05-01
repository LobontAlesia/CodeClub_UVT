using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Badges_BadgeId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_BadgeId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BadgeId",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "BadgeUser",
                columns: table => new
                {
                    BadgesId = table.Column<Guid>(type: "uuid", nullable: false),
                    UsersId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BadgeUser", x => new { x.BadgesId, x.UsersId });
                    table.ForeignKey(
                        name: "FK_BadgeUser_Badges_BadgesId",
                        column: x => x.BadgesId,
                        principalTable: "Badges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BadgeUser_Users_UsersId",
                        column: x => x.UsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BadgeUser_UsersId",
                table: "BadgeUser",
                column: "UsersId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BadgeUser");

            migrationBuilder.AddColumn<Guid>(
                name: "BadgeId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_BadgeId",
                table: "Users",
                column: "BadgeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Badges_BadgeId",
                table: "Users",
                column: "BadgeId",
                principalTable: "Badges",
                principalColumn: "Id");
        }
    }
}
