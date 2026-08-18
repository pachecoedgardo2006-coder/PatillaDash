using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface ICompraRepository
{
    Task AddAsync(CompraInsumo compra);
    Task<IEnumerable<CompraInsumo>> GetByLocalIdAsync(int localId);
    Task<IEnumerable<CompraInsumo>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta);
}