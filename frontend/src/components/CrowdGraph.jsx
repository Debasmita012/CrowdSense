import { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * LiveCrowdGraph
 * Accepts `graphData` (nodes + edges) and `gcnScores` from the SSE stream.
 * Nodes with a high GCN anomaly score pulse red; low-score nodes stay purple.
 */
export default function CrowdGraph({ graphData, gcnScores }) {
  const svgRef = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 560;
    const height = 300;

    // First call — build the SVG skeleton once
    if (svg.select("g.links").empty()) {
      svg.append("g").attr("class", "links");
      svg.append("g").attr("class", "nodes");
    }

    const nodes = graphData.nodes.map((n) => ({
      id: n.id,
      x: n.x ?? Math.random() * width,
      y: n.y ?? Math.random() * height,
    }));

    const links = (graphData.edges || []).map((e) => ({
      source: e.source,
      target: e.target,
    }));

    // Rebuild simulation each update (lightweight for small graphs)
    if (simRef.current) simRef.current.stop();

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(60)
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(14))
      .alphaDecay(0.08);

    simRef.current = simulation;

    // --- Links ---
    const linkSel = svg
      .select("g.links")
      .selectAll("line")
      .data(links, (d) => `${d.source}-${d.target}`);

    linkSel.exit().remove();

    const linkEnter = linkSel
      .enter()
      .append("line")
      .attr("stroke", "rgba(140, 115, 98, 0.2)")
      .attr("stroke-width", 1);

    const allLinks = linkEnter.merge(linkSel);

    // --- Nodes ---
    const score = (id) => (gcnScores && gcnScores[id] != null ? gcnScores[id] : 0);

    const nodeSel = svg
      .select("g.nodes")
      .selectAll("circle")
      .data(nodes, (d) => d.id);

    nodeSel.exit().remove();

    const nodeEnter = nodeSel
      .enter()
      .append("circle")
      .attr("r", 7)
      .attr("stroke", "rgba(140, 115, 98, 0.3)")
      .attr("stroke-width", 1);

    const allNodes = nodeEnter.merge(nodeSel);

    // Color & pulsing class based on score
    allNodes
      .attr("fill", (d) => {
        const s = score(d.id);
        if (s > 0.65) return "var(--accent-danger)"; // high anomaly → red
        if (s > 0.35) return "var(--accent-warning)"; // medium → amber
        return "var(--accent-primary)"; // low → taupe
      })
      .classed("pulse-red", (d) => score(d.id) > 0.65)
      .classed("pulse-amber", (d) => score(d.id) > 0.35 && score(d.id) <= 0.65);

    simulation.on("tick", () => {
      allLinks
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      allNodes
        .attr("cx", (d) => Math.max(10, Math.min(width - 10, d.x)))
        .attr("cy", (d) => Math.max(10, Math.min(height - 10, d.y)));
    });
  }, [graphData, gcnScores]);

  return (
    <div
      className="glass-card"
      style={{ padding: "20px" }}
    >
      <h3
        style={{
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-bright)",
          fontFamily: "var(--font-serif)"
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--accent-primary)",
          }}
        />
        Live Crowd Graph — GCN Anomaly Scores
      </h3>

      <svg
        ref={svgRef}
        width="100%"
        height="300"
        style={{ display: "block", borderRadius: "8px", background: "rgba(140, 115, 98, 0.05)", border: "1px solid var(--glass-border)" }}
      />

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--accent-primary)", marginRight: 4 }} />
          Normal
        </span>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--accent-warning)", marginRight: 4 }} />
          Warning
        </span>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--accent-danger)", marginRight: 4, animation: "pulseNode 1s infinite" }} />
          High Anomaly (pulsing)
        </span>
      </div>

      <style>{`
        @keyframes pulseNode {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
        circle.pulse-red {
          animation: svgPulseRed 1s ease-in-out infinite;
        }
        circle.pulse-amber {
          animation: svgPulseAmber 1.5s ease-in-out infinite;
        }
        @keyframes svgPulseRed {
          0%, 100% { r: 7; opacity: 1; filter: drop-shadow(0 0 4px #ef4444); }
          50% { r: 10; opacity: 0.85; filter: drop-shadow(0 0 10px #ef4444); }
        }
        @keyframes svgPulseAmber {
          0%, 100% { r: 7; filter: drop-shadow(0 0 3px #f59e0b); }
          50% { r: 9; filter: drop-shadow(0 0 8px #f59e0b); }
        }
      `}</style>
    </div>
  );
}