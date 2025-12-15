// ═══════════════════════════════════════════════════════════════
// utils/layout.js
// DAG auto-layout algorithm for Micro View
// ═══════════════════════════════════════════════════════════════

/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

// Layout constants
export const LAYOUT = {
  COLUMN_WIDTH: 250,
  ROW_HEIGHT: 100,
  NODE_WIDTH: 180,
  NODE_HEIGHT: 60,
  PADDING: 40,
};

/**
 * Calculate depth for a task (longest path from any root)
 * @param {string} taskId
 * @param {import('@/types').Edge[]} edges
 * @param {Set<string>} visited - cycle detection
 * @returns {number}
 */
function getDepth(taskId, edges, visited = new Set()) {
  if (visited.has(taskId)) return 0; // cycle protection
  visited.add(taskId);

  const incoming = edges.filter(e => e.target === taskId);
  if (incoming.length === 0) return 0;

  return 1 + Math.max(...incoming.map(e => getDepth(e.source, edges, new Set(visited))));
}

/**
 * Auto-layout tasks in a DAG structure
 * Upstream tasks (dependencies) appear on left, downstream on right
 *
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @returns {Map<string, Position>}
 */
export function autoLayoutDAG(tasks, edges) {
  const positions = new Map();

  if (tasks.length === 0) return positions;

  // 1. Calculate depth for each task (longest path from root)
  const depths = new Map();
  tasks.forEach(t => depths.set(t.id, getDepth(t.id, edges)));

  // 2. Group tasks by depth (column)
  const columns = new Map();
  tasks.forEach(t => {
    const d = depths.get(t.id);
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d).push(t);
  });

  // 3. Assign positions - center each column vertically
  columns.forEach((tasksInColumn, depth) => {
    tasksInColumn.forEach((task, index) => {
      positions.set(task.id, {
        x: LAYOUT.PADDING + depth * LAYOUT.COLUMN_WIDTH,
        y: LAYOUT.PADDING + index * LAYOUT.ROW_HEIGHT - (tasksInColumn.length - 1) * LAYOUT.ROW_HEIGHT / 2 + 200,
      });
    });
  });

  return positions;
}

/**
 * Get layout positions, preferring manual positions over auto-layout
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @returns {Map<string, Position>}
 */
export function getLayoutPositions(tasks, edges) {
  const autoPositions = autoLayoutDAG(tasks, edges);
  const finalPositions = new Map();

  tasks.forEach(task => {
    // Use manual position if set, otherwise use auto-layout
    if (task.position) {
      finalPositions.set(task.id, task.position);
    } else {
      finalPositions.set(task.id, autoPositions.get(task.id) || { x: 0, y: 0 });
    }
  });

  return finalPositions;
}

/**
 * Calculate edge path points for drawing arrows
 * @param {Position} sourcePos
 * @param {Position} targetPos
 * @returns {{ start: Position, end: Position, midX: number }}
 */
export function getEdgePath(sourcePos, targetPos) {
  // Connect from right edge of source to left edge of target
  const start = {
    x: sourcePos.x + LAYOUT.NODE_WIDTH,
    y: sourcePos.y + LAYOUT.NODE_HEIGHT / 2,
  };
  const end = {
    x: targetPos.x,
    y: targetPos.y + LAYOUT.NODE_HEIGHT / 2,
  };
  const midX = (start.x + end.x) / 2;

  return { start, end, midX };
}

/**
 * Get canvas bounds from positions
 * @param {Map<string, Position>} positions
 * @returns {{ width: number, height: number, minX: number, minY: number }}
 */
export function getCanvasBounds(positions) {
  if (positions.size === 0) {
    return { width: 800, height: 600, minX: 0, minY: 0 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  positions.forEach(pos => {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + LAYOUT.NODE_WIDTH);
    maxY = Math.max(maxY, pos.y + LAYOUT.NODE_HEIGHT);
  });

  return {
    width: Math.max(800, maxX - minX + LAYOUT.PADDING * 2),
    height: Math.max(600, maxY - minY + LAYOUT.PADDING * 2),
    minX,
    minY,
  };
}
