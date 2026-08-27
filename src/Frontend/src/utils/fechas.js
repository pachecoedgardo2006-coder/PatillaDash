/**
 * Utilidad robusta para el procesamiento seguro de fechas y horas,
 * diseñada especialmente para evitar fallos de renderizado en WebKit / Safari iOS.
 */

export function parsearFechaSegura(fechaValor) {
  if (!fechaValor) return null;
  if (fechaValor instanceof Date) {
    return isNaN(fechaValor.getTime()) ? null : fechaValor;
  }

  if (typeof fechaValor === 'string') {
    let limpia = fechaValor.trim();
    if (!limpia) return null;

    // Safari iOS: Si la fecha trae más de 3 decimales en segundos (.1234567Z),
    // recortarla a 3 (.123) para compatibilidad estricta con WebKit/Safari
    limpia = limpia.replace(/(\.\d{3})\d+/, '$1');

    // Safari iOS: Si viene con espacio en lugar de 'T' ("2026-08-27 18:00:00"), normalizar a 'T'
    limpia = limpia.replace(' ', 'T');

    const dt = new Date(limpia);
    if (!isNaN(dt.getTime())) {
      return dt;
    }

    // Fallback nativo
    const dtFallback = new Date(fechaValor);
    if (!isNaN(dtFallback.getTime())) {
      return dtFallback;
    }
  }

  return null;
}

export function formatearFecha(fechaValor, incluirHora = false) {
  const fecha = parsearFechaSegura(fechaValor);
  if (!fecha) return '-';

  try {
    if (incluirHora) {
      return fecha.toLocaleDateString('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return fecha.toLocaleDateString('es-CO');
  } catch (err) {
    try {
      return fecha.toLocaleDateString('es-CO');
    } catch {
      return fecha.toISOString().split('T')[0];
    }
  }
}
