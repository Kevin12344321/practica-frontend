export default function TarjetaMetrica({ titulo, valor, unidad }) {
  return (
    <div className="tarjeta">
      <p className="tarjeta-titulo">{titulo}</p>
      <p className="tarjeta-valor">
        {valor} <span>{unidad}</span>
      </p>
    </div>
  );
}