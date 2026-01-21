// api/oracle/quick.js
// Quick Oracle - In-UI AI guidance via Gemini
// "The quick party member for instant nudges"

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, context } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return res.status(503).json({
      error: 'Gemini API not configured',
      hint: 'Set GOOGLE_AI_API_KEY in environment variables',
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = buildPartyMemberPrompt(query, context);
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({
      response,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Gemini error:', e);
    res.status(500).json({
      error: 'Failed to get response',
      details: e.message,
    });
  }
}

/**
 * Build the prompt for the quick party member
 * Keep it concise - this is for quick nudges, not deep analysis
 */
function buildPartyMemberPrompt(query, context) {
  const availableCount = context?.availableExperiments?.length || 0;
  const inProgressCount = context?.inProgressExperiments?.length || 0;
  const blockedCount = context?.blockedExperiments?.length || 0;
  const concludedToday = context?.concludedToday || 0;

  // Build experiment list (top 5 available)
  const availableList = (context?.availableExperiments || [])
    .slice(0, 5)
    .map(e => `- "${e.hypothesis}" (Energy: ${e.energyRequired}/5, ${e.timeboxed}min)`)
    .join('\n') || 'None available';

  // Build in-progress list
  const inProgressList = (context?.inProgressExperiments || [])
    .map(e => `- "${e.hypothesis}"`)
    .join('\n') || 'None';

  return `You are a quick-witted party member in the player's LifeRPG.
You give brief, actionable guidance (2-3 sentences max).
You speak with warmth and encouragement, but stay concise.

ONTOLOGY REMINDER:
- These are EXPERIMENTS (hypotheses about yourself), not tasks
- "Concluding" an experiment means recording what you learned
- Failure is data, not shame
- The grind is diagnostic, not virtue

CURRENT GAME STATE:
- Available experiments: ${availableCount}
- In progress: ${inProgressCount}
- Blocked: ${blockedCount}
- Concluded today: ${concludedToday}

AVAILABLE EXPERIMENTS:
${availableList}

IN PROGRESS:
${inProgressList}

PLAYER ASKS: "${query}"

Respond as a supportive party member. Be concise, encouraging, specific.
If suggesting an experiment, explain briefly WHY that one fits right now.
Don't use bullet points - speak naturally in 2-3 sentences.`;
}
