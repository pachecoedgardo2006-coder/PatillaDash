using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class ConsumoSuministroDiarioConfiguration : IEntityTypeConfiguration<ConsumoSuministroDiario>
{
    public void Configure(EntityTypeBuilder<ConsumoSuministroDiario> builder)
    {
        builder.ToTable("ConsumosSuministroDiario");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CantidadGastada)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(c => c.RegistroVentaDiaria)
            .WithMany(r => r.Consumos)
            .HasForeignKey(c => c.RegistroVentaDiariaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Suministro)
            .WithMany()
            .HasForeignKey(c => c.SuministroId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
