import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';

export default function GraficoClima({ filas }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={filas}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis yAxisId="temp" unit="°C" />
        <YAxis yAxisId="lluvia" orientation="right" unit=" mm" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="lluvia" dataKey="lluvia" name="Lluvia (mm)" fill="#90caf9" />
        <Line yAxisId="temp" type="monotone" dataKey="tempMax" name="Temp. máx (°C)" stroke="#d32f2f" strokeWidth={2} />
        <Line yAxisId="temp" type="monotone" dataKey="tempMin" name="Temp. mín (°C)" stroke="#1565c0" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}