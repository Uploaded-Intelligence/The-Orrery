// src/utils/forceLayout.js
// DAG-aware force-directed layout for tasks

const REPULSION = 5000;      // Node repulsion strength
const ATTRACTION = 0.01;     // Edge attraction (spring constant)
const DAMPING = 0.8;         // Velocity damping
const MIN_DISTANCE = 100;    // Minimum node separation
const LAYER_ATTRACTION = 0.05; // Horizontal layer constraint strength

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
 * Compute DAG layers using topological sort
 * Layer 0 = tasks with no dependencies (roots)
 * Layer N = tasks whose dependencies are all in layers < N
 *
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @returns {Map<string, number>} taskId → layer number
 */
export function computeLayers(tasks, edges) {
  const layers = new Map();
  const taskIds = new Set(tasks.map(t => t.id));

  // Build adjacency: for each task, what does it depend on?
  const dependsOn = new Map();
  for (const task of tasks) {
    dependsOn.set(task.id, []);
  }
  for (const edge of edges) {
    if (taskIds.has(edge.source) && taskIds.has(edge.target)) {
      // edge.source must complete before edge.target
      // So target depends on source
      dependsOn.get(edge.target)?.push(edge.source);
    }
  }

  // Iteratively assign layers
  let remaining = new Set(taskIds);
  let currentLayer = 0;

  while (remaining.size > 0) {
    const thisLayer = [];

    for (const taskId of remaining) {
      const deps = dependsOn.get(taskId) || [];
      // Can be placed in this layer if all dependencies already have layers
      const allDepsLayered = deps.every(depId => layers.has(depId));

      if (allDepsLayered) {
        thisLayer.push(taskId);
      }
    }

    // Handle cycles: if no progress, force remaining into current layer
    if (thisLayer.length === 0) {
      for (const taskId of remaining) {
        layers.set(taskId, currentLayer);
      }
      break;
    }

    for (const taskId of thisLayer) {
      layers.set(taskId, currentLayer);
      remaining.delete(taskId);
    }

    currentLayer++;
  }

  return layers;
}

/**
 * Initialize nodes for layout with layer-aware positioning
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @param {{width: number, height: number}} bounds
 * @returns {Map<string, LayoutNode>}
 */
export function initializeNodes(tasks, edges, bounds) {
  const nodes = new Map();
  const layers = computeLayers(tasks, edges);

  // Count tasks per layer for vertical distribution
  const layerCounts = new Map();
  const layerIndices = new Map();

  for (const [taskId, layer] of layers) {
    const count = layerCounts.get(layer) || 0;
    layerIndices.set(taskId, count);
    layerCounts.set(layer, count + 1);
  }

  const maxLayer = Math.max(0, ...layers.values());
  const layerWidth = bounds.width / (maxLayer + 2); // +2 for padding

  tasks.forEach((task) => {
    const hasPosition = task.position && (task.position.x !== 0 || task.position.y !== 0);

    if (hasPosition) {
      // Use stored position
      nodes.set(task.id, {
        id: task.id,
        x: task.position.x,
        y: task.position.y,
        vx: 0,
        vy: 0,
        pinned: true,
      });
    } else {
      // Position based on layer
      const layer = layers.get(task.id) || 0;
      const indexInLayer = layerIndices.get(task.id) || 0;
      const countInLayer = layerCounts.get(layer) || 1;

      // X based on layer (left to right)
      const x = layerWidth * (layer + 1);

      // Y distributed within layer (with small random offset)
      const layerHeight = bounds.height / (countInLayer + 1);
      const y = layerHeight * (indexInLayer + 1) + (Math.random() - 0.5) * 30;

      nodes.set(task.id, {
        id: task.id,
        x,
        y,
        vx: 0,
        vy: 0,
        pinned: false,
      });
    }
  });

  return nodes;
}

/**
 * Run one iteration of force-directed layout
 * @param {Map<string, LayoutNode>} nodes
 * @param {import('@/types').Edge[]} edges
 * @param {Map<string, number>} layers - taskId → layer number (optional)
 * @param {number} layerWidth - pixels per layer
 * @returns {boolean} True if still moving significantly
 */
export function stepLayout(nodes, edges, layers = null, layerWidth = 150) {
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
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const force = dist * ATTRACTION;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!source.pinned) { source.vx += fx; source.vy += fy; }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy; }
  }

  // Layer constraint force (gently pull toward layer X)
  if (layers) {
    for (const node of nodesArray) {
      if (node.pinned) continue;
      const layer = layers.get(node.id);
      if (layer !== undefined) {
        const targetX = layerWidth * (layer + 1);
        const dx = targetX - node.x;
        node.vx += dx * LAYER_ATTRACTION;
      }
    }
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
  const nodes = initializeNodes(tasks, edges, bounds);
  const layers = computeLayers(tasks, edges);
  const maxLayer = Math.max(0, ...layers.values());
  const layerWidth = bounds.width / (maxLayer + 2);

  for (let i = 0; i < maxIterations; i++) {
    const stillMoving = stepLayout(nodes, edges, layers, layerWidth);
    if (!stillMoving) break;
  }

  const positions = new Map();
  for (const [id, node] of nodes) {
    positions.set(id, { x: node.x, y: node.y });
  }
  return positions;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTINUOUS PHYSICS SIMULATION
// For real-time 60fps animation (game-like physics)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Single physics step for continuous animation
 * Call this every frame in requestAnimationFrame
 *
 * @param {Array} nodes - Array of {id, x, y, vx, vy, pinned}
 * @param {Array} edges - Array of {source, target}
 * @param {Object} config - Physics configuration
 * @returns {Array} Updated nodes array (mutates in place and returns)
 */
export function physicsStep(nodes, edges, config = {}) {
  const {
    repulsion = 800,       // Node repulsion (higher = more spread)
    attraction = 0.08,     // Edge spring constant
    damping = 0.85,        // Velocity damping (0.85 = smooth, 0.95 = sluggish)
    centerGravity = 0.005, // Pull toward center (keeps nodes on screen)
    minDistance = 80,      // Minimum separation before strong repulsion
  } = config;

  // Initialize velocities if needed
  for (const node of nodes) {
    if (node.vx === undefined) node.vx = 0;
    if (node.vy === undefined) node.vy = 0;
  }

  // Repulsion between all nodes (O(n²) - fine for <100 nodes)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Stronger repulsion when close
      const force = repulsion / (dist * dist);
      const clampedForce = Math.min(force, 50); // Prevent explosion

      const fx = (dx / dist) * clampedForce;
      const fy = (dy / dist) * clampedForce;

      if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
      if (!b.pinned) { b.vx += fx; b.vy += fy; }
    }
  }

  // Attraction along edges (spring force)
  for (const edge of edges) {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Spring force proportional to distance
    const fx = dx * attraction;
    const fy = dy * attraction;

    if (!source.pinned) { source.vx += fx; source.vy += fy; }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy; }
  }

  // Center gravity (keeps the graph on screen)
  for (const node of nodes) {
    if (node.pinned) continue;
    node.vx -= node.x * centerGravity;
    node.vy -= node.y * centerGravity;
  }

  // Apply velocities with damping
  for (const node of nodes) {
    if (node.pinned) continue;

    node.vx *= damping;
    node.vy *= damping;
    node.x += node.vx;
    node.y += node.vy;
  }

  return nodes;
}

/**
 * Check if physics has settled (low total velocity)
 * @param {Array} nodes
 * @param {number} threshold - Movement threshold (default 0.5)
 * @returns {boolean} True if settled
 */
export function isPhysicsSettled(nodes, threshold = 0.5) {
  let totalVelocity = 0;
  for (const node of nodes) {
    if (!node.pinned) {
      totalVelocity += Math.abs(node.vx || 0) + Math.abs(node.vy || 0);
    }
  }
  return totalVelocity < threshold;
}
