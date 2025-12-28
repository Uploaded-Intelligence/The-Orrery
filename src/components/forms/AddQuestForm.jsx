// ═══════════════════════════════════════════════════════════════
// components/forms/AddQuestForm.jsx
// Form to create a new quest
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { COLORS, QUEST_COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * @param {Object} props
 * @param {Function} props.onClose - Called when form should close
 */
export function AddQuestForm({ onClose }) {
  const { dispatch } = useOrrery();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(QUEST_COLORS[Math.floor(Math.random() * QUEST_COLORS.length)]);

  const handleAdd = () => {
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_QUEST',
      payload: {
        title: title.trim(),
        description: description.trim(),
        status: 'active',
        themeColor: color,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        type="text"
        placeholder="Quest title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
        autoFocus
      />
      <textarea
        placeholder="Description (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        style={inputStyle}
      />
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
          Create Quest
        </button>
      </div>
    </div>
  );
}

export default AddQuestForm;
