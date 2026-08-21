using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class LocalRepository : ILocalRepository
{
    private readonly PatillaDbContext _context;

    public LocalRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task<Local?> GetByIdAsync(int id)
    {
        return await _context.Locales
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<Local>> GetAllAsync()
    {
        return await _context.Locales
            .ToListAsync();
    }

    public async Task AddAsync(Local local)
    {
        await _context.Locales.AddAsync(local);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Local local)
    {
        _context.Locales.Update(local);
        await _context.SaveChangesAsync();
    }
}
