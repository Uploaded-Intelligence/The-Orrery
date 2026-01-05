// ═══════════════════════════════════════════════════════════════
// components/panels/ExpandedTaskEditor.jsx
// Inline expanded editor that appears below selected task
// Provides more space for editing + blockers with Oracle suggestions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import {
  Save, X, AlertTriangle, Sparkles, Check, Trash2,
  Clock, MessageSquare, Zap, Coffee, FlaskConical
} from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

// Oracle suggestion types
const ORACLE_SUGGESTIONS = [
  {
    id: 'decompose',
    icon: Zap,
    label: 'Break it down',
    color: '#F59E0B',
    description: 'This is too big. Let Claude split it into smaller pieces.'
  },
  {
    id: 'experiment',
    icon: FlaskConical,
    label: 'Experiment 3min',
    color: '#8B5CF6',
    description: 'Try for 3 minutes. If stuck, ditch and reassess.'
  },
  {
    id: 'delegate',
    icon: MessageSquare,
    label: 'Ask Party',
    color: '#06B6D4',
    description: 'This needs another perspective. Bring it to the Party.'
  },
  {
    id: 'defer',
    icon: Coffee,
    label: 'Not now',
    color: '#6B7280',
    description: 'Acknowledge it but don\'t let it block you. Come back later.'
  },
];

/**
 * ExpandedTaskEditor - Appears below selected task for detailed editing
 */
export function ExpandedTaskEditor({ task, position, onClose }) {
  const { dispatch } = useOrrery();

  // Edit state
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [newBlocker, setNewBlocker] = useState('');
  const [showOracleSuggestions, setShowOracleSuggestions] = useState(null); // blocker ID or null

  const titleRef = useRef(null);
  const notesRef = useRef(null);

  // Update local state when task changes
  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes || '');
  }, [task.id, task.title, task.notes]);

  // Auto-resize notes textarea
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto';
      notesRef.current.style.height = Math.min(150, notesRef.current.scrollHeight) + 'px';
    }
  }, [notes]);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: { title, notes }
      }
    });
  };

  const handleAddBlocker = () => {
    if (!newBlocker.trim()) return;
    dispatch({
      type: 'ADD_BLOCKER',
      payload: { taskId: task.id, text: newBlocker.trim() }
    });
    setNewBlocker('');
  };

  const handleRemoveBlocker = (blockerId) => {
    dispatch({
      type: 'REMOVE_BLOCKER',
      payload: { taskId: task.id, blockerId }
    });
  };

  const handleOracleSuggestion = (blockerId, suggestion) => {
    dispatch({
      type: 'UPDATE_BLOCKER',
      payload: {
        taskId: task.id,
        blockerId,
        updates: {
          oracleSuggestion: suggestion.id,
          status: suggestion.id === 'defer' ? 'ignored' : 'pending'
        }
      }
    });
    setShowOracleSuggestions(null);

    // If decompose, trigger the decompose action
    if (suggestion.id === 'decompose') {
      // TODO: Integrate with Claude API to decompose task
      console.log('TODO: Decompose task with Claude');
    }
  };

  const blockers = task.blockers || [];

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y + 100, // Below the task node
        width: 320,
        background: COLORS.bgPanel,
        border: `2px solid ${COLORS.accentSecondary}`,
        borderRadius: '12px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${COLORS.accentSecondary}30`,
        zIndex: 1000,
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: `1px solid ${COLORS.textMuted}20`,
        background: COLORS.bgElevated,
      }}>
        <span style={{
          color: COLORS.textPrimary,
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Edit Task
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '12px' }}>
        {/* Title */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            color: COLORS.textMuted,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Title
          </label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: COLORS.bgVoid,
              border: `1px solid ${COLORS.textMuted}30`,
              borderRadius: '6px',
              color: COLORS.textPrimary,
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            color: COLORS.textMuted,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Notes
          </label>
          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add notes, context, or details..."
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '8px 10px',
              background: COLORS.bgVoid,
              border: `1px solid ${COLORS.textMuted}30`,
              borderRadius: '6px',
              color: COLORS.textPrimary,
              fontSize: '13px',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.4,
            }}
          />
        </div>

        {/* Blockers Section */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: COLORS.accentWarning,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            <AlertTriangle size={12} />
            Blockers
          </label>

          {/* Existing blockers */}
          {blockers.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              {blockers.map(blocker => (
                <div
                  key={blocker.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '8px',
                    marginBottom: '6px',
                    background: blocker.status === 'ignored'
                      ? `${COLORS.textMuted}10`
                      : `${COLORS.accentWarning}10`,
                    border: `1px solid ${blocker.status === 'ignored'
                      ? COLORS.textMuted
                      : COLORS.accentWarning}30`,
                    borderRadius: '6px',
                    opacity: blocker.status === 'ignored' ? 0.6 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: COLORS.textPrimary,
                      fontSize: '12px',
                      textDecoration: blocker.status === 'ignored' ? 'line-through' : 'none',
                    }}>
                      {blocker.text}
                    </div>
                    {blocker.oracleSuggestion && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        fontSize: '10px',
                        color: ORACLE_SUGGESTIONS.find(s => s.id === blocker.oracleSuggestion)?.color || COLORS.textMuted,
                      }}>
                        <Sparkles size={10} />
                        {ORACLE_SUGGESTIONS.find(s => s.id === blocker.oracleSuggestion)?.label}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!blocker.oracleSuggestion && (
                      <button
                        onClick={() => setShowOracleSuggestions(
                          showOracleSuggestions === blocker.id ? null : blocker.id
                        )}
                        style={{
                          background: `${COLORS.accentPrimary}20`,
                          border: `1px solid ${COLORS.accentPrimary}40`,
                          borderRadius: '4px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title="Ask Oracle for suggestions"
                      >
                        <Sparkles size={10} color={COLORS.accentPrimary} />
                        <span style={{ fontSize: '9px', color: COLORS.accentPrimary }}>Oracle</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveBlocker(blocker.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: COLORS.textMuted,
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Oracle suggestions dropdown */}
              {showOracleSuggestions && (
                <div style={{
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.accentPrimary}40`,
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: COLORS.textMuted,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Sparkles size={10} color={COLORS.accentPrimary} />
                    Oracle suggests:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {ORACLE_SUGGESTIONS.map(suggestion => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleOracleSuggestion(showOracleSuggestions, suggestion)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: `${suggestion.color}10`,
                          border: `1px solid ${suggestion.color}30`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <suggestion.icon size={14} color={suggestion.color} />
                        <div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: suggestion.color
                          }}>
                            {suggestion.label}
                          </div>
                          <div style={{
                            fontSize: '9px',
                            color: COLORS.textMuted,
                            marginTop: '2px',
                          }}>
                            {suggestion.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add new blocker */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={newBlocker}
              onChange={(e) => setNewBlocker(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBlocker()}
              placeholder="What's blocking this?"
              style={{
                flex: 1,
                padding: '8px 10px',
                background: COLORS.bgVoid,
                border: `1px solid ${COLORS.textMuted}30`,
                borderRadius: '6px',
                color: COLORS.textPrimary,
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddBlocker}
              disabled={!newBlocker.trim()}
              style={{
                padding: '8px 12px',
                background: newBlocker.trim() ? COLORS.accentWarning : COLORS.bgElevated,
                border: 'none',
                borderRadius: '6px',
                color: newBlocker.trim() ? COLORS.bgVoid : COLORS.textMuted,
                fontSize: '12px',
                fontWeight: 600,
                cursor: newBlocker.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpandedTaskEditor;
