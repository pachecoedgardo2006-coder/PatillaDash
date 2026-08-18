using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface IInventarioRepository
{
    Task<InventarioLocal?> GetByLocalAndSuministroAsync(int localId, int suministroId);
    Task<IEnumerable<InventarioLocal>> GetByLocalIdAsync(int localId);
    Task AddAsync(InventarioLocal inventario);
    Task UpdateAsync(InventarioLocal inventario);
}