// ═══════════════════════════════════════════════════════════════
// components/views/MicroView/MicroView.jsx
// Micro View - DAG of tasks with dependencies
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Link2, Link2Off, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Info, MessageSquare } from 'lucide-react';
import { useOrrery } from '@/store';
import { COLORS, QUEST_COLORS } from '@/constants';
import { getLayoutPositions, getCanvasBounds, getComputedTaskStatus, LAYOUT } from '@/utils';
import { computeLayout, physicsStep, isPhysicsSettled } from '@/utils/forceLayout';
import { useAnimationFrame } from '@/hooks';
import { TaskNode } from '@/components/tasks';
import { DependencyEdge, EdgePreview, EdgeDefs } from '@/components/edges';
import { PartyChatPanel } from '@/components/party';
import { ExpandedTaskEditor } from '@/components/panels';
import { ResetLayoutButton } from '@/components/ui/ResetLayoutButton';

/**
 * MicroView - Task DAG visualization
 * Shows tasks for the focused quest with dependency edges
 */
export function MicroView() {
  const { state, dispatch, api } = useOrrery();
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
  const justDraggedRef = useRef(false); // Track if we just finished dragging (prevents click after drag)
  const dragMovedRef = useRef(false); // Track if actual movement occurred during drag

  // Sync local pan/zoom with persisted preferences (e.g., after localStorage load)
  useEffect(() => {
    if (!isPanning && !draggingTaskId) {
      setPan(state.preferences.microViewPosition);
      setZoom(state.preferences.microViewZoom);
    }
  }, [state.preferences.microViewPosition, state.preferences.microViewZoom, isPanning, draggingTaskId]);

  // Local UI state for showing all tasks vs focused only
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Party chat panel state
  const [partyChatOpen, setPartyChatOpen] = useState(false);

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

  // ═══════════════════════════════════════════════════════════════
  // CONTINUOUS PHYSICS SIMULATION (60fps game-like)
  // ═══════════════════════════════════════════════════════════════

  // Physics node state (positions + velocities)
  const [physicsNodes, setPhysicsNodes] = useState([]);
  const [physicsSettled, setPhysicsSettled] = useState(false);

  // Initialize physics nodes when tasks change
  useEffect(() => {
    const bounds = { width: 800, height: 600 };
    const initialLayout = computeLayout(visibleTasks, visibleEdges, bounds);

    const nodes = visibleTasks.map(task => {
      const hasManualPos = task.position && (task.position.x !== 0 || task.position.y !== 0);
      const physicsPos = initialLayout.get(task.id) || { x: bounds.width / 2, y: bounds.height / 2 };

      return {
        id: task.id,
        x: hasManualPos ? task.position.x : physicsPos.x,
        y: hasManualPos ? task.position.y : physicsPos.y,
        vx: 0,
        vy: 0,
        pinned: hasManualPos, // Pinned if has manual position
      };
    });

    setPhysicsNodes(nodes);
    setPhysicsSettled(false);
  }, [visibleTasks.length, visibleEdges.length]); // Re-init when task/edge count changes

  // Run continuous physics simulation
  useAnimationFrame(() => {
    if (physicsSettled || draggingTaskId || physicsNodes.length === 0) return;

    // Run physics step
    const updatedNodes = physicsStep([...physicsNodes], visibleEdges, {
      repulsion: 800,
      attraction: 0.08,
      damping: 0.85,
      centerGravity: 0.005,
    });

    // Check if settled
    if (isPhysicsSettled(updatedNodes, 0.3)) {
      setPhysicsSettled(true);
    }

    setPhysicsNodes(updatedNodes);
  }, !physicsSettled && !draggingTaskId);

  // Convert physics nodes to positions Map
  const physicsPositions = useMemo(() => {
    const map = new Map();
    for (const node of physicsNodes) {
      map.set(node.id, { x: node.x, y: node.y });
    }
    return map;
  }, [physicsNodes]);

  // Merge physics positions with manual positions and drag positions
  const finalPositions = useMemo(() => {
    const merged = new Map(positions);

    // Overlay physics positions for unpinned tasks
    for (const node of physicsNodes) {
      if (!node.pinned) {
        merged.set(node.id, { x: node.x, y: node.y });
      }
    }

    // Overlay any active drag positions
    draggedPositions.forEach((pos, taskId) => {
      merged.set(taskId, pos);
    });

    return merged;
  }, [positions, physicsNodes, draggedPositions]);

  // Calculate canvas bounds
  const bounds = useMemo(() =>
    getCanvasBounds(finalPositions),
    [finalPositions]
  );

  // Get quest name for header
  const focusedQuest = state.quests.find(q => q.id === state.preferences.focusQuestId);

  // Prepare quests with colors for TaskNode badges
  const questsWithColors = useMemo(() =>
    state.quests.map((q, i) => ({
      id: q.id,
      title: q.title,
      color: q.themeColor || QUEST_COLORS[i % QUEST_COLORS.length],
    })),
    [state.quests]
  );

  // Handle task click - only select if NOT just dragged
  const handleTaskClick = useCallback((taskId) => {
    // Skip selection if we just finished dragging
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }

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
      // Click without drag = select and show editor
      setSelectedTaskId(taskId);
      setSelectedEdgeId(null);
    }
  }, [edgeSourceId, dispatch]);

  // Handle task double-click (start session or complete)
  const handleTaskDoubleClick = useCallback((task) => {
    const computedStatus = getComputedTaskStatus(task, state);
    if (computedStatus === 'available') {
      dispatch({
        type: 'START_SESSION',
        payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
      });
    } else if (computedStatus === 'in_progress') {
      api.completeTask(task.id).catch(e => console.error('Complete failed:', e));
    }
  }, [state, dispatch, api]);

  // Handle node drag start
  const handleNodeDragStart = useCallback((taskId, e) => {
    // Don't start drag if we're in edge creation mode
    if (edgeSourceId) return;

    e.stopPropagation();
    const currentPos = finalPositions.get(taskId);
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
    dragMovedRef.current = false; // Reset movement tracking
    // Don't select here - wait to see if it's a click or drag
    setSelectedEdgeId(null);
  }, [edgeSourceId, finalPositions, pan, zoom]);

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
      api.deleteTask(selectedTaskId).catch(e => console.error('Delete failed:', e));
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, selectedEdgeId, dispatch, api]);

  // Add new task (placed near center of current view, offset from existing)
  const addTask = useCallback(async () => {
    const questIds = state.preferences.focusQuestId
      ? [state.preferences.focusQuestId]
      : [];

    // Calculate position near center of visible area
    let centerX = (-pan.x / zoom) + 400;
    let centerY = (-pan.y / zoom) + 300;

    // Offset from existing tasks at same position to prevent stacking
    const OFFSET = 30;
    let attempts = 0;
    while (attempts < 20) {
      const collision = visibleTasks.some(t => {
        const taskPos = finalPositions.get(t.id);
        if (!taskPos) return false;
        const dx = Math.abs(taskPos.x - centerX);
        const dy = Math.abs(taskPos.y - centerY);
        return dx < LAYOUT.NODE_WIDTH && dy < LAYOUT.NODE_HEIGHT;
      });
      if (!collision) break;
      // Offset diagonally to avoid stacking
      centerX += OFFSET;
      centerY += OFFSET;
      attempts++;
    }

    // Create task via API (server-authoritative)
    try {
      const created = await api.createTask({
        title: 'New Task',
        questIds,
        status: 'available',
        estimatedMinutes: 25,
        actualMinutes: null,
        isRecurring: false,
        notes: '',
      });

      // Position is Orrery-local data - set after creation
      if (created?.id) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { id: created.id, updates: { position: { x: centerX, y: centerY } } }
        });
      }
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  }, [state.preferences.focusQuestId, api, dispatch, pan, zoom, visibleTasks, finalPositions]);

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
      dragMovedRef.current = true; // Movement occurred
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
    // End node dragging - persist position locally (Orrery-only data)
    if (draggingTaskId) {
      const finalPos = draggedPositions.get(draggingTaskId);
      if (finalPos && dragMovedRef.current) {
        // Position is view state, not task data - keep in local state only
        dispatch({
          type: 'UPDATE_TASK',
          payload: { id: draggingTaskId, updates: { position: finalPos } }
        });
        justDraggedRef.current = true; // Prevent click from selecting
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
  }, [isPanning, pan, dispatch, draggingTaskId, draggedPositions, api]);

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

  // ═══════════════════════════════════════════════════════════════
  // TOUCH EVENT HANDLERS (iOS/Mobile Support)
  // ═══════════════════════════════════════════════════════════════

  // Helper to get client coordinates from touch or mouse event
  const getEventCoords = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  }, []);

  // Touch start handler (for panning)
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      // Check if we're touching the background
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target === svgRef.current || target?.id === 'background') {
        setIsPanning(true);
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        setSelectedTaskId(null);
        setSelectedEdgeId(null);
        if (edgeSourceId) setEdgeSourceId(null);
      }
    }
  }, [pan, edgeSourceId]);

  // Touch move handler (for panning and node dragging)
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchX = (touch.clientX - rect.left - pan.x) / zoom;
    const touchY = (touch.clientY - rect.top - pan.y) / zoom;

    // Track position for edge preview
    if (edgeSourceId) {
      setMousePos({ x: touchX, y: touchY });
    }

    // Handle node dragging
    if (draggingTaskId) {
      e.preventDefault(); // Prevent scroll while dragging
      const newPos = {
        x: touchX - dragOffset.x,
        y: touchY - dragOffset.y,
      };
      dragMovedRef.current = true; // Movement occurred
      setDraggedPositions(prev => {
        const next = new Map(prev);
        next.set(draggingTaskId, newPos);
        return next;
      });
      return;
    }

    // Handle panning
    if (isPanning) {
      e.preventDefault(); // Prevent scroll while panning
      setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y });
    }
  }, [isPanning, panStart, edgeSourceId, pan, zoom, draggingTaskId, dragOffset]);

  // Touch end handler
  const handleTouchEnd = useCallback((e) => {
    // Handle edge creation completion on touch end
    if (edgeSourceId) {
      // Check if we're over any task (use last known mousePos from touch move)
      const touchX = mousePos.x;
      const touchY = mousePos.y;

      // Find task under touch position
      const targetTask = visibleTasks.find(task => {
        const taskPos = finalPositions.get(task.id);
        if (!taskPos || task.id === edgeSourceId) return false;

        // Check if touch is within task bounds (with padding for easier touch)
        const padding = 20;
        return touchX >= taskPos.x - padding &&
               touchX <= taskPos.x + LAYOUT.NODE_WIDTH + padding &&
               touchY >= taskPos.y - padding &&
               touchY <= taskPos.y + LAYOUT.NODE_HEIGHT + padding;
      });

      if (targetTask) {
        // Create the edge!
        dispatch({
          type: 'ADD_EDGE',
          payload: { source: edgeSourceId, target: targetTask.id }
        });
      }

      setEdgeSourceId(null);
      return;
    }

    // Handle node drag end
    if (draggingTaskId) {
      const finalPos = draggedPositions.get(draggingTaskId);
      if (finalPos && dragMovedRef.current) {
        // Position is view state, not task data - keep in local state only
        dispatch({
          type: 'UPDATE_TASK',
          payload: { id: draggingTaskId, updates: { position: finalPos } }
        });
        justDraggedRef.current = true;
      }
      setDraggingTaskId(null);
      setDraggedPositions(new Map());
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      dispatch({ type: 'SET_MICRO_POSITION', payload: pan });
    }
  }, [isPanning, pan, dispatch, draggingTaskId, draggedPositions, edgeSourceId, mousePos, visibleTasks, finalPositions, api]);

  // Node touch drag start (called from TaskNode)
  const handleNodeTouchStart = useCallback((taskId, e) => {
    if (edgeSourceId) return;
    if (!e.touches || e.touches.length !== 1) return;

    e.stopPropagation();
    const touch = e.touches[0];
    const currentPos = finalPositions.get(taskId);
    if (!currentPos) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touchX = (touch.clientX - rect.left - pan.x) / zoom;
    const touchY = (touch.clientY - rect.top - pan.y) / zoom;

    setDraggingTaskId(taskId);
    setDragOffset({
      x: touchX - currentPos.x,
      y: touchY - currentPos.y,
    });
    dragMovedRef.current = false; // Reset movement tracking
    setSelectedEdgeId(null);
  }, [edgeSourceId, finalPositions, pan, zoom]);

  // Connector touch drag start (for edge creation)
  const handleConnectorTouchStart = useCallback((taskId, e) => {
    if (!e.touches || e.touches.length !== 1) return;
    e.stopPropagation();
    setEdgeSourceId(taskId);
    setSelectedTaskId(null);
    setSelectedEdgeId(null);

    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: (touch.clientX - rect.left - pan.x) / zoom,
      y: (touch.clientY - rect.top - pan.y) / zoom
    });
  }, [pan, zoom]);

  // Attach wheel listener with passive: false to allow preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Attach touch listeners with passive: false for pan prevention
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      const options = { passive: false };
      svg.addEventListener('touchmove', handleTouchMove, options);
      return () => svg.removeEventListener('touchmove', handleTouchMove);
    }
  }, [handleTouchMove]);

  // Get edge preview start position
  const edgePreviewStart = edgeSourceId ? finalPositions.get(edgeSourceId) : null;
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
          color: focusedQuest ? focusedQuest.themeColor : COLORS.textPrimary,
        }}>
          {focusedQuest ? focusedQuest.title : 'All Tasks'}
        </h2>
        <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
          ({visibleTasks.length} tasks)
        </span>

        {/* Clear focus button - view all tasks */}
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
            × Clear Focus
          </button>
        )}

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
            Tap what this unlocks →
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

        {/* Party Chat button */}
        <button
          onClick={() => setPartyChatOpen(!partyChatOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: partyChatOpen ? COLORS.accentWarning + '20' : COLORS.bgElevated,
            border: `1px solid ${partyChatOpen ? COLORS.accentWarning : COLORS.textMuted}40`,
            borderRadius: '6px',
            color: partyChatOpen ? COLORS.accentWarning : COLORS.textSecondary,
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="Open Party Chat"
        >
          <MessageSquare size={16} />
          Party
        </button>

        {/* Layout reset */}
        <ResetLayoutButton />

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
            title="Link this task to what it unlocks"
          >
            <Link2 size={16} />
            Unlocks...
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
          touchAction: 'none', // Prevent default touch behaviors
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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
            const sourcePos = finalPositions.get(edge.source);
            const targetPos = finalPositions.get(edge.target);
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
            const pos = finalPositions.get(task.id);
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
                onTouchStart={(e) => handleNodeTouchStart(task.id, e)}
                onConnectorTouchStart={(e) => handleConnectorTouchStart(task.id, e)}
                // Contextual actions - appear AT the node
                onStartSession={() => dispatch({
                  type: 'START_SESSION',
                  payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
                })}
                onComplete={() => api.completeTask(task.id).catch(e => console.error('Complete failed:', e))}
                onReopen={() => api.updateTask(task.id, { status: 'available' })
                  .catch(e => console.error('Reopen failed:', e))}
                onDelete={() => {
                  api.deleteTask(task.id).catch(e => console.error('Delete failed:', e));
                  setSelectedTaskId(null);
                }}
                onUpdate={(updates) => api.updateTask(task.id, updates)
                  .catch(e => console.error('Update failed:', e))}
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

      {/* Actions now appear contextually AT the task node - game-style! */}

      {/* Party Chat Panel */}
      {partyChatOpen && (
        <PartyChatPanel onClose={() => setPartyChatOpen(false)} />
      )}

      {/* Expanded Task Editor - appears when task is selected */}
      {selectedTaskId && (() => {
        const selectedTask = state.tasks.find(t => t.id === selectedTaskId);
        const taskPos = finalPositions.get(selectedTaskId);
        if (!selectedTask || !taskPos) return null;

        // Convert SVG coordinates to screen coordinates
        const screenX = taskPos.x * zoom + pan.x;
        const screenY = taskPos.y * zoom + pan.y;

        return (
          <ExpandedTaskEditor
            task={selectedTask}
            position={{ x: screenX, y: screenY }}
            onClose={() => setSelectedTaskId(null)}
          />
        );
      })()}
    </div>
  );
}

export default MicroView;
