using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class PagoEmpleadoRepository : IPagoEmpleadoRepository
{
    private readonly PatillaDbContext _context;

    public PagoEmpleadoRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(PagoEmpleado pago)
    {
        await _context.PagosEmpleado.AddAsync(pago);
        await _context.SaveChangesAsync();
    }

    public async Task<PagoEmpleado?> GetByIdAsync(int id)
    {
        return await _context.PagosEmpleado
            .AsNoTracking()
            .Include(p => p.Local)
            .Include(p => p.Vendedor)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<PagoEmpleado>> GetAllAsync()
    {
        return await _context.PagosEmpleado
            .AsNoTracking()
            .Include(p => p.Local)
            .Include(p => p.Vendedor)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagoEmpleado>> GetByLocalIdAsync(int localId)
    {
        return await _context.PagosEmpleado
            .AsNoTracking()
            .Include(p => p.Local)
            .Include(p => p.Vendedor)
            .Where(p => p.LocalId == localId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagoEmpleado>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta)
    {
        return await _context.PagosEmpleado
            .AsNoTracking()
            .Include(p => p.Local)
            .Include(p => p.Vendedor)
            .Where(p => p.FechaPago >= desde && p.FechaPago <= hasta)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagoEmpleado>> GetByVendedorIdAsync(int vendedorId)
    {
        return await _context.PagosEmpleado
            .AsNoTracking()
            .Include(p => p.Local)
            .Include(p => p.Vendedor)
            .Where(p => p.VendedorId == vendedorId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();
    }
}
