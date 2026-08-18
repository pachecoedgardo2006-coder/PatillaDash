using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface IPagoEmpleadoRepository
{
    Task AddAsync(PagoEmpleado pago);
    Task<IEnumerable<PagoEmpleado>> GetByLocalIdAsync(int localId);
    Task<IEnumerable<PagoEmpleado>> GetAllByDateRangeAsync(DateTime desde, DateTime hasta);
}