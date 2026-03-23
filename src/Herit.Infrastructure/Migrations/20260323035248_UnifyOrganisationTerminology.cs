using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Herit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UnifyOrganisationTerminology : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DepartmentId",
                table: "Rfps",
                newName: "OrganisationId");

            migrationBuilder.RenameColumn(
                name: "DepartmentId",
                table: "Proposals",
                newName: "OrganisationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                table: "Rfps",
                newName: "DepartmentId");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                table: "Proposals",
                newName: "DepartmentId");
        }
    }
}
