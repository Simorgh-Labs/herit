using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Herit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTagsToCfeoiAndRfp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Rfps",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Cfeois",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Rfps");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Cfeois");
        }
    }
}
