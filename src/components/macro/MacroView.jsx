// ═══════════════════════════════════════════════════════════════
// components/macro/MacroView.jsx
// Macro View - Quest Constellation / Observatory
// "What am I working toward and why?"
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Plus, Sparkles, Star, ChevronRight } from 'lucide-react';
import { COLORS } from '@/constants';
import { getQuestProgress } from '@/utils';
import { useOrrery } from '@/store';
import { AddQuestForm, EditQuestForm } from '@/components/forms';

// ─── Quest Orb ─────────────────────────────────────────────────────────────
// Each quest is a glowing celestial body, not a flat card
function QuestOrb({ quest, progress, taskCount, onSelect, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);

  // Progress affects glow intensity and ring completion
  const glowIntensity = 0.3 + (progress * 0.7);
  const ringProgress = progress * 100;

  // Size based on task count (more tasks = larger presence)
  const baseSize = Math.min(180, Math.max(120, 100 + taskCount * 10));

  return (
    <div
      onClick={() => onSelect(quest.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: baseSize,
        height: baseSize,
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Outer orbital ring - progress indicator */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'rotate(-90deg)',
        }}
      >
        {/* Background ring */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={`${quest.themeColor}20`}
          strokeWidth="2"
        />
        {/* Progress ring */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={quest.themeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${ringProgress * 2.83} 283`}
          style={{
            filter: `drop-shadow(0 0 6px ${quest.themeColor})`,
            transition: 'stroke-dasharray 0.5s ease',
          }}
        />
      </svg>

      {/* Core orb */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${quest.themeColor}40, ${quest.themeColor}15 50%, ${COLORS.bgVoid} 100%)`,
          boxShadow: `
            0 0 ${20 * glowIntensity}px ${quest.themeColor}${Math.round(glowIntensity * 60).toString(16).padStart(2, '0')},
            0 0 ${40 * glowIntensity}px ${quest.themeColor}${Math.round(glowIntensity * 30).toString(16).padStart(2, '0')},
            inset 0 0 20px ${quest.themeColor}20
          `,
          border: `1px solid ${quest.themeColor}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Quest title */}
        <span
          style={{
            color: COLORS.textPrimary,
            fontSize: baseSize < 140 ? '0.75rem' : '0.875rem',
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {quest.title}
        </span>

        {/* Task count */}
        <span
          style={{
            color: quest.themeColor,
            fontSize: '0.625rem',
            marginTop: '0.25rem',
            opacity: 0.9,
          }}
        >
          {Math.round(progress * taskCount)}/{taskCount} complete
        </span>
      </div>

      {/* Hover action hint */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: COLORS.bgPanel,
            borderRadius: '12px',
            border: `1px solid ${quest.themeColor}40`,
            color: quest.themeColor,
            fontSize: '0.625rem',
            whiteSpace: 'nowrap',
          }}
        >
          <ChevronRight size={10} />
          Enter Quest
        </div>
      )}

      {/* Edit button (top right) */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(quest); }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: COLORS.bgPanel,
          border: `1px solid ${COLORS.textMuted}30`,
          color: COLORS.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
          fontSize: '0.625rem',
        }}
        title="Edit quest"
      >
        ✎
      </button>
    </div>
  );
}

// ─── North Star ────────────────────────────────────────────────────────────
// The guiding vision at the top
function NorthStar() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
      }}
    >
      {/* Star icon with glow */}
      <div
        style={{
          position: 'relative',
          marginBottom: '0.75rem',
        }}
      >
        <Star
          size={32}
          fill={COLORS.accentWarning}
          color={COLORS.accentWarning}
          style={{
            filter: `drop-shadow(0 0 10px ${COLORS.accentWarning}) drop-shadow(0 0 20px ${COLORS.accentWarning}50)`,
          }}
        />
      </div>

      {/* North Star label */}
      <span
        style={{
          color: COLORS.accentWarning,
          fontSize: '0.625rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '0.25rem',
        }}
      >
        North Star
      </span>

      {/* Vision text - editable in future */}
      <span
        style={{
          color: COLORS.textSecondary,
          fontSize: '0.875rem',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        "Flourishing Life-World through Experience Machine OS"
      </span>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
function EmptyConstellation({ onAddQuest }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accentPrimary}10 0%, transparent 70%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          border: `1px dashed ${COLORS.textMuted}30`,
        }}
      >
        <Sparkles size={40} color={COLORS.textMuted} style={{ opacity: 0.5 }} />
      </div>

      <h3 style={{ color: COLORS.textPrimary, margin: '0 0 0.5rem', fontSize: '1.125rem' }}>
        Your constellation awaits
      </h3>
      <p style={{ color: COLORS.textMuted, margin: '0 0 1.5rem', fontSize: '0.875rem', maxWidth: '300px' }}>
        Create your first quest to begin charting your journey through the stars.
      </p>

      <button
        onClick={onAddQuest}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '2rem',
          border: 'none',
          background: `linear-gradient(135deg, ${COLORS.accentPrimary}, ${COLORS.accentSecondary})`,
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: `0 4px 20px ${COLORS.accentPrimary}40`,
        }}
      >
        <Plus size={18} />
        Create First Quest
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MACRO VIEW - Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function MacroView() {
  const { state, dispatch } = useOrrery();
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  // Handle quest selection - focus and switch to micro view
  const handleSelectQuest = (questId) => {
    dispatch({ type: 'SET_FOCUS_QUEST', payload: questId });
    dispatch({ type: 'SET_VIEW', payload: 'micro' });
  };

  // Calculate quest data
  const questsWithData = state.quests.map(quest => ({
    quest,
    progress: getQuestProgress(quest.id, state),
    taskCount: state.tasks.filter(t => t.questIds.includes(quest.id)).length,
  }));

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(ellipse at 50% 0%, ${COLORS.accentPrimary}08 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${COLORS.accentSecondary}05 0%, transparent 40%),
          radial-gradient(ellipse at 20% 60%, ${COLORS.accentWarning}03 0%, transparent 30%),
          ${COLORS.bgSpace}
        `,
        overflow: 'auto',
        padding: '1.5rem',
      }}
    >
      {/* North Star - Guiding Vision */}
      <NorthStar />

      {/* Add Quest Form (modal-style) */}
      {showAddQuest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setShowAddQuest(false)}
        >
          <div
            style={{
              background: COLORS.bgPanel,
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '400px',
              border: `1px solid ${COLORS.accentPrimary}30`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: COLORS.textPrimary, margin: '0 0 1rem', fontSize: '1rem' }}>
              ✦ New Quest
            </h3>
            <AddQuestForm onClose={() => setShowAddQuest(false)} />
          </div>
        </div>
      )}

      {/* Edit Quest Form (modal-style) */}
      {editingQuest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setEditingQuest(null)}
        >
          <div
            style={{
              background: COLORS.bgPanel,
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '400px',
              border: `1px solid ${COLORS.accentWarning}30`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: COLORS.accentWarning, margin: '0 0 1rem', fontSize: '1rem' }}>
              ✎ Edit Quest
            </h3>
            <EditQuestForm quest={editingQuest} onClose={() => setEditingQuest(null)} />
          </div>
        </div>
      )}

      {/* Quest Constellation */}
      {state.quests.length === 0 ? (
        <EmptyConstellation onAddQuest={() => setShowAddQuest(true)} />
      ) : (
        <>
          {/* Constellation grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              padding: '1rem',
              minHeight: '300px',
            }}
          >
            {questsWithData.map(({ quest, progress, taskCount }) => (
              <QuestOrb
                key={quest.id}
                quest={quest}
                progress={progress}
                taskCount={taskCount}
                onSelect={handleSelectQuest}
                onEdit={setEditingQuest}
              />
            ))}
          </div>

          {/* Add Quest Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            <button
              onClick={() => setShowAddQuest(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '2rem',
                border: `1px solid ${COLORS.accentPrimary}40`,
                background: 'transparent',
                color: COLORS.accentPrimary,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={16} />
              Add Quest
            </button>
          </div>
        </>
      )}

      {/* Subtle star field effect */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default MacroView;
