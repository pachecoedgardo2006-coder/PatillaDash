using PatillaDash.Domain.Entities;

namespace PatillaDash.Domain.Interfaces;

public interface ILocalRepository
{
    Task<Local?> GetByIdAsync(int id);
    Task<IEnumerable<Local>> GetAllAsync();
    Task AddAsync(Local local);
    Task UpdateAsync(Local local);
}