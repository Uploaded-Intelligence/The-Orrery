// src/components/ui/BrainDumpInput.jsx

import { useState } from 'react';
import { COLORS } from '@/constants';

/**
 * Brain dump input that uses Claude for intelligent parsing
 * Type natural language → Claude parses → structured tasks → TaskNotes API
 *
 * Flow:
 * 1. User types brain dump text
 * 2. Click "Copy for Claude" → copies structured request to clipboard
 * 3. User pastes to Claude Code, gets response
 * 4. Paste response back → preview shows parsed tasks
 * 5. Accept → tasks created via callback
 */
export function BrainDumpInput({ onTasksCreated, existingQuests = [] }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Build request for Claude
  const buildClaudeRequest = () => {
    return {
      type: 'brain_dump_parse',
      input: input.trim(),
      context: {
        existingQuests: existingQuests.map(q => ({ id: q.id, title: q.title })),
      },
      instructions: `Parse this brain dump into structured tasks.

BRAIN DUMP: "${input.trim()}"

Respond with JSON:
{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "notes": "Optional details",
      "estimatedMinutes": 30,
      "cognitiveLoad": 3,
      "questIds": [],
      "tags": [],
      "dueAt": null
    }
  ],
  "edges": [
    { "sourceIndex": 0, "targetIndex": 1 }
  ]
}

Rules:
- Create 1-5 tasks depending on complexity
- If simple ("buy milk tomorrow") → 1 task
- If complex ("refactor auth system") → multiple tasks with dependencies
- cognitiveLoad: 1=autopilot, 2=casual, 3=focused, 4=deep, 5=peak
- edges: sourceIndex must complete before targetIndex`,
    };
  };

  const handleCopyRequest = async () => {
    const request = buildClaudeRequest();
    const text = `## Brain Dump Parse Request\n\n\`\`\`json\n${JSON.stringify(request, null, 2)}\n\`\`\``;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setError(null);
  };

  const handleParseResponse = () => {
    try {
      // Try to extract JSON from markdown code block or raw JSON
      let jsonStr = response.trim();
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1].trim();

      const data = JSON.parse(jsonStr);
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Response must have tasks array');
      }
      setPreview(data);
      setError(null);
    } catch (e) {
      setError(`Parse error: ${e.message}`);
      setPreview(null);
    }
  };

  const handleAccept = () => {
    if (preview?.tasks) {
      onTasksCreated?.(preview.tasks, preview.edges || []);
      setInput('');
      setResponse('');
      setPreview(null);
    }
  };

  return (
    <div style={{
      padding: '12px',
      background: COLORS.bgPanel,
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: COLORS.textMuted }}>
        Brain Dump → Claude → Tasks
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Dump your thoughts here... Claude will parse them into structured tasks.

Examples:
• "Buy groceries tomorrow"
• "I need to refactor the auth system - it's getting messy"
• "Prepare for Monday meeting: review slides, gather metrics, practice"`}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '10px 12px',
          background: COLORS.bgDark,
          border: `1px solid ${COLORS.textMuted}40`,
          borderRadius: '4px',
          color: COLORS.textPrimary,
          fontSize: '14px',
          resize: 'vertical',
        }}
      />

      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={handleCopyRequest}
          disabled={!input.trim()}
          style={{
            padding: '6px 12px',
            background: copied ? COLORS.accentSuccess : COLORS.accentPrimary,
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          {copied ? '✓ Copied!' : '1. Copy for Claude'}
        </button>
      </div>

      {/* Response input */}
      <div style={{ marginTop: '12px' }}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="2. Paste Claude's response here..."
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '10px 12px',
            background: COLORS.bgDark,
            border: `1px solid ${COLORS.textMuted}40`,
            borderRadius: '4px',
            color: COLORS.textPrimary,
            fontSize: '12px',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
        <button
          onClick={handleParseResponse}
          disabled={!response.trim()}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            background: 'transparent',
            border: `1px solid ${COLORS.textMuted}40`,
            borderRadius: '4px',
            color: COLORS.textMuted,
            fontSize: '12px',
            cursor: 'pointer',
            opacity: response.trim() ? 1 : 0.5,
          }}
        >
          3. Parse Response
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: COLORS.accentDanger + '20',
          borderRadius: '4px',
          fontSize: '12px',
          color: COLORS.accentDanger,
        }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: COLORS.bgDark,
          borderRadius: '4px',
        }}>
          <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px' }}>
            Preview: {preview.tasks.length} task(s)
          </div>
          {preview.tasks.map((task, i) => (
            <div key={i} style={{
              padding: '8px',
              marginBottom: '4px',
              background: COLORS.bgPanel,
              borderRadius: '4px',
              fontSize: '13px',
            }}>
              <strong style={{ color: COLORS.textPrimary }}>{task.title}</strong>
              {task.estimatedMinutes && (
                <span style={{ color: COLORS.textMuted, marginLeft: '8px' }}>
                  ~{task.estimatedMinutes}m
                </span>
              )}
              {task.cognitiveLoad && (
                <span style={{ color: COLORS.accentWarning, marginLeft: '8px' }}>
                  CL:{task.cognitiveLoad}
                </span>
              )}
            </div>
          ))}
          <button
            onClick={handleAccept}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: COLORS.accentSuccess,
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ✓ Create {preview.tasks.length} Task(s)
          </button>
        </div>
      )}
    </div>
  );
}
