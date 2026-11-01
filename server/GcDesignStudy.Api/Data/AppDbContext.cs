using System.Linq;
using System.Text.Json;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GcDesignStudy.Api.Data;

// DB-first: this model describes the schema that already exists in SQL Server — it
// doesn't create or own it. Schema changes happen directly in SQL; this class (and the
// Entities/ it maps) are kept in sync by hand afterward. No EF migrations are generated
// or applied against this project.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Comment> Comments => Set<Comment>();

    public DbSet<CommentSection> CommentSections => Set<CommentSection>();

    public DbSet<Section> Sections => Set<Section>();

    public DbSet<Document> Documents => Set<Document>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<SupportStatus> SupportStatuses => Set<SupportStatus>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(c => c.UserId).HasMaxLength(100).IsRequired();
            entity.Property(c => c.DocumentId).HasMaxLength(100).IsRequired();
            entity.Property(c => c.Version).HasMaxLength(20).IsRequired();
            entity.Property(c => c.RoleKey).HasMaxLength(50).IsRequired();
            entity.Property(c => c.SupportStatusKey).HasMaxLength(50).IsRequired();
            entity.Property(c => c.GeneralComment).HasColumnType("nvarchar(max)");

            // Attachments is a short list of filenames; storing it as a JSON array
            // column avoids a third table for something that's never queried on its own.
            var attachmentsProperty = entity.Property(c => c.Attachments)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("nvarchar(max)")
                .Metadata;
            attachmentsProperty.SetValueComparer(new ValueComparer<List<string>>(
                (a, b) => (a ?? new List<string>()).SequenceEqual(b ?? new List<string>()),
                v => v.Aggregate(0, (hash, s) => HashCode.Combine(hash, s.GetHashCode())),
                v => v.ToList()));

            entity.HasIndex(c => c.UserId);

            entity.HasMany(c => c.Sections)
                .WithOne(s => s.Comment)
                .HasForeignKey(s => s.CommentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Role)
                .WithMany()
                .HasForeignKey(c => c.RoleKey)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Document)
                .WithMany()
                .HasForeignKey(c => c.DocumentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.SupportStatus)
                .WithMany()
                .HasForeignKey(c => c.SupportStatusKey)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CommentSection>(entity =>
        {
            entity.Property(s => s.SectionId).HasMaxLength(100);
            entity.Property(s => s.CommentText).HasColumnType("nvarchar(max)").IsRequired();

            entity.HasOne(s => s.Section)
                .WithMany()
                .HasForeignKey(s => s.SectionId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(s => s.SectionKey);
            entity.Property(s => s.SectionKey).HasMaxLength(100);
            entity.Property(s => s.TitleEn).HasMaxLength(300).IsRequired();
            entity.Property(s => s.TitleFr).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(d => d.DocumentId);
            entity.Property(d => d.DocumentId).HasMaxLength(100);
            entity.Property(d => d.TitleEn).HasMaxLength(300).IsRequired();
            entity.Property(d => d.TitleFr).HasMaxLength(300).IsRequired();
            entity.Property(d => d.Version).HasMaxLength(20).IsRequired();
            entity.Property(d => d.DocumentLink).HasMaxLength(500).IsRequired();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(r => r.RoleKey);
            entity.Property(r => r.RoleKey).HasMaxLength(50);
        });

        modelBuilder.Entity<SupportStatus>(entity =>
        {
            entity.HasKey(s => s.StatusKey);
            entity.Property(s => s.StatusKey).HasMaxLength(50);
        });
    }
}
