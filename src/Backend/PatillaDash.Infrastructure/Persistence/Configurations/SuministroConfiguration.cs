using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class SuministroConfiguration : IEntityTypeConfiguration<Suministro>
{
    public void Configure(EntityTypeBuilder<Suministro> builder)
    {
        builder.ToTable("Suministros");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.UnidadMedida)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.StockMinimoAlerta)
            .HasPrecision(18, 2)
            .IsRequired();
    }
}
