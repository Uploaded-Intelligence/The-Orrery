// ═══════════════════════════════════════════════════════════════════════════
// THE ORRERY - Two-Tier Visual Operating System for WorldOE
// Phase 1: Micro View - Task DAG with Dependencies
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useReducer } from 'react';
import {
  Eye, EyeOff, Plus, Orbit, Target, Sparkles, LayoutGrid, Network
} from 'lucide-react';

// ─── Imports from modules ─────────────────────────────────────────────────────
import { COLORS } from '@/constants';
import { INITIAL_STATE } from '@/constants';
import { getComputedTaskStatus } from '@/utils';
import { orreryReducer, OrreryContext, useOrrery } from '@/store';
import { usePersistence } from '@/hooks';

// ─── View Components ──────────────────────────────────────────────────────────
import { MicroView } from '@/components/views/MicroView';
import { TimeSpaceGPS } from '@/components/gps';

// ─── Macro View Components ────────────────────────────────────────────────────
import { StatsSummary, ImportExportControls, QuestCard, TaskRow } from '@/components/macro';

// ─── Form Components ──────────────────────────────────────────────────────────
import { AddQuestForm, EditQuestForm, AddTaskForm, EditTaskForm } from '@/components/forms';

// ═══════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function Orrery() {
  const [state, dispatch] = useReducer(orreryReducer, INITIAL_STATE);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');

  // UI State
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Persistence
  usePersistence(state, dispatch, setLoadError, setSaveStatus);

  // Filter tasks based on preferences
  const visibleTasks = state.preferences.showActualOnly
    ? state.tasks.filter(t => {
        const status = getComputedTaskStatus(t, state);
        return status === 'available' || status === 'in_progress';
      })
    : state.tasks;

  // Further filter by focused quest if set
  const filteredTasks = state.preferences.focusQuestId
    ? visibleTasks.filter(t => t.questIds.includes(state.preferences.focusQuestId))
    : visibleTasks;

  return (
    <OrreryContext.Provider value={{ state, dispatch }}>
      <div style={{
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: COLORS.bgSpace,
        color: COLORS.textPrimary,
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}>
        {/* Header */}
        <header style={{
          padding: '1rem 1.5rem',
          borderBottom: `1px solid ${COLORS.textMuted}20`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.accentPrimary}, ${COLORS.accentSecondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Orbit size={20} style={{ animation: 'spin 10s linear infinite' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                The Orrery
              </h1>
              <div style={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Phase 1: Micro View
                {saveStatus === 'saving' && <span style={{ color: COLORS.accentWarning }}>• Saving...</span>}
                {saveStatus === 'error' && <span style={{ color: COLORS.accentDanger }}>• Save failed</span>}
                {saveStatus === 'saved' && <span style={{ color: COLORS.accentSuccess }}>• Saved</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_ACTUAL_FILTER' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: state.preferences.showActualOnly
                  ? `2px solid ${COLORS.accentSuccess}`
                  : `1px solid ${COLORS.textMuted}40`,
                background: state.preferences.showActualOnly
                  ? COLORS.accentSuccess + '20'
                  : COLORS.bgElevated,
                color: state.preferences.showActualOnly
                  ? COLORS.accentSuccess
                  : COLORS.textSecondary,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
              title="Show only available tasks (panic button)"
            >
              {state.preferences.showActualOnly ? <Eye size={16} /> : <EyeOff size={16} />}
              Actual
            </button>

            {/* View Toggle */}
            <div style={{
              display: 'flex',
              borderRadius: '0.5rem',
              border: `1px solid ${COLORS.textMuted}40`,
              overflow: 'hidden',
            }}>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'macro' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: state.preferences.currentView === 'macro'
                    ? COLORS.accentPrimary + '30'
                    : COLORS.bgElevated,
                  color: state.preferences.currentView === 'macro'
                    ? COLORS.accentPrimary
                    : COLORS.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
                title="Macro View - Constellation of Quests"
              >
                <LayoutGrid size={16} />
                Macro
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'micro' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderLeft: `1px solid ${COLORS.textMuted}40`,
                  background: state.preferences.currentView === 'micro'
                    ? COLORS.accentSecondary + '30'
                    : COLORS.bgElevated,
                  color: state.preferences.currentView === 'micro'
                    ? COLORS.accentSecondary
                    : COLORS.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
                title="Micro View - Task DAG"
              >
                <Network size={16} />
                Micro
              </button>
            </div>

            <ImportExportControls />
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          padding: state.preferences.currentView === 'micro' ? 0 : '1.5rem',
          flex: 1,
          display: state.preferences.currentView === 'micro' ? 'flex' : 'block',
          flexDirection: 'column',
          minHeight: 0,
          overflow: state.preferences.currentView === 'micro' ? 'hidden' : 'auto',
        }}>
          {loadError && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              background: `${COLORS.accentDanger}20`,
              border: `1px solid ${COLORS.accentDanger}`,
              color: COLORS.accentDanger,
            }}>
              <strong>Load Error:</strong> {loadError}
            </div>
          )}

          {state.preferences.currentView === 'micro' ? (
            <MicroView />
          ) : (
            <>
              <StatsSummary />

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginTop: '1.5rem',
              }}>
                {/* Quests Column */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', color: COLORS.textSecondary }}>
                      ✦ Quests
                    </h2>
                    <button
                      onClick={() => setShowAddQuest(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: COLORS.accentPrimary,
                        color: 'white',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      New Quest
                    </button>
                  </div>

                  {showAddQuest && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: COLORS.bgPanel,
                      border: `1px solid ${COLORS.accentPrimary}40`,
                      marginBottom: '1rem',
                    }}>
                      <AddQuestForm onClose={() => setShowAddQuest(false)} />
                    </div>
                  )}

                  {editingQuest && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: COLORS.bgPanel,
                      border: `1px solid ${COLORS.accentWarning}40`,
                      marginBottom: '1rem',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                      }}>
                        <span style={{ color: COLORS.accentWarning, fontSize: '0.75rem', fontWeight: 500 }}>
                          ✎ Editing Quest
                        </span>
                      </div>
                      <EditQuestForm quest={editingQuest} onClose={() => setEditingQuest(null)} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {state.quests.length === 0 ? (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: COLORS.textMuted,
                        background: COLORS.bgPanel,
                        borderRadius: '0.75rem',
                        border: `1px dashed ${COLORS.textMuted}40`,
                      }}>
                        <Sparkles size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No quests yet. Create one to begin your journey.</p>
                      </div>
                    ) : (
                      state.quests.map(quest => (
                        <QuestCard
                          key={quest.id}
                          quest={quest}
                          onSelect={(id) => dispatch({ type: 'SET_FOCUS_QUEST', payload: id })}
                          onDelete={(id) => dispatch({ type: 'DELETE_QUEST', payload: id })}
                          onEdit={(quest) => setEditingQuest(quest)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Tasks Column */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1rem', color: COLORS.textSecondary }}>
                        ◈ Tasks
                      </h2>
                      {state.preferences.focusQuestId && (
                        <button
                          onClick={() => dispatch({ type: 'SET_FOCUS_QUEST', payload: null })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            background: COLORS.accentSecondary + '30',
                            color: COLORS.accentSecondary,
                            fontSize: '0.625rem',
                            cursor: 'pointer',
                          }}
                        >
                          Focused: {state.quests.find(q => q.id === state.preferences.focusQuestId)?.title}
                          <span style={{ marginLeft: '0.25rem' }}>×</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAddTask(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: COLORS.accentSecondary,
                        color: 'white',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      New Task
                    </button>
                  </div>

                  {showAddTask && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: COLORS.bgPanel,
                      border: `1px solid ${COLORS.accentSecondary}40`,
                      marginBottom: '1rem',
                    }}>
                      <AddTaskForm
                        onClose={() => setShowAddTask(false)}
                        defaultQuestId={state.preferences.focusQuestId}
                      />
                    </div>
                  )}

                  {editingTask && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: COLORS.bgPanel,
                      border: `1px solid ${COLORS.accentWarning}40`,
                      marginBottom: '1rem',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                      }}>
                        <span style={{ color: COLORS.accentWarning, fontSize: '0.75rem', fontWeight: 500 }}>
                          ✎ Editing Task
                        </span>
                      </div>
                      <EditTaskForm task={editingTask} onClose={() => setEditingTask(null)} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredTasks.length === 0 ? (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: COLORS.textMuted,
                        background: COLORS.bgPanel,
                        borderRadius: '0.75rem',
                        border: `1px dashed ${COLORS.textMuted}40`,
                      }}>
                        <Target size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>
                          {state.preferences.showActualOnly
                            ? 'No available tasks right now.'
                            : 'No tasks yet. Add tasks to your quests.'}
                        </p>
                      </div>
                    ) : (
                      filteredTasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onComplete={(id) => dispatch({ type: 'COMPLETE_TASK', payload: id })}
                          onDelete={(id) => dispatch({ type: 'DELETE_TASK', payload: id })}
                          onEdit={(task) => setEditingTask(task)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer - hidden when in micro view to make room for GPS */}
        {state.preferences.currentView !== 'micro' && (
          <footer style={{
            padding: '1rem 1.5rem',
            borderTop: `1px solid ${COLORS.textMuted}20`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: COLORS.textMuted,
          }}>
            <span>WorldOE • The Orrery</span>
            <span>Last synced: {new Date(state.lastSyncedAt).toLocaleTimeString()}</span>
          </footer>
        )}
      </div>

      {/* Time-Space GPS - THE FOUNDATIONAL MICRO LOOP */}
      {/* Always visible, makes time/arc/vastness/allies visible */}
      <TimeSpaceGPS />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        * {
          box-sizing: border-box;
        }

        input, textarea, button {
          font-family: inherit;
        }

        input:focus, textarea:focus {
          outline: 2px solid ${COLORS.accentPrimary};
          outline-offset: -1px;
        }

        button:hover {
          filter: brightness(1.1);
        }

        button:active {
          transform: scale(0.98);
        }
      `}</style>
    </OrreryContext.Provider>
  );
}
