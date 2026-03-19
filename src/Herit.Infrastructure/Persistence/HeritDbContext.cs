using Herit.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Persistence;

public class HeritDbContext : DbContext
{
    public HeritDbContext(DbContextOptions<HeritDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Rfp> Rfps => Set<Rfp>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<Cfeoi> Cfeois => Set<Cfeoi>();
    public DbSet<Eoi> Eois => Set<Eoi>();
    public DbSet<Organisation> Organisations => Set<Organisation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HeritDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
