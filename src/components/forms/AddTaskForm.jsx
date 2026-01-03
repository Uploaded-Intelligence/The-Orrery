// ═══════════════════════════════════════════════════════════════
// components/forms/AddTaskForm.jsx
// Form to create a new task
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * @param {Object} props
 * @param {Function} props.onClose - Called when form should close
 * @param {string|null} props.defaultQuestId - Pre-select this quest
 */
export function AddTaskForm({ onClose, defaultQuestId }) {
  const { state, dispatch } = useOrrery();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [questIds, setQuestIds] = useState(defaultQuestId ? [defaultQuestId] : []);
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        notes: notes.trim(),
        questIds,
        status: 'available',
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        actualMinutes: null,
      },
    });
    onClose();
  };

  const toggleQuest = (qid) => {
    setQuestIds(prev =>
      prev.includes(qid)
        ? prev.filter(id => id !== qid)
        : [...prev, qid]
    );
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${COLORS.textMuted}40`,
    background: COLORS.bgVoid,
    color: COLORS.textPrimary,
    fontSize: '0.875rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
        autoFocus
      />
      <textarea
        placeholder="Notes (optional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Estimated minutes (optional)"
        value={estimatedMinutes}
        onChange={(e) => setEstimatedMinutes(e.target.value)}
        style={inputStyle}
        min="1"
      />

      {state.quests.length > 0 && (
        <div>
          <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Assign to quests:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {state.quests.map(q => (
              <button
                key={q.id}
                type="button"
                onClick={() => toggleQuest(q.id)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  border: `1px solid ${q.themeColor}`,
                  background: questIds.includes(q.id) ? q.themeColor : 'transparent',
                  color: questIds.includes(q.id) ? 'white' : q.themeColor,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: `1px solid ${COLORS.textMuted}40`,
            background: 'transparent',
            color: COLORS.textSecondary,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: COLORS.accentPrimary,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

export default AddTaskForm;
