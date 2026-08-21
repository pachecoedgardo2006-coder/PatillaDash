namespace PatillaDash.Application.DTOs.Estadisticas;

public class RankingLocalDto
{
    public int LocalId { get; set; }
    public string NombreLocal { get; set; } = string.Empty;
    public decimal TotalVentas { get; set; }
}