const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Configure the client to use Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// POST /api/ai/generate-rules
router.post('/generate-rules', async (req, res) => {
  const { prompt } = req.body;

  try {
    const systemPrompt = `
      You are an expert at converting natural language into structured JSON rules for a CRM.
      The user will provide a text prompt describing a customer segment.
      You must convert this prompt into a JSON object containing an array of rules.
      The available fields are "spend", "visits".
      The available operators are ">", "<", "=".
      The value should always be a string containing a number.
      
      Example 1:
      User prompt: "Customers who spent more than 5000"
      Your response: { "rules": [{ "field": "spend", "operator": ">", "value": "5000" }] }
      
      Example 2:
      User prompt: "people with less than 3 visits"
      Your response: { "rules": [{ "field": "visits", "operator": "<", "value": "3" }] }
      
      Example 3:
      User prompt: "users who have visited exactly 10 times"
      Your response: { "rules": [{ "field": "visits", "operator": "=", "value": "10" }] }
      
      Only return the JSON object, with no other text or explanations.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant', // A great, fast model available on Groq
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content);
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error with Groq API:', error);
    res.status(500).json({ message: 'Failed to generate rules' });
  }
});

module.exports = router;