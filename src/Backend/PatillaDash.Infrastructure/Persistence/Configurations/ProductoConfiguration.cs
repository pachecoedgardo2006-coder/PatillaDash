using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class ProductoConfiguration : IEntityTypeConfiguration<Producto>
{
    public void Configure(EntityTypeBuilder<Producto> builder)
    {
        builder.ToTable("Productos");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.PrecioBase)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.Categoria)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Activo)
            .IsRequired()
            .HasDefaultValue(true);
    }
}
