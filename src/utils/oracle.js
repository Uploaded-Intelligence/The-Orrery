// src/utils/oracle.js

/**
 * Oracle: Claude-powered intelligence for unblocking tasks
 *
 * Flow:
 * 1. User clicks "Ask Oracle" on a blocker
 * 2. Request copied to clipboard (for Claude Code)
 * 3. User pastes to Claude, gets response
 * 4. User pastes response back, previews, accepts
 * 5. Tasks created via TaskNotes API (not local state)
 */

/**
 * Build an Oracle request for a blocker
 */
export function buildOracleRequest(blocker, task, relatedTasks = []) {
  return {
    version: '1.0',
    type: 'unblock_request',
    blocker: {
      id: blocker.id,
      text: blocker.text,
    },
    task: {
      id: task.id,
      title: task.title,
      notes: task.notes || '',
      questIds: task.questIds || [],
    },
    context: {
      relatedTasks: relatedTasks.map(t => ({
        title: t.title,
        status: t.status,
      })),
    },
    instructions: `Help unblock this task. Suggest 1-3 actionable sub-tasks.

BLOCKER: "${blocker.text}"
TASK: "${task.title}"
${task.notes ? `NOTES: "${task.notes}"` : ''}

Respond with JSON:
{
  "analysis": "Brief analysis of why this is blocking",
  "suggestedTasks": [
    {
      "title": "Clear, actionable task title",
      "notes": "Optional details",
      "estimatedMinutes": 30,
      "cognitiveLoad": 3
    }
  ]
}

Rules:
- Focus on the SMALLEST next step that unblocks
- cognitiveLoad: 1=autopilot, 2=casual, 3=focused, 4=deep, 5=peak
- Don't create tasks that require more context you don't have`,
  };
}

/**
 * Copy Oracle request to clipboard
 */
export async function copyOracleRequestToClipboard(request) {
  const text = `## Oracle Unblock Request\n\n\`\`\`json\n${JSON.stringify(request, null, 2)}\n\`\`\``;
  await navigator.clipboard.writeText(text);
}

/**
 * Parse Oracle response from Claude
 */
export function parseOracleResponse(jsonString) {
  try {
    // Try to extract JSON from markdown code block
    let str = jsonString.trim();
    const match = str.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) str = match[1].trim();

    const data = JSON.parse(str);

    if (!data.suggestedTasks || !Array.isArray(data.suggestedTasks)) {
      return { valid: false, error: 'Response must have suggestedTasks array' };
    }

    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}
