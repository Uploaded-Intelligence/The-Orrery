// ═══════════════════════════════════════════════════════════════
// components/views/MicroView/MicroView.jsx
// Micro View - DAG of tasks with dependencies
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Link2, Link2Off, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Info } from 'lucide-react';
import { useOrrery } from '@/store';
import { COLORS, QUEST_COLORS } from '@/constants';
import { getLayoutPositions, getCanvasBounds, getComputedTaskStatus, LAYOUT } from '@/utils';
import { TaskNode, TaskActionBar } from '@/components/tasks';
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

  // Node dragging state
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedPositions, setDraggedPositions] = useState(new Map()); // Temp positions during drag

  // Local UI state for showing all tasks vs focused only
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Filter tasks - when focused, optionally show all with ghosting
  const visibleTasks = useMemo(() => {
    let tasks = state.tasks;

    // When focused AND not showing all, filter to focused quest only
    if (state.preferences.focusQuestId && !showAllTasks) {
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
  }, [state.tasks, state.preferences.focusQuestId, state.preferences.showActualOnly, showAllTasks, state]);

  // Determine if a task should be ghosted (not in focused quest when showing all)
  const isTaskGhosted = useCallback((task) => {
    if (!state.preferences.focusQuestId || !showAllTasks) return false;
    return !task.questIds.includes(state.preferences.focusQuestId);
  }, [state.preferences.focusQuestId, showAllTasks]);

  // Determine if an edge should be ghosted (either endpoint is ghosted)
  const isEdgeGhosted = useCallback((edge) => {
    if (!state.preferences.focusQuestId || !showAllTasks) return false;
    const sourceTask = state.tasks.find(t => t.id === edge.source);
    const targetTask = state.tasks.find(t => t.id === edge.target);
    if (!sourceTask || !targetTask) return false;
    return isTaskGhosted(sourceTask) || isTaskGhosted(targetTask);
  }, [state.preferences.focusQuestId, showAllTasks, state.tasks, isTaskGhosted]);

  // Filter edges to only show those between visible tasks
  const visibleEdges = useMemo(() => {
    const taskIds = new Set(visibleTasks.map(t => t.id));
    return state.edges.filter(e =>
      taskIds.has(e.source) && taskIds.has(e.target)
    );
  }, [state.edges, visibleTasks]);

  // Calculate layout positions (auto-layout for tasks without manual positions)
  const basePositions = useMemo(() =>
    getLayoutPositions(visibleTasks, visibleEdges),
    [visibleTasks, visibleEdges]
  );

  // Merge base positions with any in-progress drag positions
  const positions = useMemo(() => {
    const merged = new Map(basePositions);
    draggedPositions.forEach((pos, taskId) => {
      merged.set(taskId, pos);
    });
    return merged;
  }, [basePositions, draggedPositions]);

  // Calculate canvas bounds
  const bounds = useMemo(() =>
    getCanvasBounds(positions),
    [positions]
  );

  // Get quest name for header
  const focusedQuest = state.quests.find(q => q.id === state.preferences.focusQuestId);

  // Prepare quests with colors for TaskNode badges
  const questsWithColors = useMemo(() =>
    state.quests.map((q, i) => ({
      id: q.id,
      title: q.title,
      color: q.color || QUEST_COLORS[i % QUEST_COLORS.length],
    })),
    [state.quests]
  );

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

  // Handle node drag start
  const handleNodeDragStart = useCallback((taskId, e) => {
    // Don't start drag if we're in edge creation mode
    if (edgeSourceId) return;

    e.stopPropagation();
    const currentPos = positions.get(taskId);
    if (!currentPos) return;

    // Calculate offset from mouse to node origin
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingTaskId(taskId);
    setDragOffset({
      x: mouseX - currentPos.x,
      y: mouseY - currentPos.y,
    });
    setSelectedTaskId(taskId);
    setSelectedEdgeId(null);
  }, [edgeSourceId, positions, pan, zoom]);

  // Handle connector drag start (for edge creation)
  const handleConnectorDragStart = useCallback((taskId, e) => {
    e.stopPropagation();
    setEdgeSourceId(taskId);
    setSelectedTaskId(null);
    setSelectedEdgeId(null);

    // Set initial mouse position for edge preview
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    });
  }, [pan, zoom]);

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

  // Add new task (placed near center of current view)
  const addTask = useCallback(() => {
    const questIds = state.preferences.focusQuestId
      ? [state.preferences.focusQuestId]
      : [];

    // Calculate position near center of visible area
    const centerX = (-pan.x / zoom) + 400;
    const centerY = (-pan.y / zoom) + 300;

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
        position: { x: centerX, y: centerY },
      }
    });
  }, [state.preferences.focusQuestId, dispatch, pan, zoom]);

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
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    // Track mouse for edge preview
    if (edgeSourceId) {
      setMousePos({ x: mouseX, y: mouseY });
    }

    // Handle node dragging
    if (draggingTaskId) {
      const newPos = {
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y,
      };
      setDraggedPositions(prev => {
        const next = new Map(prev);
        next.set(draggingTaskId, newPos);
        return next;
      });
      return; // Don't pan while dragging
    }

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart, edgeSourceId, pan, zoom, draggingTaskId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    // End node dragging - persist position
    if (draggingTaskId) {
      const finalPos = draggedPositions.get(draggingTaskId);
      if (finalPos) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: {
            id: draggingTaskId,
            updates: { position: finalPos }
          }
        });
      }
      setDraggingTaskId(null);
      setDraggedPositions(new Map());
      return;
    }

    // End panning
    if (isPanning) {
      setIsPanning(false);
      dispatch({ type: 'SET_MICRO_POSITION', payload: pan });
    }
  }, [isPanning, pan, dispatch, draggingTaskId, draggedPositions]);

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

  // Scroll wheel zoom (zoom toward cursor position)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.3), 3);

    // Zoom toward cursor position
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Adjust pan to zoom toward cursor
      const newPan = {
        x: cursorX - (cursorX - pan.x) * (newZoom / zoom),
        y: cursorY - (cursorY - pan.y) * (newZoom / zoom),
      };

      setPan(newPan);
      setZoom(newZoom);
      dispatch({ type: 'SET_MICRO_POSITION', payload: newPan });
      dispatch({ type: 'SET_MICRO_ZOOM', payload: newZoom });
    }
  }, [zoom, pan, dispatch]);

  // Attach wheel listener with passive: false to allow preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Get edge preview start position
  const edgePreviewStart = edgeSourceId ? positions.get(edgeSourceId) : null;
  const previewStartPos = edgePreviewStart ? {
    x: edgePreviewStart.x + LAYOUT.NODE_WIDTH,
    y: edgePreviewStart.y + LAYOUT.NODE_HEIGHT / 2
  } : null;

  return (
    <div style={{
      position: 'relative',
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

        {/* Show All toggle (when quest is focused) */}
        {focusedQuest && (
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: showAllTasks ? COLORS.accentWarning + '20' : COLORS.bgElevated,
              border: `1px solid ${showAllTasks ? COLORS.accentWarning : COLORS.textMuted}40`,
              borderRadius: '6px',
              color: showAllTasks ? COLORS.accentWarning : COLORS.textSecondary,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            title={showAllTasks ? 'Show only focused quest tasks' : 'Show all tasks (ghost non-focused)'}
          >
            {showAllTasks ? <Eye size={16} /> : <EyeOff size={16} />}
            {showAllTasks ? 'All Visible' : 'Focused Only'}
          </button>
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
          cursor: draggingTaskId ? 'grabbing' : (isPanning ? 'grabbing' : (edgeSourceId ? 'crosshair' : 'grab')),
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
                isGhosted={isEdgeGhosted(edge)}
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
                isGhosted={isTaskGhosted(task)}
                isDragging={draggingTaskId === task.id}
                isCreatingEdge={!!edgeSourceId}
                quests={questsWithColors}
                onClick={() => handleTaskClick(task.id)}
                onDoubleClick={() => handleTaskDoubleClick(task)}
                onDragStart={(e) => handleNodeDragStart(task.id, e)}
                onConnectorDragStart={(e) => handleConnectorDragStart(task.id, e)}
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

      {/* Task Action Bar - floating, no context switching! */}
      {selectedTaskId && (
        <TaskActionBar
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

export default MicroView;
