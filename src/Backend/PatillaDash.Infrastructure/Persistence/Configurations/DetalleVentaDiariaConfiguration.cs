using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class DetalleVentaDiariaConfiguration : IEntityTypeConfiguration<DetalleVentaDiaria>
{
    public void Configure(EntityTypeBuilder<DetalleVentaDiaria> builder)
    {
        builder.ToTable("DetallesVentaDiaria");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.CantidadVendida)
            .IsRequired();

        builder.Property(d => d.Subtotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(d => d.RegistroVentaDiaria)
            .WithMany(r => r.Detalles)
            .HasForeignKey(d => d.RegistroVentaDiariaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Producto)
            .WithMany()
            .HasForeignKey(d => d.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
