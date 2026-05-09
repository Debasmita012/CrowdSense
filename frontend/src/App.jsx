import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StreamProvider } from "./context/StreamContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MonitorPage from "./pages/MonitorPage";
import GraphPage from "./pages/GraphPage";
import PredictionsPage from "./pages/PredictionsPage";
import AlertsPage from "./pages/AlertsPage";

function App() {
  return (
    <BrowserRouter>
      <StreamProvider>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/monitor" element={<MonitorPage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
            </Routes>
          </main>
        </div>
      </StreamProvider>
    </BrowserRouter>
  );
}

export default App;