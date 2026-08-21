using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class CompraInsumoConfiguration : IEntityTypeConfiguration<CompraInsumo>
{
    public void Configure(EntityTypeBuilder<CompraInsumo> builder)
    {
        builder.ToTable("ComprasInsumo");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(c => c.CostoTotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(c => c.Fecha)
            .IsRequired();

        builder.Property(c => c.Proveedor)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasOne(c => c.Local)
            .WithMany()
            .HasForeignKey(c => c.LocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Suministro)
            .WithMany()
            .HasForeignKey(c => c.SuministroId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
