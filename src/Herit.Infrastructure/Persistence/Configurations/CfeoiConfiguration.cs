using Herit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Herit.Infrastructure.Persistence.Configurations;

public class CfeoiConfiguration : IEntityTypeConfiguration<Cfeoi>
{
    public void Configure(EntityTypeBuilder<Cfeoi> builder)
    {
        builder.ToTable("Cfeois");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.Description)
            .IsRequired();

        builder.Property(c => c.ResourceType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.ProposalId)
            .IsRequired();

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.HasOne<Proposal>()
            .WithMany()
            .HasForeignKey(c => c.ProposalId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
