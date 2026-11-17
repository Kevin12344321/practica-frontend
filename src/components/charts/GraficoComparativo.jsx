import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import useAncho from './useAncho';

const COLORES = ['#b0bec5', '#81d4fa', '#29b6f6', '#0d47a1'];

export default function GraficoComparativo({ labels, values, unidad = 'días', alto = 300 }) {
  const contenedorRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const ancho = useAncho(contenedorRef);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // limpiar el lienzo
    if (!ancho || labels.length === 0) return;

    const margen = { top: 25, right: 15, bottom: 40, left: 40 };
    const w = ancho - margen.left - margen.right;
    const h = alto - margen.top - margen.bottom;
    svg.attr('width', ancho).attr('height', alto);
    const g = svg.append('g').attr('transform', `translate(${margen.left},${margen.top})`);

    // Escalas
    const x = d3.scaleBand().domain(labels).range([0, w]).padding(0.3);
    const maximo = Math.max(1, d3.max(values));
    const y = d3.scaleLinear().domain([0, maximo]).nice().range([h, 0]);
    const color = d3.scaleOrdinal().domain(labels).range(COLORES);
    const total = d3.sum(values);
    const datos = labels.map((label, i) => ({ label, v: values[i] }));

    // Rejilla y ejes
    g.append('g').attr('class', 'rejilla')
      .call(d3.axisLeft(y).ticks(Math.min(6, maximo)).tickSize(-w).tickFormat(''))
      .call((s) => s.select('.domain').remove());
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y).ticks(Math.min(6, maximo)).tickFormat(d3.format('d')));

    const tooltip = d3.select(tooltipRef.current);

    // Barras con animación y tooltip
    g.selectAll('rect').data(datos).join('rect')
      .attr('x', (d) => x(d.label)).attr('width', x.bandwidth())
      .attr('y', h).attr('height', 0).attr('rx', 4)
      .attr('fill', (d) => color(d.label))
      .style('cursor', 'pointer')
      .on('mousemove', (evento, d) => {
        const [px, py] = d3.pointer(evento, contenedorRef.current);
        const pct = total ? ((d.v / total) * 100).toFixed(1) : 0;
        tooltip.style('opacity', 1)
          .style('left', `${px + 12}px`).style('top', `${py - 30}px`)
          .html(`<strong>${d.label}</strong><br/>${d.v} ${unidad} (${pct}%)`);
        d3.select(evento.currentTarget).attr('opacity', 0.75);
      })
      .on('mouseleave', (evento) => {
        tooltip.style('opacity', 0);
        d3.select(evento.currentTarget).attr('opacity', 1);
      })
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.v)).attr('height', (d) => h - y(d.v));

    // Valor encima de cada barra
    g.selectAll('.valor').data(datos).join('text')
      .attr('class', 'valor').attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', '#333')
      .attr('x', (d) => x(d.label) + x.bandwidth() / 2).attr('y', h)
      .text((d) => d.v)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.v) - 6);
  }, [labels, values, unidad, alto, ancho]);

  return (
    <div className="grafico-d3" ref={contenedorRef}>
      {labels.length === 0 && <p className="sin-datos">Sin datos para mostrar</p>}
      <svg ref={svgRef} />
      <div className="tooltip-d3" ref={tooltipRef} />
    </div>
  );
}