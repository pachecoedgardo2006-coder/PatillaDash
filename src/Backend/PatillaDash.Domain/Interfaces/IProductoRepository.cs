using System.Collections.Generic;
using System.Threading.Tasks;
using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface IProductoRepository
{
    Task<Producto?> GetByIdAsync(int id);
    Task<IEnumerable<Producto>> GetAllAsync(bool? soloActivos = null);
    Task AddAsync(Producto producto);
    Task UpdateAsync(Producto producto);
}
