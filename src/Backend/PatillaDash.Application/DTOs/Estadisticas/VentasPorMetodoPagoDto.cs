namespace PatillaDash.Application.DTOs.Estadisticas;

public class VentasPorMetodoPagoDto
{
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTransferencia { get; set; }
    public double PorcentajeEfectivo => (TotalEfectivo + TotalTransferencia) > 0 
        ? (double)(TotalEfectivo / (TotalEfectivo + TotalTransferencia)) * 100 : 0;
    public double PorcentajeTransferencia => (TotalEfectivo + TotalTransferencia) > 0 
        ? (double)(TotalTransferencia / (TotalEfectivo + TotalTransferencia)) * 100 : 0;
}