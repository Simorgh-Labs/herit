using Herit.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Herit.Infrastructure.Persistence.Configurations;

public class EoiConfiguration : IEntityTypeConfiguration<Eoi>
{
    public void Configure(EntityTypeBuilder<Eoi> builder)
    {
        builder.ToTable("Eois");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.SubmittedById)
            .IsRequired();

        builder.Property(e => e.Message)
            .IsRequired();

        builder.Property(e => e.CfeoiId)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.Visibility)
            .IsRequired()
            .HasConversion<int>();

        builder.HasOne<Cfeoi>()
            .WithMany()
            .HasForeignKey(e => e.CfeoiId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
