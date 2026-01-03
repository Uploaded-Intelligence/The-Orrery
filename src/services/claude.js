// ═══════════════════════════════════════════════════════════════
// services/claude.js
// Claude API integration for Party conversations
// ═══════════════════════════════════════════════════════════════

/**
 * API Configuration
 *
 * For MVP prototype, we support two modes:
 * 1. Direct API (requires VITE_ANTHROPIC_API_KEY in .env)
 * 2. Mock mode (for testing UI without API)
 *
 * Note: Direct browser→Claude API requires CORS proxy in production.
 * For real deployment, route through a backend server.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const USE_MOCK = !API_KEY || import.meta.env.VITE_MOCK_PARTY === 'true';

/**
 * Send a message to a Party member
 * @param {string} userMessage - The player's message
 * @param {string} systemPrompt - Full system prompt including character + context
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @returns {Promise<string>} - The party member's response
 */
export async function sendToParty(userMessage, systemPrompt, conversationHistory = []) {
  if (USE_MOCK) {
    return mockPartyResponse(userMessage, systemPrompt);
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'I have nothing to say.';
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Mock responses for testing without API
 * Extracts party member from system prompt and generates appropriate response
 */
function mockPartyResponse(userMessage, systemPrompt) {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const message = userMessage.toLowerCase();

      // Detect which party member from system prompt
      if (systemPrompt.includes('THE NAVIGATOR')) {
        resolve(mockNavigator(message));
      } else if (systemPrompt.includes('THE ORACLE')) {
        resolve(mockOracle(message));
      } else if (systemPrompt.includes('THE SCRIBE')) {
        resolve(mockScribe(message));
      } else if (systemPrompt.includes('THE STEWARD')) {
        resolve(mockSteward(message));
      } else {
        resolve("I'm here. What do you need?");
      }
    }, 800 + Math.random() * 400);
  });
}

function mockNavigator(message) {
  if (message.includes('today') || message.includes('schedule')) {
    return "Morning. Looking at your quests, you've got clear space until mid-afternoon. The WorldOE work has momentum—you were in the architecture docs yesterday.";
  }
  if (message.includes('time') || message.includes('free')) {
    return "You have a good stretch ahead. No hard stops visible. How you use it is yours to decide.";
  }
  return "The time ahead is yours to navigate. What are you wondering about?";
}

function mockOracle(message) {
  if (message.includes('focus') || message.includes('should')) {
    return "Two paths seem alive right now. The Party integration is fresh—there's energy there. But I sense the Irreal has been waiting. Which feels more urgent to your gut, not your calendar?";
  }
  if (message.includes('stuck') || message.includes('blocked')) {
    return "Interesting that you feel stuck. Sometimes the block is the message. What would you do if this task simply couldn't be done the way you first imagined?";
  }
  return "I see the quests spread before us. What draws your attention? What feels alive?";
}

function mockScribe(message) {
  if (message.includes('capture') || message.includes('note')) {
    return "Got it. I've noted that insight. Want me to connect it to a specific quest, or let it float for now?";
  }
  if (message.includes('task') || message.includes('create')) {
    return "Understood. I can shape that into a task. Which quest should it live under?";
  }
  return "I'm listening. What needs to be captured?";
}

function mockSteward(message) {
  if (message.includes('email') || message.includes('handle')) {
    return "I understand what you need. In the full system, I'd handle that communication directly. For now, I can help you draft the response—want me to?";
  }
  if (message.includes('remind') || message.includes('follow')) {
    return "Noted. I'll surface this again when the time comes. Anything else that needs handling?";
  }
  return "I'm here to handle the friction. What needs doing?";
}

/**
 * Check if API is configured
 */
export function isAPIConfigured() {
  return !!API_KEY && !USE_MOCK;
}

/**
 * Get configuration status for debugging
 */
export function getAPIStatus() {
  return {
    configured: !!API_KEY,
    mockMode: USE_MOCK,
    message: USE_MOCK
      ? 'Running in mock mode. Set VITE_ANTHROPIC_API_KEY for live responses.'
      : 'API configured. Ready for live conversations.',
  };
}
