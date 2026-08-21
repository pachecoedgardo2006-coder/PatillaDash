using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence.Configurations;

public class LocalConfiguration : IEntityTypeConfiguration<Local>
{
    public void Configure(EntityTypeBuilder<Local> builder)
    {
        builder.ToTable("Locales");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.Direccion)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(l => l.Activo)
            .IsRequired();

        builder.HasMany(l => l.Usuarios)
            .WithOne(u => u.Local)
            .HasForeignKey(u => u.LocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(l => l.Usuarios)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(l => l.Inventarios)
            .WithOne(i => i.Local)
            .HasForeignKey(i => i.LocalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(l => l.Inventarios)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
