// src/utils/forceLayout.js
// DAG-aware force-directed layout for tasks

const REPULSION = 5000;      // Node repulsion strength
const ATTRACTION = 0.01;     // Edge attraction (spring constant)
const DAMPING = 0.8;         // Velocity damping
const MIN_DISTANCE = 100;    // Minimum node separation
// LAYER_ATTRACTION removed - organic physics, no layer enforcement

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
 * Initialize nodes for layout with ORGANIC positioning
 * Position emerges from physics, not forced layers
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @param {{width: number, height: number}} bounds
 * @returns {Map<string, LayoutNode>}
 */
export function initializeNodes(tasks, edges, bounds) {
  const nodes = new Map();
  // Note: computeLayers() still used by computeLayout() for DAG analysis,
  // but no longer used for initial positioning

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
      // ORGANIC BLOOM: Random position within bounds
      // Physics will organize nodes based on connections, not forced layers
      const x = bounds.width * 0.2 + Math.random() * bounds.width * 0.6;
      const y = bounds.height * 0.2 + Math.random() * bounds.height * 0.6;

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

  // Layer constraint force REMOVED - organic physics, position emerges from connections

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
    repulsion = 2000,       // Node repulsion strength (Obsidian-like: strong)
    attraction = 0.03,      // Edge spring constant (gentler)
    damping = 0.85,         // Velocity damping
    centerGravity = 0.002,  // Pull toward center (gentler)
    collisionRadius = 120,  // Hard collision radius (node width + padding)
    linkDistance = 180,     // Ideal distance for connected nodes
    // DAG tree structure (mycelium)
    dagLayers = null,       // Map<nodeId, layerNumber> - pass to enable tree layout
    layerSpacing = 250,     // Horizontal spacing between layers
    layerStrength = 0.02,   // How strongly nodes are pulled to their layer (soft)
  } = config;

  // Initialize velocities if needed
  for (const node of nodes) {
    if (node.vx === undefined) node.vx = 0;
    if (node.vy === undefined) node.vy = 0;
  }

  // ═══════════════════════════════════════════════════════════════
  // REPULSION: All nodes push each other apart (many-body force)
  // Uses linear falloff for close nodes, inverse for far
  // ═══════════════════════════════════════════════════════════════
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      // Prevent division by zero - nudge apart if exactly overlapping
      if (dist < 1) {
        dx = (Math.random() - 0.5) * 2;
        dy = (Math.random() - 0.5) * 2;
        dist = 1;
      }

      // Force calculation: stronger when close, falls off with distance
      // But doesn't fall off as fast as inverse-square
      const force = repulsion / (dist * dist * 0.5 + 100);

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
      if (!b.pinned) { b.vx += fx; b.vy += fy; }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // COLLISION: Hard constraint - nodes cannot overlap
  // This is what Obsidian has that makes nodes "bounce" apart
  // ═══════════════════════════════════════════════════════════════
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist < collisionRadius) {
        // Nodes are overlapping - push them apart
        const overlap = collisionRadius - dist;
        const pushX = (dx / dist) * overlap * 0.5;
        const pushY = (dy / dist) * overlap * 0.5;

        if (!a.pinned) { a.x -= pushX; a.y -= pushY; }
        if (!b.pinned) { b.x += pushX; b.y += pushY; }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ATTRACTION: Connected nodes have an ideal distance
  // Pull together if too far, push apart if too close
  // ═══════════════════════════════════════════════════════════════
  for (const edge of edges) {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Spring force: pull toward linkDistance
    const displacement = dist - linkDistance;
    const force = displacement * attraction;

    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!source.pinned) { source.vx += fx; source.vy += fy; }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy; }
  }

  // ═══════════════════════════════════════════════════════════════
  // RADIAL BLOOM: Flowering DAG layout
  // Layer 0 (roots) at center, downstream layers radiate outward
  // Like a blooming flower or mycelium from center
  // ═══════════════════════════════════════════════════════════════
  if (dagLayers) {
    const maxLayer = Math.max(0, ...dagLayers.values());

    // Group nodes by layer for angular distribution
    const layerNodes = new Map();
    for (const node of nodes) {
      const layer = dagLayers.get(node.id);
      if (layer !== undefined) {
        if (!layerNodes.has(layer)) layerNodes.set(layer, []);
        layerNodes.get(layer).push(node);
      }
    }

    for (const node of nodes) {
      if (node.pinned) continue;
      const layer = dagLayers.get(node.id);
      if (layer === undefined) continue;

      // Radius: roots at center (small radius), outer layers further out
      const baseRadius = 80;  // Minimum radius for roots
      const targetRadius = baseRadius + layer * layerSpacing;

      // Calculate current radius from center (0,0)
      const currentRadius = Math.sqrt(node.x * node.x + node.y * node.y) || 1;

      // Pull toward target radius (radial force)
      const radialDiff = targetRadius - currentRadius;
      const radialForce = radialDiff * layerStrength;

      // Apply radial force (outward/inward from center)
      const nx = node.x / currentRadius;  // normalized direction
      const ny = node.y / currentRadius;
      node.vx += nx * radialForce;
      node.vy += ny * radialForce;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // EDGE DIRECTION BIAS: Ensure target is further from center
  // This reinforces the radial bloom flow direction
  // ═══════════════════════════════════════════════════════════════
  if (dagLayers) {
    for (const edge of edges) {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) continue;

      const sourceRadius = Math.sqrt(source.x * source.x + source.y * source.y);
      const targetRadius = Math.sqrt(target.x * target.x + target.y * target.y);

      // If target is closer to center than source, nudge them apart radially
      if (targetRadius < sourceRadius) {
        const nudge = 0.3;
        const sn = sourceRadius > 1 ? { x: source.x / sourceRadius, y: source.y / sourceRadius } : { x: 0, y: 0 };
        const tn = targetRadius > 1 ? { x: target.x / targetRadius, y: target.y / targetRadius } : { x: 1, y: 0 };

        if (!source.pinned) { source.vx -= sn.x * nudge; source.vy -= sn.y * nudge; }
        if (!target.pinned) { target.vx += tn.x * nudge; target.vy += tn.y * nudge; }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CENTER GRAVITY: Gentle pull toward center
  // For radial bloom, this keeps the whole structure centered
  // ═══════════════════════════════════════════════════════════════
  for (const node of nodes) {
    if (node.pinned) continue;
    // Pull both X and Y toward center (0,0 in physics space)
    node.vx -= node.x * centerGravity;
    node.vy -= node.y * centerGravity;
  }

  // ═══════════════════════════════════════════════════════════════
  // APPLY VELOCITIES with damping
  // ═══════════════════════════════════════════════════════════════
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
