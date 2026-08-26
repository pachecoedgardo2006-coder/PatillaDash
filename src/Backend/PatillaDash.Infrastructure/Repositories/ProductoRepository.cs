using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Persistence;

namespace PatillaDash.Infrastructure.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly PatillaDbContext _context;

    public ProductoRepository(PatillaDbContext context)
    {
        _context = context;
    }

    public async Task<Producto?> GetByIdAsync(int id)
    {
        return await _context.Productos.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Producto>> GetAllAsync(bool? soloActivos = null)
    {
        IQueryable<Producto> query = _context.Productos.AsNoTracking();

        if (soloActivos.HasValue)
        {
            query = query.Where(p => p.Activo == soloActivos.Value);
        }

        return await query.OrderBy(p => p.Categoria).ThenBy(p => p.Nombre).ToListAsync();
    }

    public async Task AddAsync(Producto producto)
    {
        await _context.Productos.AddAsync(producto);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Producto producto)
    {
        _context.Productos.Update(producto);
        await _context.SaveChangesAsync();
    }
}
