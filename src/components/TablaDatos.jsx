export default function TablaDatos({ filas }) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Temp. máx (°C)</th>
          <th>Temp. mín (°C)</th>
          <th>Lluvia (mm)</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <tr key={f.fecha}>
            <td>{f.fecha}</td>
            <td>{f.tempMax}</td>
            <td>{f.tempMin}</td>
            <td>{f.lluvia}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}