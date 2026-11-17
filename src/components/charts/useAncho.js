import { useEffect, useState } from 'react';

export default function useAncho(ref) {
  const [ancho, setAncho] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const observador = new ResizeObserver(([entrada]) => {
      setAncho(entrada.contentRect.width);
    });
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [ref]);

  return ancho;
}