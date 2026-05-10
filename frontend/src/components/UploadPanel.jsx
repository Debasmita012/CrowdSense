import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useStream } from "../context/StreamContext";
import API_BASE from "../config";

export default function UploadPanel() {
  const { setVideoId } = useStream();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success") {
        setVideoId(res.data.video_id);
        navigate("/monitor");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed — Check server status.");
    }
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
      <div className="feature-pill" style={{ color: "var(--accent-secondary)", borderColor: "var(--accent-secondary)" }}>AI Core v4</div>
      <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "12px" }}>Upload Feed</h2>
      <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", marginBottom: "32px" }}>
        Initialize the neural engine by uploading your surveillance stream.
      </p>

      <div 
        style={{ 
          padding: "40px 20px", 
          border: "2px dashed var(--glass-border)", 
          borderRadius: "var(--radius-lg)",
          background: "rgba(0,0,0,0.2)",
          marginBottom: "24px",
          cursor: "pointer"
        }}
        onClick={() => document.getElementById("video-upload").click()}
      >
        <input
          type="file"
          id="video-upload"
          accept="video/mp4,video/avi"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎬</div>
        <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
          {file ? file.name : "Select Surveillance Video"}
        </div>
        <div style={{ color: "var(--text-soft)", fontSize: "0.8rem", marginTop: "4px" }}>
          MP4 / AVI up to 100MB
        </div>
      </div>

      <button
        className="btn-action"
        style={{ width: "100%" }}
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? "Engaging AI..." : "Initialize AI Stream"}
      </button>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
        {["YOLOv8", "GCN", "LSTM"].map(t => (
          <span key={t} style={{ fontSize: "0.7rem", padding: "4px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", color: "var(--text-soft)" }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}