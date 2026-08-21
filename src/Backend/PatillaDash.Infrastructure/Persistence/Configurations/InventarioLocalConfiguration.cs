using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class InventarioLocalConfiguration : IEntityTypeConfiguration<InventarioLocal>
{
    public void Configure(EntityTypeBuilder<InventarioLocal> builder)
    {
        builder.ToTable("InventariosLocal");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.CantidadDisponible)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(i => new { i.LocalId, i.SuministroId })
            .IsUnique();

        builder.HasOne(i => i.Local)
            .WithMany(l => l.Inventarios)
            .HasForeignKey(i => i.LocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Suministro)
            .WithMany()
            .HasForeignKey(i => i.SuministroId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
