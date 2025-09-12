// server/routes/aiRoutes.js
const express = require("express");
const router = express.Router();

const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Keep these perfectly aligned with your processor
const ALLOWED_FIELDS = new Set(["spend", "visits"]);
const ALLOWED_OPS = new Set([">", "<", "="]);

function normalizePayload(payload) {
  const out = {
    conjunction:
      String(payload?.conjunction || "AND").toUpperCase() === "OR" ? "OR" : "AND",
    rules: Array.isArray(payload?.rules) ? payload.rules : [],
  };

  out.rules = out.rules
    .map((r) => ({
      field: String(r?.field || "").trim().toLowerCase(),
      operator: String(r?.operator || "").trim(),
      value:
        typeof r?.value === "number" || typeof r?.value === "string"
          ? String(r.value).trim()
          : "",
    }))
    .filter((r) => r.field && r.operator && r.value !== "")
    .filter((r) => ALLOWED_FIELDS.has(r.field) && ALLOWED_OPS.has(r.operator));

  return out;
}

/**
 * POST /api/ai/generate-rules
 * Body: { prompt: string }
 * Returns: { conjunction: "AND"|"OR", rules: [{field, operator, value}] }
 */
router.post("/generate-rules", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const system = `
You convert natural-language targeting ideas into STRICT JSON for a rule engine.

Return ONLY JSON, no prose. Schema:
{
  "conjunction": "AND" | "OR",
  "rules": [
    { "field": "spend" | "visits",
      "operator": ">" | "<" | "=",
      "value": "string-or-number" }
  ]
}

Examples:
Input: "customers who spent > 10000 and visited more than 5 times"
Output:
{"conjunction":"AND","rules":[{"field":"spend","operator":">","value":"10000"},{"field":"visits","operator":">","value":"5"}]}

Input: "visited less than 5 times or spent < 500"
Output:
{"conjunction":"OR","rules":[{"field":"visits","operator":"<","value":"5"},{"field":"spend","operator":"<","value":"500"}]}
`.trim();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 512,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    });

    let raw = completion.choices?.[0]?.message?.content || "";
    raw = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Graceful fallback so UI still updates
      const n = (prompt.match(/\d+/g) || [])[0] || "10000";
      parsed = { conjunction: "AND", rules: [{ field: "spend", operator: ">", value: n }] };
    }

    const normalized = normalizePayload(parsed);
    if (!normalized.rules.length) {
      return res.status(422).json({ message: "Could not extract valid rules from prompt." });
    }

    return res.json(normalized);
  } catch (err) {
    console.error("rules/generate error:", err);
    return res.status(500).json({ message: "Server error generating rules" });
  }
});

module.exports = router;
