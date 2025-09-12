// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CampaignCreationPage from "./pages/CampaignCreationPage.jsx";
import CampaignHistoryPage from "./pages/CampaignHistoryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<CampaignCreationPage />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <CampaignHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </>
  );
}
