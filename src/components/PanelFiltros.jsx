import { CIUDADES } from '../data/ciudades';

export default function PanelFiltros({ filtros, setFiltros }) {
  const cambiar = (e) => {
    const { name, value } = e.target;
    setFiltros((anterior) => ({ ...anterior, [name]: value }));
  };

  return (
    <div className="panel-filtros">
      <h3>Filtros</h3>

      <label>
        Ciudad
        <select name="ciudad" value={filtros.ciudad} onChange={cambiar}>
          {Object.entries(CIUDADES).map(([clave, c]) => (
            <option key={clave} value={clave}>{c.nombre}</option>
          ))}
        </select>
      </label>

      <label>
        Fecha inicio
        <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={cambiar} />
      </label>

      <label>
        Fecha fin
        <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={cambiar} />
      </label>
    </div>
  );
}