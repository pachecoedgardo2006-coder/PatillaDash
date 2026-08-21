using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class InventarioRepository : IInventarioRepository
{
    private readonly PatillaDbContext _context;

    public InventarioRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task<InventarioLocal?> GetByLocalAndSuministroAsync(int localId, int suministroId)
    {
        return await _context.Inventarios
            .Include(i => i.Suministro)
            .Include(i => i.Local)
            .FirstOrDefaultAsync(i => i.LocalId == localId && i.SuministroId == suministroId);
    }

    public async Task<IEnumerable<InventarioLocal>> GetByLocalIdAsync(int localId)
    {
        return await _context.Inventarios
            .Include(i => i.Suministro)
            .Where(i => i.LocalId == localId)
            .ToListAsync();
    }

    public async Task AddAsync(InventarioLocal inventario)
    {
        await _context.Inventarios.AddAsync(inventario);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(InventarioLocal inventario)
    {
        _context.Inventarios.Update(inventario);
        await _context.SaveChangesAsync();
    }
}
