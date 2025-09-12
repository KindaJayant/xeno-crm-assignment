import { useState } from "react";
import "./CampaignCreationPage.css";

export default function CampaignCreationPage() {
  const [prompt, setPrompt] = useState("");
  const [conjunction, setConjunction] = useState("AND");
  const [rules, setRules] = useState([{ field: "spend", operator: ">", value: "0" }]);
  const [audienceSize, setAudienceSize] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  const handleRuleChange = (idx, key, val) => {
    const next = [...rules];
    next[idx] = { ...next[idx], [key]: val };
    setRules(next);
  };

  const addRule = () => setRules([...rules, { field: "spend", operator: ">", value: "0" }]);

  const handlePreview = async () => {
    setError("");
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conjunction, rules }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Preview failed");
      setAudienceSize(typeof data?.audienceSize === "number" ? data.audienceSize : 0);
    } catch (e) {
      setError(e.message || "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    setLoadingCreate(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conjunction, rules }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Create failed");
      // success UX is your call; we keep the form here
    } catch (e) {
      setError(e.message || "Create failed");
    } finally {
      setLoadingCreate(false);
    }
  };

  // AI integration: tries a backend endpoint if you wire one up.
  // If /api/rules/generate doesn't exist yet, we gracefully fall back.
const handleGenerateRules = async () => {
  setError("");
  setLoadingAI(true);
  try {
    // ✅ match your server route
    const res = await fetch("/api/ai/generate-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "AI generation failed");
    }

    // Your aiRoutes returns: { rules: [...] }
    const data = await res.json();

    if (Array.isArray(data?.rules) && data.rules.length) {
      // default to AND when multiple rules come back
      setConjunction("AND");
      setRules(
        data.rules.map(r => ({
          field: String(r.field).toLowerCase() === "total spend" ? "spend" : String(r.field),
          operator: String(r.operator),
          value: String(r.value),
        }))
      );
    } else {
      throw new Error("AI returned no rules");
    }
  } catch (e) {
    // graceful fallback so UX still works
    const n = (prompt.match(/\d+/g) || [])[0] ?? "10000";
    setConjunction("AND");
    setRules([{ field: "spend", operator: ">", value: String(n) }]);
    setError(e.message || "AI failed; used fallback.");
  } finally {
    setLoadingAI(false);
  }
};


  return (
    <div className="ccp">
      <h1 className="ccp__title">Campaign Creation Page</h1>
      <p className="ccp__subtitle">Create audience rules to target specific customers.</p>

      <div className="ccp__card">
        {/* AI prompt row */}
        <div className="ccp__ai">
          <input
            className="ccp__ai-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., users who spent more than 10000"
            aria-label="AI rule prompt"
          />
          <button
            className="btn btn--muted"
            type="button"
            onClick={handleGenerateRules}
            disabled={loadingAI || !prompt.trim()}
          >
            {loadingAI ? "Generating..." : "Generate Rules"}
          </button>
        </div>

        <div className="ccp__divider" />

        {/* Conjunction row */}
        <div className="ccp__row ccp__row--conj">
          <select
            className="ccp__select"
            value={conjunction}
            onChange={(e) => setConjunction(e.target.value)}
            aria-label="Conjunction"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
          <span className="ccp__helper">
            Match all (AND) or any (OR) of the following rules.
          </span>
        </div>

        {/* Rules */}
        {rules.map((r, i) => (
          <div className="ccp__row" key={i}>
            <select
              className="ccp__select"
              value={r.field}
              onChange={(e) => handleRuleChange(i, "field", e.target.value)}
              aria-label="Field"
            >
              <option value="spend">Total Spend</option>
              <option value="visits">Total Visits</option>
              <option value="lastVisitDays">Days Since Last Visit</option>
            </select>

            <select
              className="ccp__select"
              value={r.operator}
              onChange={(e) => handleRuleChange(i, "operator", e.target.value)}
              aria-label="Operator"
            >
              <option value=">">Greater Than</option>
              <option value="<">Less Than</option>
              <option value="=">Equal To</option>
              <option value=">=">Greater or Equal</option>
              <option value="<=">Less or Equal</option>
              <option value="!=">Not Equal</option>
            </select>

            <input
              className="ccp__input"
              type="text"
              placeholder="0"
              value={r.value}
              onChange={(e) => handleRuleChange(i, "value", e.target.value)}
              aria-label="Value"
            />
          </div>
        ))}

        <div className="ccp__row ccp__row--between">
          <button className="btn btn--ghost" type="button" onClick={addRule}>
            Add new rule
          </button>

          <div className="ccp__actions">
            <button
              className="btn btn--muted"
              type="button"
              onClick={handlePreview}
              disabled={loadingPreview}
            >
              {loadingPreview ? "Previewing..." : "Preview Audience"}
            </button>

            <button
              className="btn btn--primary"
              type="button"
              onClick={handleCreate}
              disabled={loadingCreate}
            >
              {loadingCreate ? "Saving..." : "Save & Launch Campaign"}
            </button>
          </div>
        </div>

        {typeof audienceSize === "number" && (
          <p className="ccp__preview">Audience Size: {audienceSize}</p>
        )}
        {error && <p className="ccp__error">{error}</p>}
      </div>
    </div>
  );
}
