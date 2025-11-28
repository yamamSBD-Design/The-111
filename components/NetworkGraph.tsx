import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { THEME } from '../constants';

const NetworkGraph = ({ stability }: { stability: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Generate dummy network data
    const nodes = Array.from({ length: 15 }, (_, i) => ({ id: i, r: Math.random() * 5 + 3 }));
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        if (i > 0) links.push({ source: i, target: i - 1 });
        if (Math.random() > 0.7) links.push({ source: i, target: Math.floor(Math.random() * i) });
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(40))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", THEME.primary)
      .attr("stroke-opacity", 0.3)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 4)
      .attr("fill", (d, i) => i === 0 ? THEME.accent : THEME.primary)
      .attr("fill-opacity", 0.8);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [stability]);

  return (
    <div className="w-full h-48 bg-black/50 border-t border-b border-cyan-900 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 text-xs font-mono text-cyan-600">
        NODES: ACTIVE<br/>
        LATENCY: 12ms
      </div>
    </div>
  );
};

export default NetworkGraph;