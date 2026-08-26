using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Infrastructure.Persistence;

public class PatillaDbContext : DbContext
{
    static PatillaDbContext()
    {
        // Compatibilidad global con Npgsql para marcas de tiempo DateTime UTC / Unspecified
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }

    public PatillaDbContext(DbContextOptions<PatillaDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Local> Locales => Set<Local>();
    public DbSet<Suministro> Suministros => Set<Suministro>();
    public DbSet<InventarioLocal> Inventarios => Set<InventarioLocal>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<RegistroVentaDiaria> Ventas => Set<RegistroVentaDiaria>();
    public DbSet<DetalleVentaDiaria> DetallesVenta => Set<DetalleVentaDiaria>();
    public DbSet<ConsumoSuministroDiario> ConsumosSuministro => Set<ConsumoSuministroDiario>();
    public DbSet<PagoEmpleado> PagosEmpleado => Set<PagoEmpleado>();
    public DbSet<CompraInsumo> ComprasInsumo => Set<CompraInsumo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PatillaDbContext).Assembly);

        if (Database.IsNpgsql())
        {
            modelBuilder.UseIdentityByDefaultColumns();
        }
    }
}
