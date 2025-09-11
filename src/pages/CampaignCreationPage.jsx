import React, { useEffect, useState } from 'react';

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    // If you set the Vite proxy, use '/api/campaigns'. Otherwise use full URL.
    fetch('/api/campaigns')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading campaigns…</div>;
  if (err) return <div style={{ padding: 16, color: 'crimson' }}>Error: {err}</div>;
  if (!campaigns.length) return <div style={{ padding: 16 }}>No campaigns yet.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Campaign History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Audience Size</th>
            <th style={th}>Conjunction</th>
            <th style={th}>Rules</th>
            <th style={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, idx) => (
            <tr key={c._id}>
              <td style={td}>{idx + 1}</td>
              <td style={td}>{c.audienceSize}</td>
              <td style={td}>{c.conjunction}</td>
              <td style={td}>
                <code style={{ fontSize: 12 }}>
                  {JSON.stringify(c.rules)}
                </code>
              </td>
              <td style={td}>
                {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { textAlign: 'left', borderBottom: '1px solid #333', padding: '8px' };
const td = { borderBottom: '1px solid #444', padding: '8px' };
