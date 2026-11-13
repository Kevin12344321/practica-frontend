import { useState } from 'react';
import TarjetaMetrica from './TarjetaMetrica';
import TablaDatos from './TablaDatos';
import { obtenerSerieDeTiempo, procesarDatos } from '../services/dataService';

export default function PanelAnalitico() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-10-15');

  const consultar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setDatos(null);
    try {
      const resultado = await obtenerSerieDeTiempo({
        latitud: 19.43,
        longitud: -99.13,
        fechaInicio,
        fechaFin,
      });
      setDatos(procesarDatos(resultado));
    } catch (err) {
      setError(err.response?.data?.reason || err.message || 'Error al consultar la API');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="panel">
      <h2>Panel analítico – Datos reales de Open-Meteo</h2>

      <form onSubmit={consultar} className="formulario">
        <label>
          Inicio: <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </label>
        <label>
          Fin: <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </label>
        <button type="submit" disabled={cargando}>
          {cargando ? 'Consultando...' : 'Consultar API'}
        </button>
      </form>

      {cargando && <p className="cargando">Analizando datos...</p>}

      {error && <div className="alerta-error">Error: {error}</div>}

      {datos && (
        <>
          <div className="tarjetas">
            <TarjetaMetrica titulo="Temp. máxima promedio" valor={datos.resumen.promedioMax} unidad="°C" />
            <TarjetaMetrica titulo="Temp. mínima promedio" valor={datos.resumen.promedioMin} unidad="°C" />
            <TarjetaMetrica titulo="Lluvia acumulada" valor={datos.resumen.lluviaTotal} unidad="mm" />
            <TarjetaMetrica titulo="Días con lluvia" valor={datos.resumen.diasConLluvia} unidad="días" />
          </div>
          <TablaDatos filas={datos.filas} />
        </>
      )}
    </section>
  );
}