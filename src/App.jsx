// ═══════════════════════════════════════════════════════════════════════════
// THE ORRERY - Two-Tier Visual Operating System for WorldOE
// Phase 1: Micro View - Task DAG with Dependencies
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useReducer } from 'react';
import {
  Eye, EyeOff, Plus, Trash2, Lock, Play,
  Download, Upload, RotateCcw, Orbit, Target, Clock, Zap,
  Sparkles, AlertCircle, CheckCircle2, Edit3, LayoutGrid, Network
} from 'lucide-react';

// ─── Imports from extracted modules ──────────────────────────────────────────
import { COLORS, QUEST_COLORS, INITIAL_STATE } from '@/constants';
import { getComputedTaskStatus, getQuestProgress } from '@/utils';
import { orreryReducer, OrreryContext, useOrrery } from '@/store';
import { usePersistence } from '@/hooks';
import { MicroView } from '@/components/views/MicroView';
import { TimeSpaceGPS } from '@/components/gps';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    locked: { icon: Lock, color: COLORS.statusLocked, label: 'Locked' },
    available: { icon: Target, color: COLORS.statusAvailable, label: 'Available' },
    in_progress: { icon: Play, color: COLORS.statusActive, label: 'In Progress' },
    completed: { icon: CheckCircle2, color: COLORS.statusComplete, label: 'Done' },
    blocked: { icon: AlertCircle, color: COLORS.accentWarning, label: 'Blocked' },
  };

  const { icon: Icon, color, label } = config[status] || config.available;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.125rem 0.5rem',
      borderRadius: '1rem',
      background: `${color}20`,
      color: color,
      fontSize: '0.625rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      <Icon size={10} />
      {label}
    </span>
  );
};

// ─── Stats Summary ─────────────────────────────────────────────────────────
const StatsSummary = () => {
  const { state } = useOrrery();

  const totalQuests = state.quests.length;
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const availableTasks = state.tasks.filter(t => {
    const status = getComputedTaskStatus(t, state);
    return status === 'available' || status === 'in_progress';
  }).length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
    }}>
      {[
        { label: 'Quests', value: totalQuests, icon: Orbit, color: COLORS.accentPrimary },
        { label: 'Tasks', value: totalTasks, icon: Target, color: COLORS.accentSecondary },
        { label: 'Available', value: availableTasks, icon: Zap, color: COLORS.accentWarning },
        { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: COLORS.accentSuccess },
      ].map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            background: COLORS.bgPanel,
            border: `1px solid ${color}30`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Icon size={14} style={{ color }} />
            <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>{label}</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: COLORS.textPrimary }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Import/Export Controls ────────────────────────────────────────────────
const ImportExportControls = () => {
  const { state, dispatch } = useOrrery();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orrery-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        dispatch({ type: 'LOAD_STATE', payload: data });
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
    };
    input.click();
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
    setShowConfirmReset(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button
        onClick={handleExport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.375rem 0.625rem',
          borderRadius: '0.375rem',
          border: `1px solid ${COLORS.textMuted}40`,
          background: 'transparent',
          color: COLORS.textSecondary,
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
        title="Export data"
      >
        <Download size={12} />
        Export
      </button>
      <button
        onClick={handleImport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.375rem 0.625rem',
          borderRadius: '0.375rem',
          border: `1px solid ${COLORS.textMuted}40`,
          background: 'transparent',
          color: COLORS.textSecondary,
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
        title="Import data"
      >
        <Upload size={12} />
        Import
      </button>

      {showConfirmReset ? (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.375rem 0.625rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: COLORS.accentDanger,
              color: 'white',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Confirm Reset
          </button>
          <button
            onClick={() => setShowConfirmReset(false)}
            style={{
              padding: '0.375rem 0.625rem',
              borderRadius: '0.375rem',
              border: `1px solid ${COLORS.textMuted}40`,
              background: 'transparent',
              color: COLORS.textSecondary,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirmReset(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.375rem',
            border: `1px solid ${COLORS.accentDanger}40`,
            background: 'transparent',
            color: COLORS.accentDanger,
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
          title="Reset all data"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  );
};

// ─── Quest Card ────────────────────────────────────────────────────────────
const QuestCard = ({ quest, onSelect, onDelete, onEdit }) => {
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
};

// ─── Task Row ───────────────────────────────────────────────────────────────
const TaskRow = ({ task, onComplete, onDelete, onEdit }) => {
  const { state } = useOrrery();
  const status = getComputedTaskStatus(task, state);
  const quests = state.quests.filter(q => task.questIds.includes(q.id));

  const statusConfig = {
    locked: { opacity: 0.5, borderColor: COLORS.statusLocked },
    available: { opacity: 1, borderColor: COLORS.statusAvailable },
    in_progress: { opacity: 1, borderColor: COLORS.statusActive },
    completed: { opacity: 0.7, borderColor: COLORS.statusComplete },
    blocked: { opacity: 0.8, borderColor: COLORS.accentWarning },
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        background: COLORS.bgPanel,
        border: `1px solid ${config.borderColor}40`,
        opacity: config.opacity,
        transition: 'all 0.2s',
      }}
    >
      <StatusBadge status={status} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: COLORS.textPrimary,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textDecoration: status === 'completed' ? 'line-through' : 'none',
        }}>
          {task.title}
        </div>
        {quests.length > 0 && (
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            {quests.map(q => (
              <span
                key={q.id}
                style={{
                  padding: '0 0.375rem',
                  borderRadius: '0.25rem',
                  background: `${q.themeColor}30`,
                  color: q.themeColor,
                  fontSize: '0.625rem',
                  fontWeight: 500,
                }}
              >
                {q.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {task.estimatedMinutes && (
        <span style={{
          color: COLORS.textMuted,
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <Clock size={12} />
          {task.estimatedMinutes}m
        </span>
      )}

      {status === 'available' && (
        <button
          onClick={() => onComplete(task.id)}
          style={{
            background: COLORS.accentSuccess,
            border: 'none',
            borderRadius: '0.25rem',
            padding: '0.25rem 0.5rem',
            color: 'white',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      )}

      <button
        onClick={() => onEdit(task)}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.textMuted,
          cursor: 'pointer',
          padding: '0.25rem',
        }}
        title="Edit task"
      >
        <Edit3 size={14} />
      </button>

      <button
        onClick={() => onDelete(task.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.textMuted,
          cursor: 'pointer',
          padding: '0.25rem',
        }}
        title="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// ─── Add Quest Form ─────────────────────────────────────────────────────────
const AddQuestForm = ({ onClose }) => {
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
};

// ─── Edit Quest Form ────────────────────────────────────────────────────────
const EditQuestForm = ({ quest, onClose }) => {
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
          {['active', 'paused', 'completed', 'archived'].map(s => (
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
};

// ─── Add Task Form ──────────────────────────────────────────────────────────
const AddTaskForm = ({ onClose, defaultQuestId }) => {
  const { state, dispatch } = useOrrery();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [questIds, setQuestIds] = useState(defaultQuestId ? [defaultQuestId] : []);
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        notes: notes.trim(),
        questIds,
        status: 'available',
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        actualMinutes: null,
      },
    });
    onClose();
  };

  const toggleQuest = (qid) => {
    setQuestIds(prev =>
      prev.includes(qid)
        ? prev.filter(id => id !== qid)
        : [...prev, qid]
    );
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
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
        autoFocus
      />
      <textarea
        placeholder="Notes (optional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Estimated minutes (optional)"
        value={estimatedMinutes}
        onChange={(e) => setEstimatedMinutes(e.target.value)}
        style={inputStyle}
        min="1"
      />

      {state.quests.length > 0 && (
        <div>
          <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Assign to quests:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {state.quests.map(q => (
              <button
                key={q.id}
                type="button"
                onClick={() => toggleQuest(q.id)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  border: `1px solid ${q.themeColor}`,
                  background: questIds.includes(q.id) ? q.themeColor : 'transparent',
                  color: questIds.includes(q.id) ? 'white' : q.themeColor,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>
      )}

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
          Add Task
        </button>
      </div>
    </div>
  );
};

// ─── Edit Task Form ─────────────────────────────────────────────────────────
const EditTaskForm = ({ task, onClose }) => {
  const { state, dispatch } = useOrrery();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [questIds, setQuestIds] = useState(task.questIds || []);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes?.toString() || '');
  const [taskStatus, setTaskStatus] = useState(task.status);

  const handleSave = () => {
    if (!title.trim()) return;

    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          title: title.trim(),
          notes: notes.trim(),
          questIds,
          status: taskStatus,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        },
      },
    });
    onClose();
  };

  const toggleQuest = (qid) => {
    setQuestIds(prev =>
      prev.includes(qid)
        ? prev.filter(id => id !== qid)
        : [...prev, qid]
    );
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
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Task Title
        </label>
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Notes
        </label>
        <textarea
          placeholder="Notes (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
          Estimated Minutes
        </label>
        <input
          type="number"
          placeholder="Estimated minutes (optional)"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
          style={inputStyle}
          min="1"
        />
      </div>
      <div>
        <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
          Status
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['available', 'in_progress', 'completed', 'blocked'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setTaskStatus(s)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                border: taskStatus === s ? `2px solid ${COLORS.accentPrimary}` : `1px solid ${COLORS.textMuted}40`,
                background: taskStatus === s ? `${COLORS.accentPrimary}20` : 'transparent',
                color: taskStatus === s ? COLORS.accentPrimary : COLORS.textSecondary,
                fontSize: '0.75rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {state.quests.length > 0 && (
        <div>
          <label style={{ color: COLORS.textSecondary, fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Assigned Quests:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {state.quests.map(q => (
              <button
                key={q.id}
                type="button"
                onClick={() => toggleQuest(q.id)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  border: `1px solid ${q.themeColor}`,
                  background: questIds.includes(q.id) ? q.themeColor : 'transparent',
                  color: questIds.includes(q.id) ? 'white' : q.themeColor,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>
      )}

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
};

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
