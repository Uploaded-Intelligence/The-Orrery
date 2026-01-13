// ═══════════════════════════════════════════════════════════════
// components/forms/EditTaskForm.jsx
// Form to edit an existing task
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * @param {Object} props
 * @param {import('@/types').Task} props.task
 * @param {Function} props.onClose - Called when form should close
 */
export function EditTaskForm({ task, onClose }) {
  const { state, api } = useOrrery();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [questIds, setQuestIds] = useState(task.questIds || []);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes?.toString() || '');
  const [taskStatus, setTaskStatus] = useState(task.status);

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      await api.updateTask(task.id, {
        title: title.trim(),
        notes: notes.trim(),
        questIds,
        status: taskStatus,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
      });
      onClose();
    } catch (e) {
      console.error('Save failed:', e);
      onClose(); // Still close, sync will retry
    }
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

  const statusOptions = ['available', 'in_progress', 'completed', 'blocked'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Task Title
        </label>
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Notes
        </label>
        <textarea
          placeholder="Notes (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Estimated Minutes
        </label>
        <input
          type="number"
          placeholder="Estimated minutes (optional)"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
          style={inputStyle}
          min="1"
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
          Status
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {statusOptions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setTaskStatus(s)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                border: taskStatus === s ? `2px solid ${COLORS.accentPrimary}` : `1px solid ${COLORS.textMuted}40`,
                background: taskStatus === s ? `${COLORS.accentPrimary}20` : 'transparent',
                color: taskStatus === s ? COLORS.accentPrimary : COLORS.textSecondary,
                fontSize: '0.75rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {state.quests.length > 0 && (
        <div>
          <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Assigned Quests:
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
          onClick={handleSave}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: COLORS.accentPrimary,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default EditTaskForm;
