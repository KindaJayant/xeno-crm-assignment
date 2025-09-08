import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import CampaignCreationPage from './pages/CampaignCreationPage';
import CampaignHistoryPage from './pages/CampaignHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CampaignCreationPage />} />
        <Route path="/history" element={<CampaignHistoryPage />} />
        {/* We'll set a default route later */}
        <Route path="/" element={<CampaignCreationPage />} />
      </Routes>
    </Router>
  );
}

export default App;