using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly PatillaDbContext _context;

    public VentaRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RegistroVentaDiaria venta)
    {
        await _context.Ventas.AddAsync(venta);
        await _context.SaveChangesAsync();
    }

    public async Task<RegistroVentaDiaria?> GetByIdAsync(int id)
    {
        return await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Local)
            .Include(v => v.Vendedor)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(v => v.Consumos)
                .ThenInclude(c => c.Suministro)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<RegistroVentaDiaria>> GetByLocalAndDateRangeAsync(int localId, DateTime desde, DateTime hasta)
    {
        return await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Local)
            .Include(v => v.Vendedor)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(v => v.Consumos)
                .ThenInclude(c => c.Suministro)
            .Where(v => v.LocalId == localId && v.Fecha >= desde && v.Fecha <= hasta)
            .OrderByDescending(v => v.Fecha)
            .ToListAsync();
    }

    public async Task<IEnumerable<RegistroVentaDiaria>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta)
    {
        return await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Local)
            .Include(v => v.Vendedor)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(v => v.Consumos)
                .ThenInclude(c => c.Suministro)
            .Where(v => v.Fecha >= desde && v.Fecha <= hasta)
            .OrderByDescending(v => v.Fecha)
            .ToListAsync();
    }
}
