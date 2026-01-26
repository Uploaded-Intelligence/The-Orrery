// ═══════════════════════════════════════════════════════════════
// components/views/MicroView/MicroView3D.jsx
// 3D Micro View - Integrates R3F canvas with Orrery state
//
// Replaces SVG rendering while maintaining:
// - Same state management (useOrrery hook)
// - Same task filtering logic
// - Same interaction patterns (click, double-click)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useOrrery } from '@/store';
import { getComputedTaskStatus, getLayoutPositions } from '@/utils';
import { OrreryCanvas, TaskSphere, DependencyTube, CosmicParticles, CameraController } from '@/components/three';
import { QUEST_COLORS, COLORS } from '@/constants';
import { Plus } from 'lucide-react';

// Scale factor: d3 positions (pixels) to Three.js world units
// 100px in d3 space = 5 world units in Three.js
const SCALE = 0.05;

/**
 * Calculate task readiness based on upstream dependency completion
 * @param {string} taskId - Task to calculate readiness for
 * @param {Array} edges - All edges in the graph
 * @param {Array} tasks - All tasks
 * @param {Object} state - Orrery state for status calculation
 * @returns {number} Readiness from 0 to 1
 */
function calculateReadiness(taskId, edges, tasks, state) {
  // Find all upstream dependencies (edges where this task is target)
  const upstreamEdges = edges.filter(e => e.target === taskId);

  if (upstreamEdges.length === 0) {
    // No dependencies = fully ready
    return 1;
  }

  // Count completed upstream tasks
  let completedCount = 0;
  upstreamEdges.forEach(edge => {
    const sourceTask = tasks.find(t => t.id === edge.source);
    if (sourceTask) {
      const status = getComputedTaskStatus(sourceTask, state);
      if (status === 'completed') {
        completedCount++;
      }
    }
  });

  return completedCount / upstreamEdges.length;
}

/**
 * MicroView3D - 3D visualization of task DAG
 * Connects Three.js rendering with Orrery state
 */
export function MicroView3D() {
  const { state, dispatch, api } = useOrrery();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [unlockAnimations, setUnlockAnimations] = useState(new Map());
  const [focusTarget, setFocusTarget] = useState(null);

  // ─── Filter tasks for current quest focus ──────────────────
  const visibleTasks = useMemo(() => {
    let tasks = state.tasks;

    if (state.preferences.focusQuestId) {
      tasks = tasks.filter(t =>
        t.questIds.includes(state.preferences.focusQuestId)
      );
    }

    // Apply "Actual" filter (hide locked tasks)
    if (state.preferences.showActualOnly) {
      tasks = tasks.filter(t => {
        const status = getComputedTaskStatus(t, state);
        return status === 'available' || status === 'in_progress' || status === 'completed';
      });
    }

    return tasks;
  }, [state.tasks, state.preferences.focusQuestId, state.preferences.showActualOnly, state]);

  // ─── Filter edges between visible tasks ────────────────────
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleTasks.map(t => t.id));
    return state.edges.filter(e =>
      visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [state.edges, visibleTasks]);

  // ─── Calculate positions (reuse 2D layout logic) ───────────
  const basePositions = useMemo(() =>
    getLayoutPositions(visibleTasks, visibleEdges),
    [visibleTasks, visibleEdges]
  );

  // ─── Calculate DAG layer depths for Z-distribution ─────────
  // Layer 0 = root tasks (no dependencies), Layer N = N hops from root
  const dagLayers = useMemo(() => {
    const layers = new Map();
    const getDepth = (taskId, visited = new Set()) => {
      if (visited.has(taskId)) return 0; // Cycle protection
      if (layers.has(taskId)) return layers.get(taskId);

      visited.add(taskId);
      const incoming = visibleEdges.filter(e => e.target === taskId);
      if (incoming.length === 0) {
        layers.set(taskId, 0);
        return 0;
      }

      const depth = 1 + Math.max(...incoming.map(e =>
        getDepth(e.source, new Set(visited))
      ));
      layers.set(taskId, depth);
      return depth;
    };

    visibleTasks.forEach(t => getDepth(t.id));
    return layers;
  }, [visibleTasks, visibleEdges]);

  // Z-depth configuration
  const Z_LAYER_SPACING = 5; // World units per DAG layer

  // ─── Prepare quests with colors ────────────────────────────
  const questsWithColors = useMemo(() =>
    state.quests.map((q, i) => ({
      id: q.id,
      title: q.title,
      color: q.themeColor || QUEST_COLORS[i % QUEST_COLORS.length],
    })),
    [state.quests]
  );

  // ─── Calculate session state for particles ──────────────────
  const sessionState = useMemo(() => {
    if (state.activeSession?.completingAt) {
      return 'completing';
    }
    if (state.activeSession) {
      return 'active';
    }
    return 'idle';
  }, [state.activeSession]);

  // ─── Convert d3 positions to 3D coordinates ────────────────
  const getPosition = useCallback((task) => {
    // Use task's stored position, layout position, or default to origin
    const taskPos = task.position && (task.position.x !== 0 || task.position.y !== 0)
      ? task.position
      : basePositions.get(task.id) || { x: 0, y: 0 };

    // Phase 2: Z-depth distribution by DAG layer
    // Layer 0 (roots) at Z=0, deeper layers recede into background
    const layer = dagLayers.get(task.id) || 0;

    return {
      x: taskPos.x * SCALE,
      y: -taskPos.y * SCALE, // Flip Y for 3D coordinate system (Y-up)
      z: -layer * Z_LAYER_SPACING, // Negative Z = further from camera
    };
  }, [basePositions, dagLayers]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleSelect = useCallback((taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  }, [selectedTaskId]);

  const handleDoubleClick = useCallback((task) => {
    const status = getComputedTaskStatus(task, state);
    if (status === 'available') {
      dispatch({
        type: 'START_SESSION',
        payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
      });
    } else if (status === 'in_progress' && api) {
      api.completeTask(task.id).catch(e => console.error('Complete failed:', e));
    }
  }, [dispatch, state, api]);

  // Add new task
  const addTask = useCallback(async () => {
    const questIds = state.preferences.focusQuestId
      ? [state.preferences.focusQuestId]
      : [];

    try {
      await api.createTask({
        title: 'New Experiment',
        questIds,
        status: 'available',
        estimatedMinutes: 25,
        actualMinutes: null,
        isRecurring: false,
        notes: '',
      });
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  }, [state.preferences.focusQuestId, api]);

  // ─── Get positions map for edges ───────────────────────────
  const positionsMap = useMemo(() => {
    const map = new Map();
    visibleTasks.forEach(task => {
      map.set(task.id, getPosition(task));
    });
    return map;
  }, [visibleTasks, getPosition]);

  // ─── Focus camera on selected node ────────────────────────
  useEffect(() => {
    if (selectedTaskId) {
      const position = positionsMap.get(selectedTaskId);
      if (position) {
        setFocusTarget({
          x: position.x,
          y: position.y,
          z: position.z || 0,
        });
      }
    }
  }, [selectedTaskId, positionsMap]);

  // Get quest name for header
  const focusedQuest = state.quests.find(q => q.id === state.preferences.focusQuestId);

  return (
    <div
      className="micro-view-3d"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Minimal 3D Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: COLORS.bgPanel,
        borderBottom: `1px solid ${COLORS.bgElevated}`,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: focusedQuest ? focusedQuest.themeColor : COLORS.textPrimary,
        }}>
          {focusedQuest ? focusedQuest.title : 'All Tasks'}
        </h2>
        <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
          ({visibleTasks.length} tasks)
        </span>

        {/* 3D indicator */}
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          background: COLORS.accentSecondary + '20',
          color: COLORS.accentSecondary,
          fontSize: '11px',
          fontWeight: 600,
        }}>
          3D
        </span>

        {/* Clear focus button */}
        {focusedQuest && (
          <button
            onClick={() => dispatch({ type: 'SET_FOCUS_QUEST', payload: null })}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.textMuted}40`,
              background: 'transparent',
              color: COLORS.textMuted,
              fontSize: '12px',
              cursor: 'pointer',
            }}
            title="Clear focus - view all tasks"
          >
            x Clear Focus
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Add task button */}
        <button
          onClick={addTask}
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
        >
          <Plus size={16} />
          Experiment
        </button>
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <OrreryCanvas>
          {/* Camera controller for focus-on-node */}
          <CameraController focusTarget={focusTarget} />

          {/* Background particles */}
          <CosmicParticles count={100} />

          {/* Render edges first (behind nodes in 3D via render order) */}
          {visibleEdges.map(edge => {
            const sourcePos = positionsMap.get(edge.source);
            const targetPos = positionsMap.get(edge.target);
            if (!sourcePos || !targetPos) return null;

            return (
              <DependencyTube
                key={edge.id}
                sourcePos={sourcePos}
                targetPos={targetPos}
                isSelected={false}
                isUnlocking={false}
              />
            );
          })}

          {/* Render task nodes */}
          {visibleTasks.map(task => {
            const position = getPosition(task);
            const computedStatus = getComputedTaskStatus(task, state);

            return (
              <TaskSphere
                key={task.id}
                task={{
                  ...task,
                  status: computedStatus,
                }}
                position={position}
                isSelected={selectedTaskId === task.id}
                onSelect={handleSelect}
                onDoubleClick={handleDoubleClick}
                quests={questsWithColors}
              />
            );
          })}
        </OrreryCanvas>

        {/* Empty state */}
        {visibleTasks.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: COLORS.textMuted,
            zIndex: 10,
          }}>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>No experiments yet</p>
            <button
              onClick={addTask}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: COLORS.accentPrimary,
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Add First Experiment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MicroView3D;
