// src/utils/forceLayout.js
// Simple force-directed layout for tasks without manual positions

const REPULSION = 5000;    // Node repulsion strength
const ATTRACTION = 0.01;   // Edge attraction (spring constant)
const DAMPING = 0.8;       // Velocity damping
const MIN_DISTANCE = 100;  // Minimum node separation

/**
 * @typedef {Object} LayoutNode
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {number} vx - velocity x
 * @property {number} vy - velocity y
 * @property {boolean} pinned - If true, position is fixed
 */

/**
 * Initialize nodes for layout
 * @param {import('@/types').Task[]} tasks
 * @param {{width: number, height: number}} bounds
 * @returns {Map<string, LayoutNode>}
 */
export function initializeNodes(tasks, bounds) {
  const nodes = new Map();
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;

  tasks.forEach((task, i) => {
    const hasPosition = task.position && (task.position.x !== 0 || task.position.y !== 0);
    nodes.set(task.id, {
      id: task.id,
      x: hasPosition ? task.position.x : centerX + (Math.random() - 0.5) * 200,
      y: hasPosition ? task.position.y : centerY + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      pinned: hasPosition,
    });
  });

  return nodes;
}

/**
 * Run one iteration of force-directed layout
 * @param {Map<string, LayoutNode>} nodes
 * @param {import('@/types').Edge[]} edges
 * @returns {boolean} True if still moving significantly
 */
export function stepLayout(nodes, edges) {
  const nodesArray = Array.from(nodes.values());
  let totalMovement = 0;

  // Apply repulsion between all pairs
  for (let i = 0; i < nodesArray.length; i++) {
    for (let j = i + 1; j < nodesArray.length; j++) {
      const a = nodesArray[i];
      const b = nodesArray[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DISTANCE);

      const force = REPULSION / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
      if (!b.pinned) { b.vx += fx; b.vy += fy; }
    }
  }

  // Apply attraction along edges
  for (const edge of edges) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const force = dist * ATTRACTION;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!source.pinned) { source.vx += fx; source.vy += fy; }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy; }
  }

  // Apply velocities and damping
  for (const node of nodesArray) {
    if (node.pinned) continue;

    node.x += node.vx;
    node.y += node.vy;
    totalMovement += Math.abs(node.vx) + Math.abs(node.vy);

    node.vx *= DAMPING;
    node.vy *= DAMPING;
  }

  return totalMovement > 1;
}

/**
 * Run layout until settled
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @param {{width: number, height: number}} bounds
 * @param {number} maxIterations
 * @returns {Map<string, {x: number, y: number}>} Final positions
 */
export function computeLayout(tasks, edges, bounds, maxIterations = 100) {
  const nodes = initializeNodes(tasks, bounds);

  for (let i = 0; i < maxIterations; i++) {
    const stillMoving = stepLayout(nodes, edges);
    if (!stillMoving) break;
  }

  const positions = new Map();
  for (const [id, node] of nodes) {
    positions.set(id, { x: node.x, y: node.y });
  }
  return positions;
}
