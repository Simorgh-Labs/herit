using Herit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Herit.Infrastructure.Persistence.Configurations;

public class ProposalConfiguration : IEntityTypeConfiguration<Proposal>
{
    public void Configure(EntityTypeBuilder<Proposal> builder)
    {
        builder.ToTable("Proposals");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(p => p.ShortDescription)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(p => p.LongDescription)
            .IsRequired();

        builder.Property(p => p.AuthorId)
            .IsRequired();

        builder.Property(p => p.OrganisationId)
            .IsRequired();

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.Visibility)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.RfpId)
            .IsRequired(false);
    }
}
