using Herit.Domain.Entities;
using Herit.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Herit.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.ExternalId)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(u => u.OrganisationId);

        builder.Property(u => u.Nationality)
            .HasMaxLength(128);

        builder.Property(u => u.Location)
            .HasMaxLength(256);

        builder.Property(u => u.ExpertiseTags)
            .HasMaxLength(1024);

        builder.HasOne<Organisation>()
            .WithMany()
            .HasForeignKey(u => u.OrganisationId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}
