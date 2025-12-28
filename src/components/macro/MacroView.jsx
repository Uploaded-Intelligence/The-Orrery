// ═══════════════════════════════════════════════════════════════
// components/macro/MacroView.jsx
// Living Cosmos - Quest Organisms in the Void
// Sci-fantasy aesthetic: organic, bioluminescent, game-like
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { Plus, Sparkles, Star } from 'lucide-react';
import { COLORS, TIMING } from '@/constants';
import { getQuestProgress } from '@/utils';
import { useOrrery } from '@/store';
import { AddQuestForm, EditQuestForm } from '@/components/forms';
import { CosmicAmbient } from '@/components/ambient';

// ─── Quest Organism ────────────────────────────────────────────────────────
// Each quest is a living creature - bioluminescent, pulsing, growing
function QuestOrganism({ quest, progress, taskCount, onSelect, onEdit, index }) {
  const [isHovered, setIsHovered] = useState(false);

  // Organism characteristics based on state
  const isComplete = progress >= 1;
  const isActive = taskCount > 0 && progress > 0 && progress < 1;
  const isDormant = taskCount === 0;

  // Size grows with task count
  const baseSize = Math.min(160, Math.max(100, 80 + taskCount * 12));

  // Glow intensity based on progress and state
  const glowIntensity = isDormant ? 0.2 : 0.3 + progress * 0.5;

  // Stagger animation delays for organic feel
  const animDelay = index * 0.15;

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
        animation: `fadeGrowIn 0.8s ease-out backwards`,
        animationDelay: `${animDelay}s`,
      }}
    >
      {/* Outer aura - breathing glow */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${quest.themeColor}${Math.round(glowIntensity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          animation: `breathe ${TIMING.breathe} ease-in-out infinite`,
          animationDelay: `${animDelay}s`,
          opacity: isHovered ? 1.2 : 1,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Core organism body */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: `drop-shadow(0 0 ${10 * glowIntensity}px ${quest.themeColor})`,
        }}
      >
        {/* Organic blob shape - slightly irregular circle */}
        <defs>
          <radialGradient id={`grad-${quest.id}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={quest.themeColor} stopOpacity="0.6" />
            <stop offset="50%" stopColor={quest.themeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={COLORS.bgDeep} stopOpacity="0.8" />
          </radialGradient>

          {/* Clip for progress fill */}
          <clipPath id={`clip-${quest.id}`}>
            <ellipse cx="50" cy="50" rx="42" ry="40" />
          </clipPath>
        </defs>

        {/* Main body - organic ellipse */}
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="40"
          fill={`url(#grad-${quest.id})`}
          stroke={quest.themeColor}
          strokeWidth="1.5"
          strokeOpacity="0.6"
          style={{
            animation: `organicPulse ${TIMING.breathe} ease-in-out infinite`,
            transformOrigin: 'center',
          }}
        />

        {/* Progress fill - rising like liquid */}
        <rect
          x="8"
          y={100 - progress * 80}
          width="84"
          height={progress * 80}
          fill={quest.themeColor}
          fillOpacity="0.25"
          clipPath={`url(#clip-${quest.id})`}
          style={{
            transition: 'y 0.5s ease-out, height 0.5s ease-out',
          }}
        />

        {/* Inner glow nucleus */}
        <ellipse
          cx="50"
          cy="50"
          rx="15"
          ry="14"
          fill={quest.themeColor}
          fillOpacity={isActive ? 0.5 : 0.2}
          style={{
            animation: isActive ? `nucleusPulse ${TIMING.pulse} ease-in-out infinite` : 'none',
          }}
        />

        {/* Completion bloom effect */}
        {isComplete && (
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke={COLORS.accentBloom}
            strokeWidth="2"
            strokeOpacity="0.6"
            style={{
              animation: `bloomRing 2s ease-out infinite`,
            }}
          />
        )}
      </svg>

      {/* Text overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            color: COLORS.textPrimary,
            fontSize: baseSize < 120 ? '0.6875rem' : '0.8125rem',
            fontWeight: 600,
            textShadow: `0 0 10px ${COLORS.bgVoid}`,
            lineHeight: 1.2,
            maxWidth: '85%',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {quest.title}
        </span>

        <span
          style={{
            color: quest.themeColor,
            fontSize: '0.625rem',
            marginTop: '0.25rem',
            opacity: 0.9,
            textShadow: `0 0 8px ${quest.themeColor}50`,
          }}
        >
          {isDormant ? 'dormant' : `${Math.round(progress * 100)}% grown`}
        </span>
      </div>

      {/* Hover glow ring */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `2px solid ${quest.themeColor}`,
            opacity: 0.6,
            animation: 'pulseRing 1s ease-out infinite',
          }}
        />
      )}

      {/* Edit button */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(quest); }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: `${COLORS.bgPanel}cc`,
          border: `1px solid ${COLORS.textMuted}30`,
          color: COLORS.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
          fontSize: '0.625rem',
          backdropFilter: 'blur(4px)',
        }}
        title="Edit quest"
      >
        ✎
      </button>
    </div>
  );
}

// ─── North Star ────────────────────────────────────────────────────────────
// The guiding light - always visible, pulsing gently
function NorthStar() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem 1rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 48,
          height: 48,
          marginBottom: '0.5rem',
        }}
      >
        {/* Outer glow */}
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.accentEnergy}40 0%, transparent 70%)`,
            animation: `breathe ${TIMING.breathe} ease-in-out infinite`,
          }}
        />
        {/* Star icon */}
        <Star
          size={32}
          fill={COLORS.accentEnergy}
          color={COLORS.accentEnergy}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: `drop-shadow(0 0 8px ${COLORS.accentEnergy})`,
          }}
        />
      </div>

      <span
        style={{
          color: COLORS.accentEnergy,
          fontSize: '0.5625rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          marginBottom: '0.375rem',
        }}
      >
        North Star
      </span>

      <span
        style={{
          color: COLORS.textSecondary,
          fontSize: '0.8125rem',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: '320px',
          lineHeight: 1.4,
        }}
      >
        "A flourishing life-world"
      </span>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
function EmptyGarden({ onAddQuest }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 100,
          height: 100,
          marginBottom: '1.5rem',
        }}
      >
        {/* Dormant seed */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${COLORS.accentPrimary}20 0%, ${COLORS.bgDeep} 100%)`,
            border: `1px dashed ${COLORS.textMuted}30`,
            animation: `breathe ${TIMING.breathe} ease-in-out infinite`,
          }}
        />
        <Sparkles
          size={36}
          color={COLORS.textMuted}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.4,
          }}
        />
      </div>

      <h3 style={{
        color: COLORS.textPrimary,
        margin: '0 0 0.5rem',
        fontSize: '1rem',
        fontWeight: 500,
      }}>
        The garden awaits
      </h3>

      <p style={{
        color: COLORS.textMuted,
        margin: '0 0 1.5rem',
        fontSize: '0.8125rem',
        maxWidth: '280px',
        lineHeight: 1.5,
      }}>
        Plant your first quest seed and watch it grow into something magnificent.
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
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        <Plus size={18} />
        Plant First Seed
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MACRO VIEW - The Living Garden
// ═══════════════════════════════════════════════════════════════════════════

export function MacroView() {
  const { state, dispatch } = useOrrery();
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  const handleSelectQuest = (questId) => {
    dispatch({ type: 'SET_FOCUS_QUEST', payload: questId });
    dispatch({ type: 'SET_VIEW', payload: 'micro' });
  };

  const questsWithData = useMemo(() =>
    state.quests.map(quest => ({
      quest,
      progress: getQuestProgress(quest.id, state),
      taskCount: state.tasks.filter(t => t.questIds.includes(quest.id)).length,
    })),
    [state.quests, state.tasks]
  );

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Living background */}
      <CosmicAmbient intensity="normal" />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* North Star */}
        <NorthStar />

        {/* Modal: Add Quest */}
        {showAddQuest && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 11, 16, 0.85)',
              backdropFilter: 'blur(8px)',
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
                maxWidth: '380px',
                border: `1px solid ${COLORS.accentPrimary}30`,
                boxShadow: `0 0 40px ${COLORS.accentPrimary}20`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                color: COLORS.textPrimary,
                margin: '0 0 1rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Sparkles size={16} color={COLORS.accentPrimary} />
                Plant New Seed
              </h3>
              <AddQuestForm onClose={() => setShowAddQuest(false)} />
            </div>
          </div>
        )}

        {/* Modal: Edit Quest */}
        {editingQuest && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 11, 16, 0.85)',
              backdropFilter: 'blur(8px)',
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
                maxWidth: '380px',
                border: `1px solid ${COLORS.accentEnergy}30`,
                boxShadow: `0 0 40px ${COLORS.accentEnergy}20`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                color: COLORS.accentEnergy,
                margin: '0 0 1rem',
                fontSize: '1rem',
              }}>
                ✎ Tend Quest
              </h3>
              <EditQuestForm quest={editingQuest} onClose={() => setEditingQuest(null)} />
            </div>
          </div>
        )}

        {/* Quest Garden */}
        {state.quests.length === 0 ? (
          <EmptyGarden onAddQuest={() => setShowAddQuest(true)} />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2.5rem',
                padding: '1.5rem 1rem 2rem',
                minHeight: '280px',
              }}
            >
              {questsWithData.map(({ quest, progress, taskCount }, index) => (
                <QuestOrganism
                  key={quest.id}
                  quest={quest}
                  progress={progress}
                  taskCount={taskCount}
                  onSelect={handleSelectQuest}
                  onEdit={setEditingQuest}
                  index={index}
                />
              ))}
            </div>

            {/* Add seed button */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
              <button
                onClick={() => setShowAddQuest(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
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
                Plant Seed
              </button>
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes organicPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(0.5deg); }
          75% { transform: scale(0.98) rotate(-0.5deg); }
        }

        @keyframes nucleusPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes bloomRing {
          0% { r: 35; opacity: 0.6; }
          100% { r: 50; opacity: 0; }
        }

        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 0; }
        }

        @keyframes fadeGrowIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default MacroView;
