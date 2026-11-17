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






// Convierte el arreglo de datos en la estructura que usan las gráficas
export function formatearParaGrafico(datosCrudos, campo = 'tempMax') {
  if (!Array.isArray(datosCrudos) || datosCrudos.length === 0) {
    return { labels: [], values: [] }; // evita errores con arreglos vacíos
  }
  return {
    labels: datosCrudos.map((d) => d.fecha),
    values: datosCrudos.map((d) => Number(d[campo]) || 0),
  };
}

// Cuenta los días por intensidad de lluvia (para la gráfica comparativa)
export function agruparLluviaPorCategoria(datosCrudos) {
  const conteo = { 'Sin lluvia': 0, Ligera: 0, Moderada: 0, Fuerte: 0 };
  if (!Array.isArray(datosCrudos)) {
    return { labels: Object.keys(conteo), values: Object.values(conteo) };
  }
  datosCrudos.forEach(({ lluvia }) => {
    if (lluvia === 0) conteo['Sin lluvia']++;
    else if (lluvia < 2.5) conteo.Ligera++;
    else if (lluvia <= 7.5) conteo.Moderada++;
    else conteo.Fuerte++;
  });
  return { labels: Object.keys(conteo), values: Object.values(conteo) };
}