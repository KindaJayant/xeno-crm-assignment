import React, { useState, useRef } from 'react';
import axios from 'axios';
import './RuleBuilder.css';

const RuleBuilder = () => {
  const [rules, setRules] = useState([
    { field: 'spend', operator: '>', value: '0' },
  ]);
  const [conjunction, setConjunction] = useState('AND');
  const [audienceCount, setAudienceCount] = useState(null);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const lastValidCount = useRef(null);

  const handleRuleChange = (index, part, newValue) => {
    const newRules = [...rules];
    newRules[index][part] = newValue;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { field: 'spend', operator: '>', value: '' }]);
  };

  const handlePreview = async () => {
    setError('');
    setAudienceCount('...');
    try {
      const response = await axios.post('http://localhost:5000/api/campaigns/preview', {
        rules,
        conjunction
      });
      setAudienceCount(response.data.audienceSize);
      lastValidCount.current = response.data.audienceSize;
    } catch (err) {
      setError('Failed to fetch audience size.');
      setAudienceCount(null);
      console.error(err);
    }
  };

  const handleSaveCampaign = async () => {
    if (lastValidCount.current === null || lastValidCount.current === 0) {
      setError('Please preview a valid audience before saving.');
      return;
    }
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/campaigns', {
        rules,
        conjunction,
        audienceSize: lastValidCount.current,
      });
      alert('Campaign saved successfully!');
      setAudienceCount(null);
      lastValidCount.current = null;
    } catch (err) {
      setError('Failed to save campaign.');
      console.error(err);
    }
  };

  const handleGenerateRules = async () => {
    if (!aiPrompt) return;
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/generate-rules', {
        prompt: aiPrompt,
      });
      setRules(response.data.rules);
    } catch (err) {
      setError('Failed to generate rules from AI.');
      console.error(err);
    }
  };

  return (
    <div className="rule-builder-container">
      <div className="ai-section">
        <input
          type="text"
          className="ai-input"
          placeholder="e.g., users who spent more than 10000"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <button onClick={handleGenerateRules} className="secondary-button">
          Generate Rules
        </button>
      </div>

      <div className="conjunction-selector">
        <select value={conjunction} onChange={(e) => setConjunction(e.target.value)}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        <span>Match all (AND) or any (OR) of the following rules.</span>
      </div>

      {rules.map((rule, index) => (
        <React.Fragment key={index}>
          <div className="rule-row">
            <select
              value={rule.field}
              onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
            >
              <option value="spend">Total Spend</option>
              <option value="visits">Number of Visits</option>
            </select>
            <select
              value={rule.operator}
              onChange={(e) => handleRuleChange(index, 'operator', e.target.value)}
            >
              <option value=">">Greater Than</option>
              <option value="<">Less Than</option>
              <option value="=">Equal To</option>
            </select>
            <input
              type="text"
              placeholder="Value"
              value={rule.value}
              onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
            />
          </div>
          {index < rules.length - 1 && <div className="conjunction-text">{conjunction}</div>}
        </React.Fragment>
      ))}

      <div className="actions-container">
        <button onClick={addRule} className="secondary-button">
          Add new rule
        </button>
        <div>
          <button onClick={handlePreview} className="secondary-button" style={{ marginRight: '10px' }}>
            Preview Audience
          </button>
          <button onClick={handleSaveCampaign} className="primary-button">
            Save & Launch Campaign
          </button>
        </div>
      </div>

      {audienceCount !== null && (
        <div className="audience-preview">
          Estimated Audience Size: <strong>{audienceCount}</strong>
        </div>
      )}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};

export default RuleBuilder;