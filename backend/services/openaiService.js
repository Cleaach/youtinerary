// backend/openaiService.js
require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

const generateItinerary = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 5000,
  });
  return response.choices[0].message.content;
};

module.exports = { generateItinerary };