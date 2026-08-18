using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface IVentaRepository
{
    Task AddAsync(RegistroVentaDiaria venta);
    Task<RegistroVentaDiaria?> GetByIdAsync(int id);
    Task<IEnumerable<RegistroVentaDiaria>> GetByLocalAndDateRangeAsync(int localId, DateTime desde, DateTime hasta);
    Task<IEnumerable<RegistroVentaDiaria>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta);
}