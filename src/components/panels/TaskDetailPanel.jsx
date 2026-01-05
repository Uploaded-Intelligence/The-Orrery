// ═══════════════════════════════════════════════════════════════
// components/panels/TaskDetailPanel.jsx
// Slide-out panel for task details and editing
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  X, Clock, Play, CheckCircle2, Lock, Circle,
  Edit3, Trash2, Link2, Save, AlertCircle
} from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';
import { getComputedTaskStatus } from '@/utils';

const STATUS_CONFIG = {
  locked: { icon: Lock, color: COLORS.statusLocked, label: 'Locked' },
  available: { icon: Circle, color: COLORS.statusAvailable, label: 'Available' },
  in_progress: { icon: Play, color: COLORS.statusActive, label: 'In Progress' },
  completed: { icon: CheckCircle2, color: COLORS.statusComplete, label: 'Completed' },
};

/**
 * TaskDetailPanel - Slide-out panel showing task details
 * @param {Object} props
 * @param {string|null} props.taskId - Selected task ID
 * @param {Function} props.onClose - Close panel callback
 * @param {Function} props.onStartEdge - Start creating edge from this task
 */
export function TaskDetailPanel({ taskId, onClose, onStartEdge }) {
  const { state, dispatch } = useOrrery();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    estimatedMinutes: 25,
    notes: '',
  });

  const task = state.tasks.find(t => t.id === taskId);
  const computedStatus = task ? getComputedTaskStatus(task, state) : 'available';
  const statusConfig = STATUS_CONFIG[computedStatus] || STATUS_CONFIG.available;
  const StatusIcon = statusConfig.icon;

  // Get quest names for this task
  const questNames = task?.questIds
    .map(qid => state.quests.find(q => q.id === qid)?.title)
    .filter(Boolean)
    .join(', ') || 'No quest';

  // Get dependency info
  const incomingEdges = state.edges.filter(e => e.target === taskId);
  const outgoingEdges = state.edges.filter(e => e.source === taskId);

  const dependsOn = incomingEdges
    .map(e => state.tasks.find(t => t.id === e.source)?.title)
    .filter(Boolean);

  const blockedBy = dependsOn.filter(title => {
    const depTask = state.tasks.find(t => t.title === title);
    return depTask && depTask.status !== 'completed';
  });

  // Sync edit form when task changes
  useEffect(() => {
    if (task && !isEditing) {
      setEditForm({
        title: task.title,
        estimatedMinutes: task.estimatedMinutes || 25,
        notes: task.notes || '',
      });
    }
  }, [task, isEditing]);

  if (!task) return null;

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          title: editForm.title,
          estimatedMinutes: parseInt(editForm.estimatedMinutes) || 25,
          notes: editForm.notes,
        }
      }
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete task "${task.title}"?`)) {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
      onClose();
    }
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TASK', payload: task.id });
  };

  const handleStartSession = () => {
    dispatch({
      type: 'START_SESSION',
      payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
    });
  };

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '320px',
      background: COLORS.bgPanel,
      borderLeft: `1px solid ${COLORS.bgElevated}`,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: `1px solid ${COLORS.bgElevated}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusIcon size={18} color={statusConfig.color} />
          <span style={{
            fontSize: '12px',
            color: statusConfig.color,
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            {statusConfig.label}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '4px',
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
      }}>
        {isEditing ? (
          // Edit Mode
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>
                Title
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.textMuted}40`,
                  borderRadius: '6px',
                  color: COLORS.textPrimary,
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={editForm.estimatedMinutes}
                onChange={(e) => setEditForm({ ...editForm, estimatedMinutes: e.target.value })}
                style={{
                  width: '100px',
                  padding: '8px 12px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.textMuted}40`,
                  borderRadius: '6px',
                  color: COLORS.textPrimary,
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>
                Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.textMuted}40`,
                  borderRadius: '6px',
                  color: COLORS.textPrimary,
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        ) : (
          // View Mode
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: COLORS.textPrimary,
            }}>
              {task.title}
            </h3>

            {/* Quest */}
            <div>
              <label style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>
                Quest
              </label>
              <p style={{ margin: '4px 0 0', color: COLORS.textSecondary, fontSize: '14px' }}>
                {questNames}
              </p>
            </div>

            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color={COLORS.textMuted} />
              <span style={{ color: COLORS.textSecondary, fontSize: '14px' }}>
                {task.estimatedMinutes || 25} minutes
                {task.actualMinutes && ` (actual: ${task.actualMinutes}m)`}
              </span>
            </div>

            {/* What must be done first */}
            {dependsOn.length > 0 && (
              <div>
                <label style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>
                  Requires ({dependsOn.length})
                </label>
                <div style={{ marginTop: '4px' }}>
                  {dependsOn.map((title, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '4px 8px',
                        marginBottom: '4px',
                        background: COLORS.bgElevated,
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: blockedBy.includes(title) ? COLORS.accentWarning : COLORS.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {blockedBy.includes(title) && <AlertCircle size={12} />}
                      {title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What this unlocks when done */}
            {outgoingEdges.length > 0 && (
              <div>
                <label style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>
                  Unlocks ({outgoingEdges.length})
                </label>
                <div style={{ marginTop: '4px' }}>
                  {outgoingEdges.map(e => {
                    const blockedTask = state.tasks.find(t => t.id === e.target);
                    return blockedTask ? (
                      <div
                        key={e.id}
                        style={{
                          padding: '4px 8px',
                          marginBottom: '4px',
                          background: COLORS.bgElevated,
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: COLORS.textSecondary,
                        }}
                      >
                        {blockedTask.title}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div>
                <label style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase' }}>
                  Notes
                </label>
                <p style={{
                  margin: '4px 0 0',
                  color: COLORS.textSecondary,
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                }}>
                  {task.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${COLORS.bgElevated}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                background: COLORS.accentSuccess,
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '10px 16px',
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.textMuted}40`,
                borderRadius: '6px',
                color: COLORS.textSecondary,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {/* Action buttons based on status */}
            {computedStatus === 'available' && (
              <button
                onClick={handleStartSession}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  background: COLORS.accentPrimary,
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Play size={16} />
                Start Session
              </button>
            )}

            {computedStatus === 'in_progress' && (
              <button
                onClick={handleComplete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  background: COLORS.accentSuccess,
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={16} />
                Complete Task
              </button>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.textMuted}40`,
                  borderRadius: '6px',
                  color: COLORS.textSecondary,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={16} />
                Edit
              </button>

              <button
                onClick={onStartEdge}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.accentSecondary}40`,
                  borderRadius: '6px',
                  color: COLORS.accentSecondary,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Link2 size={16} />
                Add Dep
              </button>

              <button
                onClick={handleDelete}
                style={{
                  padding: '10px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.accentDanger}40`,
                  borderRadius: '6px',
                  color: COLORS.accentDanger,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskDetailPanel;
