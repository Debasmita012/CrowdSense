import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useStream } from "../context/StreamContext";

function LiveGraph({ graphData, gcnScores }) {
  const svgRef = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;
    const el = svgRef.current;
    if (!el) return;
    const svg = d3.select(el);
    const width = el.clientWidth || 700;
    const height = 450;

    if (svg.select("g.links").empty()) {
      svg.append("g").attr("class", "links");
      svg.append("g").attr("class", "nodes");
    }

    const nodes = graphData.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
    const links = (graphData.edges || []).map((e) => ({ source: e.source, target: e.target }));

    if (simRef.current) simRef.current.stop();
    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(15))
      .alphaDecay(0.06);

    simRef.current = sim;
    const score = (id) => (gcnScores && gcnScores[id] != null ? gcnScores[id] : 0);

    const linkSel = svg.select("g.links").selectAll("line").data(links);
    linkSel.exit().remove();
    const allLinks = linkSel.enter().append("line")
      .attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", 1.5)
      .merge(linkSel);

    const nodeSel = svg.select("g.nodes").selectAll("circle").data(nodes, (d) => d.id);
    nodeSel.exit().remove();
    const allNodes = nodeSel.enter().append("circle")
      .attr("r", 8).attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1)
      .merge(nodeSel);

    allNodes.attr("fill", (d) => {
      const s = score(d.id);
      if (s > 0.65) return "var(--accent-danger)";
      if (s > 0.35) return "var(--accent-warning)";
      return "var(--accent-primary)";
    }).classed("pulse-red", (d) => score(d.id) > 0.65);

    sim.on("tick", () => {
      allLinks.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      allNodes.attr("cx", (d) => Math.max(15, Math.min(width - 15, d.x))).attr("cy", (d) => Math.max(15, Math.min(height - 15, d.y)));
    });
  }, [graphData, gcnScores]);

  return <svg ref={svgRef} width="100%" height="450" style={{ display: "block", borderRadius: "24px", background: "rgba(0,0,0,0.4)" }} />;
}

export default function GraphPage() {
  const { graphData, gcnScores, isStreaming } = useStream();
  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];
  const scores = Object.values(gcnScores || {});
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3) : "0.00";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="feature-pill" style={{ color: "var(--accent-secondary)" }}>Network Intelligence</div>
          <h1 className="page-title">Proximity Graph</h1>
        </div>
      </div>

      {/* Modern Insight Panel */}
      <div className="glass-card" style={{ padding: "30px", marginBottom: "40px", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)", borderLeft: "4px solid var(--accent-primary)" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "3rem", background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "24px" }}>⬡</div>
          <div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>Collective Behavior Analysis</h3>
            <p className="readable-text">
              The AI maps every person as a node. When individuals are within <strong>80 pixels</strong> of each other, 
              a proximity edge is formed. Our Graph Convolutional Network (GCN) then scans the entire social fabric 
              to detect turbulent movement patterns that traditional tracking would miss.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Metric Pills */}
      <div className="stats-row">
        <div className="stat-card" style={{ background: "rgba(0,212,255,0.05)", borderColor: "rgba(0,212,255,0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-secondary)" }}>{nodes.length}</span>
          <span className="sc-lbl">Active Nodes</span>
        </div>
        <div className="stat-card" style={{ background: "rgba(124, 58, 237, 0.05)", borderColor: "rgba(124, 58, 237, 0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-primary)" }}>{edges.length}</span>
          <span className="sc-lbl">Network Edges</span>
        </div>
        <div className="stat-card" style={{ background: "rgba(255,46,99,0.05)", borderColor: "rgba(255,46,99,0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-danger)" }}>{avgScore}</span>
          <span className="sc-lbl">Avg Risk Score</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "10px" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontWeight: "800" }}>Live Topology {!isStreaming && <span style={{ opacity: 0.4 }}>(Engine Idle)</span>}</h3>
          <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
            <span style={{ color: "var(--accent-primary)" }}>● Normal</span>
            <span style={{ color: "var(--accent-warning)" }}>● Warning</span>
            <span style={{ color: "var(--accent-danger)" }}>● Critical</span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          {!isStreaming || !graphData ? (
            <div style={{ height: "450px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", borderRadius: "24px", color: "var(--text-soft)" }}>
              Waiting for AI stream...
            </div>
          ) : (
            <LiveGraph graphData={graphData} gcnScores={gcnScores} />
          )}
        </div>
      </div>

      <style>{`
        circle.pulse-red { animation: nodeRedPulse 1s infinite; }
        @keyframes nodeRedPulse {
          0%, 100% { r: 8; opacity: 1; }
          50% { r: 12; opacity: 0.7; filter: blur(2px); }
        }
      `}</style>
    </div>
  );
}
