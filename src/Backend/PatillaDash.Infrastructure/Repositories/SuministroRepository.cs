using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class SuministroRepository : ISuministroRepository
{
    private readonly PatillaDbContext _context;

    public SuministroRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task<Suministro?> GetByIdAsync(int id)
    {
        return await _context.Suministros
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Suministro>> GetAllAsync()
    {
        return await _context.Suministros
            .ToListAsync();
    }

    public async Task AddAsync(Suministro suministro)
    {
        await _context.Suministros.AddAsync(suministro);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Suministro suministro)
    {
        _context.Suministros.Update(suministro);
        await _context.SaveChangesAsync();
    }
}
