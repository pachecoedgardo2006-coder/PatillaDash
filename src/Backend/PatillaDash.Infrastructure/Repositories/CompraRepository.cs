using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class CompraRepository : ICompraRepository
{
    private readonly PatillaDbContext _context;

    public CompraRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(CompraInsumo compra)
    {
        await _context.ComprasInsumo.AddAsync(compra);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<CompraInsumo>> GetByLocalIdAsync(int localId)
    {
        return await _context.ComprasInsumo
            .Include(c => c.Local)
            .Include(c => c.Suministro)
            .Where(c => c.LocalId == localId)
            .OrderByDescending(c => c.Fecha)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompraInsumo>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta)
    {
        return await _context.ComprasInsumo
            .Include(c => c.Local)
            .Include(c => c.Suministro)
            .Where(c => c.Fecha >= desde && c.Fecha <= hasta)
            .OrderByDescending(c => c.Fecha)
            .ToListAsync();
    }
}
