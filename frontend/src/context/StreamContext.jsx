import { createContext, useContext, useEffect, useRef, useState } from "react";

const StreamContext = createContext(null);

export function StreamProvider({ children }) {
  const [videoId, setVideoId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [frame, setFrame] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [gcnScores, setGcnScores] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [totalDensity, setTotalDensity] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  const [flowStats, setFlowStats] = useState({});
  const [zoneCapacity, setZoneCapacity] = useState({});
  const [dwelledIds, setDwelledIds] = useState([]);

  const sseRef = useRef(null);

  // Start/restart SSE whenever videoId changes
  useEffect(() => {
    if (!videoId) return;

    // Close any previous connection
    if (sseRef.current) sseRef.current.close();

    setIsStreaming(true);
    setAlerts([]);
    setFrameCount(0);

    const sse = new EventSource(`http://127.0.0.1:8000/stream/${videoId}`);
    sseRef.current = sse;

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.frame) setFrame(`data:image/jpeg;base64,${data.frame}`);
        if (data.heatmap) setHeatmap(data.heatmap);
        if (data.predictions) setPredictions(data.predictions);
        if (data.graph) setGraphData(data.graph);
        if (data.gcn_scores) setGcnScores(data.gcn_scores);
        if (typeof data.total_density === "number") setTotalDensity(data.total_density);
        if (data.flow_stats) setFlowStats(data.flow_stats);
        if (data.zone_capacity) setZoneCapacity(data.zone_capacity);
        if (data.dwelled_ids) setDwelledIds(data.dwelled_ids);
        if (data.alerts && data.alerts.length > 0) {
          setAlerts((prev) => [...prev, ...data.alerts]);
        }
        setFrameCount((c) => c + 1);
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    sse.onerror = () => {
      setIsStreaming(false);
      sse.close();
    };

    return () => {
      sse.close();
      setIsStreaming(false);
    };
  }, [videoId]);

  return (
    <StreamContext.Provider
      value={{
        videoId,
        setVideoId,
        isStreaming,
        frame,
        heatmap,
        graphData,
        gcnScores,
        predictions,
        totalDensity,
        alerts,
        frameCount,
        flowStats,
        zoneCapacity,
        dwelledIds,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStream() {
  return useContext(StreamContext);
}
