// ═══════════════════════════════════════════════════════════════
// components/views/MicroView/MicroView.jsx
// Micro View - DAG of tasks with dependencies
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef } from 'react';
import { Plus, Trash2, Link2, Link2Off, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useOrrery } from '@/store';
import { COLORS } from '@/constants';
import { getLayoutPositions, getCanvasBounds, getComputedTaskStatus, LAYOUT } from '@/utils';
import { TaskNode } from '@/components/tasks';
import { DependencyEdge, EdgePreview, EdgeDefs } from '@/components/edges';

/**
 * MicroView - Task DAG visualization
 * Shows tasks for the focused quest with dependency edges
 */
export function MicroView() {
  const { state, dispatch } = useOrrery();
  const svgRef = useRef(null);

  // Local UI state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [edgeSourceId, setEdgeSourceId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // View transform
  const [pan, setPan] = useState(state.preferences.microViewPosition);
  const [zoom, setZoom] = useState(state.preferences.microViewZoom);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Filter tasks by focused quest
  const visibleTasks = useMemo(() => {
    if (state.preferences.focusQuestId) {
      return state.tasks.filter(t =>
        t.questIds.includes(state.preferences.focusQuestId)
      );
    }
    return state.tasks;
  }, [state.tasks, state.preferences.focusQuestId]);

  // Filter edges to only show those between visible tasks
  const visibleEdges = useMemo(() => {
    const taskIds = new Set(visibleTasks.map(t => t.id));
    return state.edges.filter(e =>
      taskIds.has(e.source) && taskIds.has(e.target)
    );
  }, [state.edges, visibleTasks]);

  // Calculate layout positions
  const positions = useMemo(() =>
    getLayoutPositions(visibleTasks, visibleEdges),
    [visibleTasks, visibleEdges]
  );

  // Calculate canvas bounds
  const bounds = useMemo(() =>
    getCanvasBounds(positions),
    [positions]
  );

  // Get quest name for header
  const focusedQuest = state.quests.find(q => q.id === state.preferences.focusQuestId);

  // Handle task click
  const handleTaskClick = useCallback((taskId) => {
    if (edgeSourceId) {
      // Creating edge - target selected
      if (edgeSourceId !== taskId) {
        dispatch({
          type: 'ADD_EDGE',
          payload: { source: edgeSourceId, target: taskId }
        });
      }
      setEdgeSourceId(null);
    } else {
      // Normal selection
      setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
      setSelectedEdgeId(null);
    }
  }, [edgeSourceId, selectedTaskId, dispatch]);

  // Handle task double-click (start session or complete)
  const handleTaskDoubleClick = useCallback((task) => {
    const computedStatus = getComputedTaskStatus(task, state);
    if (computedStatus === 'available') {
      dispatch({
        type: 'START_SESSION',
        payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
      });
    } else if (computedStatus === 'in_progress') {
      dispatch({ type: 'COMPLETE_TASK', payload: task.id });
    }
  }, [state, dispatch]);

  // Handle edge click
  const handleEdgeClick = useCallback((edgeId) => {
    setSelectedEdgeId(edgeId === selectedEdgeId ? null : edgeId);
    setSelectedTaskId(null);
  }, [selectedEdgeId]);

  // Start edge creation
  const startEdgeCreation = useCallback(() => {
    if (selectedTaskId) {
      setEdgeSourceId(selectedTaskId);
      setSelectedTaskId(null);
    }
  }, [selectedTaskId]);

  // Cancel edge creation
  const cancelEdgeCreation = useCallback(() => {
    setEdgeSourceId(null);
  }, []);

  // Delete selected task or edge
  const deleteSelected = useCallback(() => {
    if (selectedEdgeId) {
      dispatch({ type: 'DELETE_EDGE', payload: selectedEdgeId });
      setSelectedEdgeId(null);
    } else if (selectedTaskId) {
      dispatch({ type: 'DELETE_TASK', payload: selectedTaskId });
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, selectedEdgeId, dispatch]);

  // Add new task
  const addTask = useCallback(() => {
    const questIds = state.preferences.focusQuestId
      ? [state.preferences.focusQuestId]
      : [];
    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: 'New Task',
        questIds,
        status: 'available',
        estimatedMinutes: 25,
        actualMinutes: null,
        isRecurring: false,
        notes: '',
      }
    });
  }, [state.preferences.focusQuestId, dispatch]);

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.id === 'background') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedTaskId(null);
      setSelectedEdgeId(null);
      if (edgeSourceId) setEdgeSourceId(null);
    }
  }, [pan, edgeSourceId]);

  const handleMouseMove = useCallback((e) => {
    // Track mouse for edge preview
    if (svgRef.current && edgeSourceId) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      });
    }

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart, edgeSourceId, pan, zoom]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      dispatch({ type: 'SET_MICRO_POSITION', payload: pan });
    }
  }, [isPanning, pan, dispatch]);

  // Zoom handlers
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    dispatch({ type: 'SET_MICRO_ZOOM', payload: newZoom });
  }, [zoom, dispatch]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, 0.3);
    setZoom(newZoom);
    dispatch({ type: 'SET_MICRO_ZOOM', payload: newZoom });
  }, [zoom, dispatch]);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    dispatch({ type: 'SET_MICRO_POSITION', payload: { x: 0, y: 0 } });
    dispatch({ type: 'SET_MICRO_ZOOM', payload: 1 });
  }, [dispatch]);

  // Get edge preview start position
  const edgePreviewStart = edgeSourceId ? positions.get(edgeSourceId) : null;
  const previewStartPos = edgePreviewStart ? {
    x: edgePreviewStart.x + LAYOUT.NODE_WIDTH,
    y: edgePreviewStart.y + LAYOUT.NODE_HEIGHT / 2
  } : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: COLORS.bgVoid,
    }}>
      {/* Toolbar */}
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
          color: COLORS.textPrimary,
        }}>
          {focusedQuest ? focusedQuest.title : 'All Tasks'}
        </h2>
        <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
          ({visibleTasks.length} tasks)
        </span>

        <div style={{ flex: 1 }} />

        {/* Edge creation mode indicator */}
        {edgeSourceId && (
          <span style={{
            padding: '4px 12px',
            borderRadius: '4px',
            background: COLORS.accentSecondary + '20',
            color: COLORS.accentSecondary,
            fontSize: '12px',
          }}>
            Click target task to create dependency
            <button
              onClick={cancelEdgeCreation}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                background: 'transparent',
                border: 'none',
                color: COLORS.textMuted,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </span>
        )}

        {/* Action buttons */}
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
          Task
        </button>

        {selectedTaskId && !edgeSourceId && (
          <button
            onClick={startEdgeCreation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.accentSecondary}`,
              borderRadius: '6px',
              color: COLORS.accentSecondary,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Link2 size={16} />
            Add Dependency
          </button>
        )}

        {(selectedTaskId || selectedEdgeId) && (
          <button
            onClick={deleteSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.accentDanger}`,
              borderRadius: '6px',
              color: COLORS.accentDanger,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {selectedEdgeId ? <Link2Off size={16} /> : <Trash2 size={16} />}
            Delete
          </button>
        )}

        {/* Zoom controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px',
          padding: '4px',
          background: COLORS.bgElevated,
          borderRadius: '6px',
        }}>
          <button
            onClick={zoomOut}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: COLORS.textSecondary,
              cursor: 'pointer',
            }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', color: COLORS.textMuted, minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: COLORS.textSecondary,
              cursor: 'pointer',
            }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={resetView}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: COLORS.textSecondary,
              cursor: 'pointer',
            }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <svg
        ref={svgRef}
        style={{
          flex: 1,
          cursor: isPanning ? 'grabbing' : (edgeSourceId ? 'crosshair' : 'grab'),
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <EdgeDefs />

        {/* Background */}
        <rect
          id="background"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={COLORS.bgVoid}
        />

        {/* Transformed content */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges layer (behind nodes) */}
          {visibleEdges.map(edge => {
            const sourcePos = positions.get(edge.source);
            const targetPos = positions.get(edge.target);
            if (!sourcePos || !targetPos) return null;

            return (
              <DependencyEdge
                key={edge.id}
                edge={edge}
                sourcePos={sourcePos}
                targetPos={targetPos}
                isSelected={selectedEdgeId === edge.id}
                onClick={() => handleEdgeClick(edge.id)}
              />
            );
          })}

          {/* Edge preview while creating */}
          {edgeSourceId && previewStartPos && (
            <EdgePreview startPos={previewStartPos} endPos={mousePos} />
          )}

          {/* Nodes layer */}
          {visibleTasks.map(task => {
            const pos = positions.get(task.id);
            if (!pos) return null;

            const computedStatus = getComputedTaskStatus(task, state);

            return (
              <TaskNode
                key={task.id}
                task={task}
                computedStatus={computedStatus}
                position={pos}
                isSelected={selectedTaskId === task.id}
                isEdgeSource={edgeSourceId === task.id}
                onClick={() => handleTaskClick(task.id)}
                onDoubleClick={() => handleTaskDoubleClick(task)}
              />
            );
          })}
        </g>
      </svg>

      {/* Empty state */}
      {visibleTasks.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: COLORS.textMuted,
        }}>
          <p style={{ fontSize: '16px', marginBottom: '12px' }}>No tasks yet</p>
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
            Add First Task
          </button>
        </div>
      )}
    </div>
  );
}

export default MicroView;
