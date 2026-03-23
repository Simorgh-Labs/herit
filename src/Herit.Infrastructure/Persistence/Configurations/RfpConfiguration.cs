using Herit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Herit.Infrastructure.Persistence.Configurations;

public class RfpConfiguration : IEntityTypeConfiguration<Rfp>
{
    public void Configure(EntityTypeBuilder<Rfp> builder)
    {
        builder.ToTable("Rfps");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(r => r.ShortDescription)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(r => r.LongDescription)
            .IsRequired();

        builder.Property(r => r.AuthorId)
            .IsRequired();

        builder.Property(r => r.OrganisationId)
            .IsRequired();

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<int>();
    }
}
