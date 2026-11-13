import datosClima from '../data/clima.json';
import apiClient from './apiClient';

export function obtenerDatosVisualizacion() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(datosClima), 800); 
  });
}

export function procesarDatos(datos) {
  const filas = datos.map((d) => ({
    fecha: new Date(d.fecha + 'T00:00').toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short',
    }),
    tempMax: Number(d.tempMax.toFixed(1)),
    tempMin: Number(d.tempMin.toFixed(1)),
    lluvia: Number(d.lluvia.toFixed(1)),
  }));

  const total = filas.length;
  const resumen = {
    promedioMax: (filas.reduce((s, f) => s + f.tempMax, 0) / total).toFixed(1),
    promedioMin: (filas.reduce((s, f) => s + f.tempMin, 0) / total).toFixed(1),
    lluviaTotal: filas.reduce((s, f) => s + f.lluvia, 0).toFixed(1),
    diasConLluvia: filas.filter((f) => f.lluvia > 0).length,
  };

  return { filas, resumen };
}

export async function obtenerSerieDeTiempo({ latitud, longitud, fechaInicio, fechaFin }) {
  const respuesta = await apiClient.get('/archive', {
    params: {
      latitude: latitud,
      longitude: longitud,
      start_date: fechaInicio,
      end_date: fechaFin,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'auto',
    },
  });

  // Extraer el payload y devolverlo limpio (mismo formato que clima.json)
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = respuesta.data.daily;
  return time.map((fecha, i) => ({
    fecha,
    tempMax: temperature_2m_max[i] ?? 0,
    tempMin: temperature_2m_min[i] ?? 0,
    lluvia: precipitation_sum[i] ?? 0,
  }));
}