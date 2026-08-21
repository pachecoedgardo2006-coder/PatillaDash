using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class RegistroVentaDiariaConfiguration : IEntityTypeConfiguration<RegistroVentaDiaria>
{
    public void Configure(EntityTypeBuilder<RegistroVentaDiaria> builder)
    {
        builder.ToTable("RegistrosVentaDiaria");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Fecha)
            .IsRequired();

        builder.Property(r => r.TotalEfectivo)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(r => r.TotalTransferencia)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(r => r.Notas)
            .HasMaxLength(500);

        builder.Ignore(r => r.TotalVenta);

        builder.HasOne(r => r.Local)
            .WithMany()
            .HasForeignKey(r => r.LocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Vendedor)
            .WithMany()
            .HasForeignKey(r => r.VendedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.Detalles)
            .WithOne(d => d.RegistroVentaDiaria)
            .HasForeignKey(d => d.RegistroVentaDiariaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(r => r.Detalles)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(r => r.Consumos)
            .WithOne(c => c.RegistroVentaDiaria)
            .HasForeignKey(c => c.RegistroVentaDiariaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(r => r.Consumos)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
