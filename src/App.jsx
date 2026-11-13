import { useState, useEffect } from 'react';
import './App.css';
import TarjetaMetrica from './components/TarjetaMetrica';
import TablaDatos from './components/TablaDatos';
import { obtenerDatosVisualizacion, procesarDatos } from './services/dataService';
import PanelAnalitico from './components/PanelAnalitico';

function App() {
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const datos = await obtenerDatosVisualizacion();
      setDataset(procesarDatos(datos));
    };
    cargar();
  }, []);

  if (!dataset) return <p className="contenedor">Cargando datos...</p>;

  const { filas, resumen } = dataset;

  return (
    <div className="contenedor">
      <h1>Dashboard climático – CDMX </h1>
        <h1>(Octubre 2026)</h1>

      <div className="tarjetas">
        <TarjetaMetrica titulo="Temp. máxima promedio" valor={resumen.promedioMax} unidad="°C" />
        <TarjetaMetrica titulo="Temp. mínima promedio" valor={resumen.promedioMin} unidad="°C" />
        <TarjetaMetrica titulo="Lluvia acumulada" valor={resumen.lluviaTotal} unidad="mm" />
        <TarjetaMetrica titulo="Días con lluvia" valor={resumen.diasConLluvia} unidad="días" />
      </div>

      <TablaDatos filas={filas} />
      <PanelAnalitico />
    </div>
  );
}

export default App;