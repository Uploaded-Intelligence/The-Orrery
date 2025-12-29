// ═══════════════════════════════════════════════════════════════
// components/tasks/TaskActionBar.jsx
// Floating action bar for selected task - no context switching!
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, Trash2, Edit3, X, Save, Clock, RotateCcw } from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';
import { getComputedTaskStatus } from '@/utils';

/**
 * TaskActionBar - Floating bar for quick task actions
 * Stays at bottom of screen to avoid blocking the graph
 *
 * @param {Object} props
 * @param {string} props.taskId - Selected task ID
 * @param {Function} props.onClose - Deselect callback
 */
export function TaskActionBar({ taskId, onClose }) {
  const { state, dispatch } = useOrrery();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMinutes, setEditMinutes] = useState(25);
  const inputRef = useRef(null);

  const task = state.tasks.find(t => t.id === taskId);
  const computedStatus = task ? getComputedTaskStatus(task, state) : 'available';

  // Sync form when task changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
    setIsEditing(false);
  }, [taskId, task]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!task) return null;

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          title: editTitle,
          estimatedMinutes: parseInt(editMinutes) || 25,
        }
      }
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    onClose();
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TASK', payload: task.id });
  };

  const handleReopen = () => {
    dispatch({ type: 'REOPEN_TASK', payload: task.id });
  };

  const handleStartSession = () => {
    dispatch({
      type: 'START_SESSION',
      payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
  };

  // Position above TimeSpaceGPS (which is ~160px from bottom)
  // Also use safe area inset for iOS home indicator
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(180px + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      background: COLORS.bgPanel,
      border: `1px solid ${COLORS.bgElevated}`,
      borderRadius: '12px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      zIndex: 1001, // Above TimeSpaceGPS (1000)
      minWidth: 'min(400px, 90vw)', // Responsive for smaller screens
      maxWidth: 'min(600px, 95vw)',
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          padding: '4px',
          background: 'transparent',
          border: 'none',
          color: COLORS.textMuted,
          cursor: 'pointer',
        }}
        title="Deselect (Escape)"
      >
        <X size={18} />
      </button>

      {/* Task title - editable */}
      {isEditing ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: '6px 10px',
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.accentPrimary}`,
              borderRadius: '6px',
              color: COLORS.textPrimary,
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color={COLORS.textMuted} />
            <input
              type="number"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '50px',
                padding: '6px 8px',
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.textMuted}40`,
                borderRadius: '6px',
                color: COLORS.textSecondary,
                fontSize: '13px',
                textAlign: 'center',
              }}
            />
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>min</span>
          </div>
          <button
            onClick={handleSave}
            style={{
              padding: '6px 12px',
              background: COLORS.accentSuccess,
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Save size={14} />
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            color: COLORS.textPrimary,
            fontSize: '14px',
            fontWeight: 500,
            flex: 1,
          }}>
            {task.title}
          </span>
          <span style={{
            color: COLORS.textMuted,
            fontSize: '12px',
          }}>
            {task.estimatedMinutes || 25}m
          </span>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.textMuted}40`,
              borderRadius: '4px',
              color: COLORS.textSecondary,
              fontSize: '12px',
              cursor: 'pointer',
            }}
            title="Edit task title and time"
          >
            <Edit3 size={12} />
            Edit
          </button>
        </div>
      )}

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: COLORS.bgElevated }} />

      {/* Action buttons */}
      {computedStatus === 'available' && (
        <button
          onClick={handleStartSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: COLORS.accentPrimary,
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="Start working on this task"
        >
          <Play size={14} />
          Start
        </button>
      )}

      {computedStatus === 'in_progress' && (
        <button
          onClick={handleComplete}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: COLORS.accentSuccess,
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="Mark as complete"
        >
          <CheckCircle2 size={14} />
          Done
        </button>
      )}

      {computedStatus === 'locked' && (
        <span style={{
          fontSize: '12px',
          color: COLORS.textMuted,
          fontStyle: 'italic',
        }}>
          Complete dependencies first
        </span>
      )}

      {computedStatus === 'completed' && (
        <button
          onClick={handleReopen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'transparent',
            border: `1px solid ${COLORS.accentWarning}`,
            borderRadius: '6px',
            color: COLORS.accentWarning,
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="Undo completion - reopen task"
        >
          <RotateCcw size={14} />
          Reopen
        </button>
      )}

      {/* Delete button */}
      <button
        onClick={handleDelete}
        style={{
          padding: '6px',
          background: 'transparent',
          border: `1px solid ${COLORS.accentDanger}40`,
          borderRadius: '6px',
          color: COLORS.accentDanger,
          cursor: 'pointer',
        }}
        title="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default TaskActionBar;
