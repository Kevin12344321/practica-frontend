import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import useAncho from './useAncho';

export default function GraficoTendencia({ labels, series, unidad = '°C', alto = 300 }) {
  const contenedorRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const ancho = useAncho(contenedorRef);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // limpiar el lienzo
    if (!ancho || labels.length === 0) return;

    const margen = { top: 20, right: 20, bottom: 40, left: 50 };
    const w = ancho - margen.left - margen.right;
    const h = alto - margen.top - margen.bottom;
    svg.attr('width', ancho).attr('height', alto);
    const g = svg.append('g').attr('transform', `translate(${margen.left},${margen.top})`);

    // Escalas
    const x = d3.scalePoint().domain(labels).range([0, w]).padding(0.5);
    const todos = series.flatMap((s) => s.values);
    const y = d3.scaleLinear()
      .domain([d3.min(todos) - 2, d3.max(todos) + 2]).nice()
      .range([h, 0]);

    // Rejilla y ejes
    g.append('g').attr('class', 'rejilla')
      .call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat(''))
      .call((s) => s.select('.domain').remove());

    const cadaN = Math.ceil(labels.length / Math.max(1, Math.floor(w / 60)));
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickValues(labels.filter((_, i) => i % cadaN === 0)));
    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat((v) => `${v}${unidad}`));

    const linea = d3.line()
      .x((d) => x(d.label))
      .y((d) => y(d.v))
      .curve(d3.curveMonotoneX);
    const tooltip = d3.select(tooltipRef.current);

    series.forEach((s) => {
      const puntos = s.values.map((v, i) => ({ v, label: labels[i] }));

      // Línea con animación de dibujo
      const path = g.append('path').datum(puntos)
        .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2.5)
        .attr('d', linea);
      const largo = path.node().getTotalLength();
      path.attr('stroke-dasharray', `${largo} ${largo}`).attr('stroke-dashoffset', largo)
        .transition().duration(900).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

      // Puntos con tooltip
      g.selectAll(null).data(puntos).join('circle')
        .attr('cx', (d) => x(d.label)).attr('cy', (d) => y(d.v)).attr('r', 0)
        .attr('fill', s.color).attr('stroke', '#fff').attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mousemove', (evento, d) => {
          const [px, py] = d3.pointer(evento, contenedorRef.current);
          tooltip.style('opacity', 1)
            .style('left', `${px + 12}px`).style('top', `${py - 30}px`)
            .html(`<strong>${d.label}</strong><br/>${s.nombre}: ${d.v} ${unidad}`);
          d3.select(evento.currentTarget).attr('r', 7);
        })
        .on('mouseleave', (evento) => {
          tooltip.style('opacity', 0);
          d3.select(evento.currentTarget).attr('r', 4);
        })
        .transition().delay(600).duration(300).attr('r', 4);
    });
  }, [labels, series, unidad, alto, ancho]);

  return (
    <div className="grafico-d3" ref={contenedorRef}>
      <div className="leyenda">
        {series.map((s) => (
          <span key={s.nombre}><i style={{ background: s.color }} /> {s.nombre}</span>
        ))}
      </div>
      {labels.length === 0 && <p className="sin-datos">Sin datos para mostrar</p>}
      <svg ref={svgRef} />
      <div className="tooltip-d3" ref={tooltipRef} />
    </div>
  );
}