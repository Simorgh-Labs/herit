using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Herit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCfeoiOpportunityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Compensation",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "DurationWeeks",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "ExternalLinks",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "RoleTitle",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "Skills",
                table: "Cfeois");

            migrationBuilder.DropColumn(
                name: "Slots",
                table: "Cfeois");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Compensation",
                table: "Cfeois",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Deadline",
                table: "Cfeois",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationWeeks",
                table: "Cfeois",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalLinks",
                table: "Cfeois",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Cfeois",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoleTitle",
                table: "Cfeois",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Skills",
                table: "Cfeois",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Slots",
                table: "Cfeois",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
