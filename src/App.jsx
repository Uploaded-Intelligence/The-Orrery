// ═══════════════════════════════════════════════════════════════════════════
// THE ORRERY - Two-Tier Visual Operating System for WorldOE
// Macro View: Quest Constellation | Micro View: Task DAG
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useReducer, useCallback } from 'react';
import { Eye, EyeOff, Orbit, LayoutGrid, Network, Box } from 'lucide-react';

// ─── Imports from modules ─────────────────────────────────────────────────────
import { COLORS, INITIAL_STATE } from '@/constants';
import { orreryReducer, OrreryContext } from '@/store';
import { usePersistence, useLifeRPG } from '@/hooks';

// ─── View Components ──────────────────────────────────────────────────────────
import { MicroView, MicroView3D } from '@/components/views/MicroView';
import { MacroView, ImportExportControls } from '@/components/macro';
import { TimeSpaceGPS } from '@/components/gps';

// ─── UI Components ────────────────────────────────────────────────────────────
import { APIStatus } from '@/components/ui/APIStatus';
import { OracleButton, QuickOracle } from '@/components/oracle';

// ═══════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function Orrery() {
  const [state, dispatch] = useReducer(orreryReducer, INITIAL_STATE);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');

  // 3D view feature flag - can be toggled via UI or localStorage
  const [use3DView, setUse3DView] = useState(() => {
    const stored = localStorage.getItem('orrery-use-3d-view');
    return stored === 'true';
  });

  // Persist preference
  const toggle3DView = useCallback(() => {
    setUse3DView(prev => {
      const next = !prev;
      localStorage.setItem('orrery-use-3d-view', String(next));
      return next;
    });
  }, []);

  // Persistence (local storage backup)
  usePersistence(state, dispatch, setLoadError, setSaveStatus);

  // LifeRPG API sync (server-authoritative)
  // Uses Experiments ontology but provides backward-compatible API
  const {
    isConnected,
    isLoading,
    sync,
    // Legacy task operations (map to experiments)
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    // Legacy quest operations (map to inquiries)
    createQuest,
    updateQuest,
    deleteQuest,
    // New Experiments ontology operations
    createExperiment,
    updateExperiment,
    concludeExperiment,
    createInquiry,
    updateInquiry,
    integrateInquiry,
    // Edges and Vines
    createEdge,
    deleteEdge,
    createVine,
    deleteVine,
  } = useLifeRPG(dispatch);

  // API functions for components to use (server-authoritative)
  const api = {
    // Legacy (backward compatible)
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    syncFromTaskNotes: sync,
    isConnected,
    isLoading,
    // Quest operations
    createQuest,
    updateQuest,
    deleteQuest,
    // Experiments ontology
    createExperiment,
    updateExperiment,
    concludeExperiment,
    createInquiry,
    updateInquiry,
    integrateInquiry,
    // Graph operations
    createEdge,
    deleteEdge,
    createVine,
    deleteVine,
    sync,
  };

  const isMicro = state.preferences.currentView === 'micro';

  return (
    <OrreryContext.Provider value={{ state, dispatch, api }}>
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
          position: 'relative',
          zIndex: 20,
          padding: '0.75rem 1.5rem',
          borderBottom: `1px solid ${COLORS.textMuted}15`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `${COLORS.bgSpace}ee`,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.accentPrimary}, ${COLORS.accentSecondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Orbit size={18} style={{ animation: 'spin 10s linear infinite' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                The Orrery
              </h1>
              <div style={{ fontSize: '0.6875rem', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isMicro ? 'Micro: Task Flow' : 'Macro: Quest Map'}
                {saveStatus === 'saving' && <span style={{ color: COLORS.accentWarning }}>• Saving...</span>}
                {saveStatus === 'error' && <span style={{ color: COLORS.accentDanger }}>• Error</span>}
                {saveStatus === 'saved' && <span style={{ color: COLORS.accentSuccess }}>• Saved</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Actual Filter Button */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_ACTUAL_FILTER' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.625rem',
                borderRadius: '0.5rem',
                border: state.preferences.showActualOnly
                  ? `2px solid ${COLORS.accentSuccess}`
                  : `1px solid ${COLORS.textMuted}30`,
                background: state.preferences.showActualOnly
                  ? COLORS.accentSuccess + '15'
                  : 'transparent',
                color: state.preferences.showActualOnly
                  ? COLORS.accentSuccess
                  : COLORS.textMuted,
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
              title="Show only available tasks"
            >
              {state.preferences.showActualOnly ? <Eye size={14} /> : <EyeOff size={14} />}
              Actual
            </button>

            {/* View Toggle */}
            <div style={{
              display: 'flex',
              borderRadius: '0.5rem',
              border: `1px solid ${COLORS.textMuted}25`,
              overflow: 'hidden',
            }}>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'macro' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.625rem',
                  border: 'none',
                  background: !isMicro ? COLORS.accentPrimary + '25' : 'transparent',
                  color: !isMicro ? COLORS.accentPrimary : COLORS.textMuted,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
              >
                <LayoutGrid size={14} />
                Macro
              </button>
              <button
                onClick={() => {
                  // Clear quest focus to show ALL tasks when manually switching to Micro
                  dispatch({ type: 'SET_FOCUS_QUEST', payload: null });
                  dispatch({ type: 'SET_VIEW', payload: 'micro' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.625rem',
                  border: 'none',
                  borderLeft: `1px solid ${COLORS.textMuted}25`,
                  background: isMicro ? COLORS.accentSecondary + '25' : 'transparent',
                  color: isMicro ? COLORS.accentSecondary : COLORS.textMuted,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
                title="View all tasks (mycelial network)"
              >
                <Network size={14} />
                Micro
              </button>
            </div>

            {/* 3D View Toggle (only when in Micro view) */}
            {isMicro && (
              <button
                onClick={toggle3DView}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.625rem',
                  borderRadius: '0.5rem',
                  border: use3DView
                    ? `2px solid ${COLORS.accentSecondary}`
                    : `1px solid ${COLORS.textMuted}30`,
                  background: use3DView
                    ? COLORS.accentSecondary + '15'
                    : 'transparent',
                  color: use3DView
                    ? COLORS.accentSecondary
                    : COLORS.textMuted,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
                title={use3DView ? 'Switch to 2D view' : 'Switch to 3D view'}
              >
                <Box size={14} />
                {use3DView ? '3D' : '2D'}
              </button>
            )}

            {/* Oracle Consultation Button */}
            <OracleButton />

            {/* API Connection Status */}
            <APIStatus />

            <ImportExportControls />
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {loadError && (
            <div style={{
              padding: '0.75rem 1rem',
              margin: '0.5rem',
              borderRadius: '0.5rem',
              background: `${COLORS.accentDanger}15`,
              border: `1px solid ${COLORS.accentDanger}40`,
              color: COLORS.accentDanger,
              fontSize: '0.8125rem',
            }}>
              <strong>Load Error:</strong> {loadError}
            </div>
          )}

          {isMicro ? (
            use3DView ? <MicroView3D /> : <MicroView />
          ) : <MacroView />}
        </main>
      </div>

      {/* Time-Space GPS - THE FOUNDATIONAL MICRO LOOP */}
      <TimeSpaceGPS />

      {/* Quick Oracle - Gemini-powered instant guidance */}
      <QuickOracle />

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
