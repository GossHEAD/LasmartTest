using Microsoft.EntityFrameworkCore;
using PointService.Models;

namespace PointService.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<PointModel> Points { get; set; }
    public DbSet<CommentModel> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<PointModel>()
            .HasMany(p => p.Comments) 
            .WithOne(c => c.Point)    
            .HasForeignKey(c => c.PointId) 
            .OnDelete(DeleteBehavior.Cascade); 
    }
}