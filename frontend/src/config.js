// ─────────────────────────────────────────────────────────────────────────────
// API Configuration
// Change VITE_API_URL in your .env file OR update this line directly.
// Local dev:      http://127.0.0.1:8000
// Production:     https://YOUR-APP-NAME.onrender.com
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default API_BASE;
