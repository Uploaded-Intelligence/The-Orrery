// ═══════════════════════════════════════════════════════════════
// components/macro/QuestCard.jsx
// Quest display card for Macro view
// ═══════════════════════════════════════════════════════════════

import { Edit3, Trash2 } from 'lucide-react';
import { COLORS } from '@/constants';
import { getQuestProgress } from '@/utils';
import { useOrrery } from '@/store';

/**
 * @param {Object} props
 * @param {import('@/types').Quest} props.quest
 * @param {Function} props.onSelect - Called with quest.id
 * @param {Function} props.onDelete - Called with quest.id
 * @param {Function} props.onEdit - Called with quest object
 */
export function QuestCard({ quest, onSelect, onDelete, onEdit }) {
  const { state } = useOrrery();
  const progress = getQuestProgress(quest.id, state);
  const taskCount = state.tasks.filter(t => t.questIds.includes(quest.id)).length;

  return (
    <div
      onClick={() => onSelect(quest.id)}
      style={{
        padding: '1rem',
        borderRadius: '0.75rem',
        background: `linear-gradient(135deg, ${quest.themeColor}15, ${COLORS.bgPanel})`,
        border: `1px solid ${quest.themeColor}40`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ color: COLORS.textPrimary, margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            {quest.title}
          </h3>
          <p style={{ color: COLORS.textSecondary, margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
            {taskCount} tasks • {quest.status}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(quest); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: COLORS.textMuted,
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            title="Edit quest"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(quest.id); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: COLORS.textMuted,
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            title="Delete quest"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: '0.75rem',
        height: '4px',
        background: COLORS.bgVoid,
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: quest.themeColor,
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}

export default QuestCard;
