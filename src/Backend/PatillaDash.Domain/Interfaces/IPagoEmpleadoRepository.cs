using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface IPagoEmpleadoRepository
{
    Task AddAsync(PagoEmpleado pago);
    Task<PagoEmpleado?> GetByIdAsync(int id);
    Task<IEnumerable<PagoEmpleado>> GetAllAsync();
    Task<IEnumerable<PagoEmpleado>> GetByLocalIdAsync(int localId);
    Task<IEnumerable<PagoEmpleado>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta);
}
