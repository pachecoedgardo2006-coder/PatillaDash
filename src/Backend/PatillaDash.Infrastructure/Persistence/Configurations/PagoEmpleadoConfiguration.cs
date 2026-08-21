using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class PagoEmpleadoConfiguration : IEntityTypeConfiguration<PagoEmpleado>
{
    public void Configure(EntityTypeBuilder<PagoEmpleado> builder)
    {
        builder.ToTable("PagosEmpleado");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Monto)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.FechaPago)
            .IsRequired();

        builder.Property(p => p.Observacion)
            .HasMaxLength(500);

        builder.HasOne(p => p.Local)
            .WithMany()
            .HasForeignKey(p => p.LocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Vendedor)
            .WithMany()
            .HasForeignKey(p => p.VendedorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
