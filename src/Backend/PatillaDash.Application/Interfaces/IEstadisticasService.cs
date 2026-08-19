using PatillaDash.Application.DTOs.Estadisticas;

namespace PatillaDash.Application.Interfaces;

public interface IEstadisticasService
{
    Task<DashboardEstadisticasDto> ObtenerDashboardGeneralAsync(DateTime? fechaInicio = null, DateTime? fechaFin = null);
}