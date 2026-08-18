using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface ISuministroRepository
{
    Task<Suministro?> GetByIdAsync(int id);
    Task<IEnumerable<Suministro>> GetAllAsync();
    Task AddAsync(Suministro suministro);
    Task UpdateAsync(Suministro suministro);
}