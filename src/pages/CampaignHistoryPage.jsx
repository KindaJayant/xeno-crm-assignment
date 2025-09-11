import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CampaignHistoryPage.css';

const CampaignHistoryPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  fetch('http://localhost:5000/api/campaigns')  // 👈 not /api/campaigns
    .then(res => res.json())
    .then(data => setCampaigns(data))
    .catch(err => console.error(err));
}, []);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

// ... keep all the logic above the return statement ...

  return (
    <div className="history-container">
      <h1>Campaign History</h1>
      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <ul className="campaign-list">
          {/* ... campaign list mapping ... */}
        </ul>
      )}
    </div>
  );
};

export default CampaignHistoryPage;