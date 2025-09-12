// client/src/pages/CampaignHistoryPage.jsx
import { useCallback, useEffect, useState } from "react";
import "./CampaignHistoryPage.css";

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    try {
      setError("");
      setLoading(true);

      // ✅ use proxy (/api) so dev & prod work the same
      const res = await fetch("/api/campaigns", { signal });
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.message || res.statusText;
        throw new Error(msg || "Failed to fetch campaigns");
      }
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to load campaign history");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const handleRefresh = () => {
    const ac = new AbortController();
    load(ac.signal);
    // no need to keep the controller—this is a one-off fetch
  };

  if (loading) {
    return (
      <div className="history-container">
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="history-container">
        <p className="error">{error}</p>
        <button onClick={handleRefresh}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Campaign History</h1>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Audience Size</th>
                <th>Sent</th>
                <th>Failed</th>
                <th>Conjunction</th>
                <th>Rules</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => {
                const created = c.createdAt ? new Date(c.createdAt).toLocaleString() : "-";
                const rulesSummary = Array.isArray(c.rules)
                  ? c.rules.map((r) => `${r.field} ${r.operator} ${r.value}`).join("  |  ")
                  : "";

                const sent = c?.stats?.sent ?? 0;
                const failed = c?.stats?.failed ?? 0;

                return (
                  <tr key={c._id || i}>
                    <td>{i + 1}</td>
                    <td>{c.audienceSize ?? 0}</td>
                    <td>{sent}</td>
                    <td>{failed}</td>
                    <td>{(c.conjunction || "AND").toUpperCase()}</td>
                    <td>
                      <div className="rules-cell">
                        <span className="rules-summary">{rulesSummary || "—"}</span>
                        {Array.isArray(c.rules) && c.rules.length > 0 && (
                          <details>
                            <summary>view</summary>
                            <pre className="rules-json">
                              {JSON.stringify(c.rules, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </td>
                    <td>{created}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
