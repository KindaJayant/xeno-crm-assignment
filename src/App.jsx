import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css'; // keep your global styles

// YOUR existing components (each already imports its own CSS)
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

import CampaignCreationPage from './pages/CampaignCreationPage.jsx';
import CampaignHistoryPage from './pages/CampaignHistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar /> {/* your Navbar.jsx already imports ./Navbar.css */}
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Default -> Create Campaign */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CampaignCreationPage />
              </ProtectedRoute>
            }
          />

          {/* Optional alias */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CampaignCreationPage />
              </ProtectedRoute>
            }
          />

          {/* History */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <CampaignHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
