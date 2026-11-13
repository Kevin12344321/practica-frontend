import { useState, useEffect } from 'react';
import PanelFiltros from './PanelFiltros';
import TarjetaMetrica from './TarjetaMetrica';
import GraficoClima from './GraficoClima';
import TablaDatos from './TablaDatos';
import { CIUDADES } from '../data/ciudades';
import { obtenerSerieDeTiempo, procesarDatos } from '../services/dataService';
import './DashboardLayout.css';

export default function DashboardLayout() {
  // Estado global de los filtros
  const [filtros, setFiltros] = useState({
    ciudad: 'cdmx',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-31',
  });
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Cada vez que cambian los filtros, se vuelve a consultar la API
  useEffect(() => {
    if (!filtros.fechaInicio || !filtros.fechaFin) return;
    const { latitud, longitud } = CIUDADES[filtros.ciudad];
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const resultado = await obtenerSerieDeTiempo({
          latitud,
          longitud,
          fechaInicio: filtros.fechaInicio,
          fechaFin: filtros.fechaFin,
        });
        if (!cancelado) setDatos(procesarDatos(resultado));
      } catch (err) {
        if (!cancelado) {
          setDatos(null);
          setError(err.response?.data?.reason || err.message);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => { cancelado = true; }; // evita mezclar respuestas viejas
  }, [filtros]);

  const ciudad = CIUDADES[filtros.ciudad].nombre;

  return (
    <div className="dashboard">
      {/* Barra lateral */}
      <aside className="sidebar">
        <h2 className="logo">🌦️ ClimaDash</h2>
        <nav className="menu">
          <a className="activo" href="#dashboard">Dashboard</a>
          <a href="#reportes">Reportes</a>
          <a href="#acerca">Acerca de</a>
        </nav>
        <PanelFiltros filtros={filtros} setFiltros={setFiltros} />
      </aside>

      {/* Área principal */}
      <main className="principal">
        <header className="encabezado">
          <h1>Dashboard climático – {ciudad}</h1>
          <p>Del {filtros.fechaInicio} al {filtros.fechaFin} · Fuente: Open-Meteo</p>
        </header>

        {cargando && <p className="cargando">⏳ Analizando datos...</p>}
        {error && <div className="alerta-error">⚠️ Error: {error}</div>}

        {datos && (
          <>
            {/* Arriba: tarjetas */}
            <section className="zona-tarjetas">
              <TarjetaMetrica titulo="Temp. máxima promedio" valor={datos.resumen.promedioMax} unidad="°C" />
              <TarjetaMetrica titulo="Temp. mínima promedio" valor={datos.resumen.promedioMin} unidad="°C" />
              <TarjetaMetrica titulo="Lluvia acumulada" valor={datos.resumen.lluviaTotal} unidad="mm" />
              <TarjetaMetrica titulo="Días con lluvia" valor={datos.resumen.diasConLluvia} unidad="días" />
            </section>

            {/* Centro: gráfico */}
            <section className="caja">
              <h3>Temperatura y precipitación diaria</h3>
              <GraficoClima filas={datos.filas} />
            </section>

            {/* Abajo: tabla */}
            <section className="caja">
              <h3>Detalle diario</h3>
              <TablaDatos filas={datos.filas} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}