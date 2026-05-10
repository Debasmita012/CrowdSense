const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "https://crowdsense-backend-4hrt.onrender.com" 
    : "http://127.0.0.1:8000");

export default API_BASE;
