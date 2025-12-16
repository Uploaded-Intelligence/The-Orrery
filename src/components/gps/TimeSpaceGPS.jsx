// ═══════════════════════════════════════════════════════════════
// components/gps/TimeSpaceGPS.jsx
// THE FOUNDATIONAL MICRO LOOP
// "Without this, everything collapses"
// Makes TIME, ARC, VASTNESS, and ALLIES visible
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { Clock, Target, Sparkles, Users, AlertTriangle, Play, Pause, Square, ChevronRight } from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * TimeSpaceGPS - Always-visible floating HUD
 * This component implements the core "I CAN SEE" experience:
 * - I can see where I am in time
 * - I can see how this connects to the bigger picture
 * - I can see I'm not trapped (vastness)
 * - I can see I'm not alone (allies)
 */
export function TimeSpaceGPS() {
  const { state, dispatch } = useOrrery();
  const [now, setNow] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get current session info
  const session = state.activeSession;
  const currentTask = session ? state.tasks.find(t => t.id === session.taskId) : null;
  const currentQuest = currentTask
    ? state.quests.find(q => currentTask.questIds.includes(q.id))
    : null;

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!session) return null;
    const start = new Date(session.startedAt);
    const elapsed = (now - start) / 1000 / 60; // minutes
    const remaining = session.plannedMinutes - elapsed;
    return Math.max(0, remaining);
  }, [session, now]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (!session) return 0;
    const start = new Date(session.startedAt);
    const elapsed = (now - start) / 1000 / 60;
    return Math.min(100, (elapsed / session.plannedMinutes) * 100);
  }, [session, now]);

  // Calculate hard stop warning
  const hardStopWarning = useMemo(() => {
    if (!session?.hardStopAt) return null;
    const hardStop = new Date(session.hardStopAt);
    const minutesUntil = (hardStop - now) / 1000 / 60;
    if (minutesUntil <= 0) return 'PAST';
    if (minutesUntil <= 5) return 'CRITICAL';
    if (minutesUntil <= 15) return 'WARNING';
    return null;
  }, [session, now]);

  // Format time display
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return '--:--';
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get available task count (for vastness reminder)
  const availableTaskCount = useMemo(() => {
    return state.tasks.filter(t => {
      if (t.status === 'completed') return false;
      // Check if locked
      const upstreamEdges = state.edges.filter(e => e.target === t.id);
      const isLocked = upstreamEdges.some(edge => {
        const upstream = state.tasks.find(u => u.id === edge.source);
        return upstream?.status !== 'completed';
      });
      return !isLocked;
    }).length;
  }, [state.tasks, state.edges]);

  // Handle session controls
  const handleEndSession = () => {
    dispatch({ type: 'END_SESSION' });
  };

  const handleCompleteTask = () => {
    if (currentTask) {
      dispatch({ type: 'COMPLETE_TASK', payload: currentTask.id });
    }
  };

  // Determine time warning state
  const getTimeState = () => {
    if (!timeRemaining) return 'idle';
    if (timeRemaining <= 1) return 'critical';
    if (timeRemaining <= 5) return 'warning';
    return 'normal';
  };
  const timeState = getTimeState();

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      pointerEvents: 'auto',
    }}>
      {/* Main GPS Panel */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.bgPanel}f0, ${COLORS.bgElevated}f0)`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${session ? COLORS.statusActive : COLORS.bgElevated}`,
        borderRadius: '16px',
        padding: '12px 20px',
        minWidth: '420px',
        maxWidth: '600px',
        boxShadow: session
          ? `0 4px 24px rgba(6, 182, 212, 0.2), 0 0 0 1px ${COLORS.statusActive}30`
          : '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        {session && currentTask ? (
          /* ═══ ACTIVE SESSION STATE ═══ */
          <>
            {/* Current Task + Timer Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}>
              {/* Task Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: COLORS.statusActive,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Play size={18} color="white" fill="white" />
              </div>

              {/* Task Title */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: COLORS.textPrimary,
                  fontSize: '15px',
                  fontWeight: 600,
                }}>
                  {currentTask.title}
                </div>
                {currentQuest && (
                  <div style={{
                    color: currentQuest.themeColor || COLORS.textMuted,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <ChevronRight size={10} />
                    {currentQuest.title}
                  </div>
                )}
              </div>

              {/* Timer Display */}
              <div style={{
                textAlign: 'right',
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: timeState === 'critical' ? COLORS.accentDanger
                    : timeState === 'warning' ? COLORS.accentWarning
                    : COLORS.textPrimary,
                  animation: timeState === 'critical' ? 'pulse 0.5s ease-in-out infinite' : 'none',
                }}>
                  {formatTime(timeRemaining)}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: COLORS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  remaining
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              height: '6px',
              background: COLORS.bgVoid,
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: timeState === 'critical'
                  ? `linear-gradient(90deg, ${COLORS.accentWarning}, ${COLORS.accentDanger})`
                  : `linear-gradient(90deg, ${COLORS.statusActive}, ${COLORS.accentPrimary})`,
                borderRadius: '3px',
                transition: 'width 1s linear',
              }} />
            </div>

            {/* Hard Stop Warning */}
            {hardStopWarning && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: hardStopWarning === 'CRITICAL' || hardStopWarning === 'PAST'
                  ? `${COLORS.accentDanger}20`
                  : `${COLORS.accentWarning}20`,
                borderRadius: '6px',
                marginBottom: '10px',
              }}>
                <AlertTriangle size={14} color={
                  hardStopWarning === 'CRITICAL' || hardStopWarning === 'PAST'
                    ? COLORS.accentDanger
                    : COLORS.accentWarning
                } />
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: hardStopWarning === 'CRITICAL' || hardStopWarning === 'PAST'
                    ? COLORS.accentDanger
                    : COLORS.accentWarning,
                }}>
                  {hardStopWarning === 'PAST' ? 'HARD STOP PASSED!'
                    : hardStopWarning === 'CRITICAL' ? 'HARD STOP IN < 5 MIN'
                    : 'Hard stop approaching'}
                </span>
              </div>
            )}

            {/* Control Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleEndSession}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: 'transparent',
                  border: `1px solid ${COLORS.textMuted}40`,
                  borderRadius: '6px',
                  color: COLORS.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Square size={12} />
                End
              </button>
              <button
                onClick={handleCompleteTask}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: COLORS.accentSuccess,
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </>
        ) : (
          /* ═══ NO SESSION STATE ═══ */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            {/* Clock Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: COLORS.bgElevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={20} color={COLORS.textMuted} />
            </div>

            {/* Status Text */}
            <div style={{ flex: 1 }}>
              <div style={{
                color: COLORS.textSecondary,
                fontSize: '14px',
              }}>
                No active session
              </div>
              <div style={{
                color: COLORS.textMuted,
                fontSize: '11px',
              }}>
                Double-click an available task to start
              </div>
            </div>

            {/* Current Time */}
            <div style={{
              textAlign: 'right',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'monospace',
                color: COLORS.textPrimary,
              }}>
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vastness Reminder - subtle constellation of possibilities */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '6px 16px',
        background: `${COLORS.bgPanel}80`,
        backdropFilter: 'blur(8px)',
        borderRadius: '20px',
        fontSize: '11px',
        color: COLORS.textMuted,
      }}>
        {/* Available Tasks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Target size={12} color={COLORS.statusAvailable} />
          <span>{availableTaskCount} available</span>
        </div>

        <div style={{
          width: '1px',
          height: '12px',
          background: COLORS.textMuted,
          opacity: 0.3,
        }} />

        {/* Quests Active */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} color={COLORS.accentPrimary} />
          <span>{state.quests.filter(q => q.status === 'active').length} quests active</span>
        </div>

        <div style={{
          width: '1px',
          height: '12px',
          background: COLORS.textMuted,
          opacity: 0.3,
        }} />

        {/* Vastness */}
        <div style={{
          color: COLORS.textMuted,
          fontStyle: 'italic',
          opacity: 0.7,
        }}>
          Possibilities are vast
        </div>
      </div>
    </div>
  );
}

export default TimeSpaceGPS;
