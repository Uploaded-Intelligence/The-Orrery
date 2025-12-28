// ═══════════════════════════════════════════════════════════════
// components/forms/EditQuestForm.jsx
// Form to edit an existing quest
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { COLORS, QUEST_COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * @param {Object} props
 * @param {import('@/types').Quest} props.quest
 * @param {Function} props.onClose - Called when form should close
 */
export function EditQuestForm({ quest, onClose }) {
  const { dispatch } = useOrrery();
  const [title, setTitle] = useState(quest.title);
  const [description, setDescription] = useState(quest.description || '');
  const [color, setColor] = useState(quest.themeColor);
  const [status, setStatus] = useState(quest.status);

  const handleSave = () => {
    if (!title.trim()) return;

    dispatch({
      type: 'UPDATE_QUEST',
      payload: {
        id: quest.id,
        updates: {
          title: title.trim(),
          description: description.trim(),
          themeColor: color,
          status: status,
        },
      },
    });
    onClose();
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

  const statusOptions = ['active', 'paused', 'completed', 'archived'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Quest Title
        </label>
        <input
          type="text"
          placeholder="Quest title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Description
        </label>
        <textarea
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={inputStyle}
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
              onClick={() => setStatus(s)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                border: status === s ? `2px solid ${COLORS.accentPrimary}` : `1px solid ${COLORS.textMuted}40`,
                background: status === s ? `${COLORS.accentPrimary}20` : 'transparent',
                color: status === s ? COLORS.accentPrimary : COLORS.textSecondary,
                fontSize: '0.75rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {QUEST_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: c,
                border: color === c ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
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

export default EditQuestForm;
