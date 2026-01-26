// src/utils/d3PhysicsEngine.js
// d3-force physics engine wrapper for The Orrery
// Replaces custom physics with battle-tested d3-force (same as Obsidian uses)

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  forceRadial,
} from 'd3-force';

/**
 * Create a d3-force simulation configured for The Orrery
 *
 * Key architectural decisions:
 * - forceRadial is WEAK (0.03-0.08) - just a DAG layer hint, not a constraint
 * - forceCollide runs with iterations - nodes CANNOT overlap when settled
 * - Adaptive radius based on nodes per layer to prevent overcrowding
 *
 * @param {Array} nodes - [{id, x, y, layer, pinned}]
 * @param {Array} links - [{source, target}]
 * @param {Object} config - Physics configuration
 * @returns {Object} d3 simulation instance
 */
export function createSimulation(nodes, links, config = {}) {
  // User-tuned optimal defaults for good emergent structure
  const {
    repulsionStrength = -2700,   // User-tuned: stronger separation
    linkDistance = 160,          // Connected nodes cluster close
    linkStrength = 0.60,         // Strong links - connectivity drives layout
    collisionRadius = 130,       // User-tuned: larger to prevent overlap
    collisionIterations = 4,     // Fully resolve overlaps
    radialStrength = 0.03,       // User-tuned: slightly stronger DAG hint
    layerSpacing = 150,
    baseRadius = 100,
    centerStrength = 0.04,       // User-tuned: slightly stronger centering
  } = config;

  // Count nodes per layer for adaptive radius
  const layerCounts = new Map();
  nodes.forEach(n => {
    const layer = n.layer || 0;
    layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
  });

  // Adaptive radius function: expand based on node count
  // Prevents overcrowding that caused the original heap problem
  const getTargetRadius = (node) => {
    const layer = node.layer || 0;
    const nodesInLayer = layerCounts.get(layer) || 1;
    // Radius grows with sqrt of node count to maintain spacing
    // sqrt(n/3) means: 3 nodes = normal radius, 12 nodes = 2x radius, etc.
    const expansionFactor = Math.sqrt(nodesInLayer / 3);
    return baseRadius + layer * layerSpacing * Math.max(1, expansionFactor);
  };

  const simulation = forceSimulation(nodes)
    // Strong repulsion - all nodes push apart (Barnes-Hut optimized O(n log n))
    .force('charge', forceManyBody()
      .strength(repulsionStrength)
      .distanceMin(30)
      .distanceMax(800)
    )
    // Spring attraction - connected nodes pull together
    .force('link', forceLink(links)
      .id(d => d.id)
      .distance(linkDistance)
      .strength(linkStrength)
    )
    // HARD collision - nodes cannot overlap (runs last, multiple iterations)
    // This is what Obsidian has that makes it work - collision as CONSTRAINT not force
    .force('collide', forceCollide()
      .radius(collisionRadius)
      .iterations(collisionIterations)
    )
    // Gentle centering - keeps the graph from drifting
    // Note: forceCenter doesn't have .strength() - it's always a hard center
    // We use a weak forceX/forceY instead for gentler centering
    .force('centerX', forceX(0).strength(centerStrength))
    .force('centerY', forceY(0).strength(centerStrength))
    // GENTLE radial DAG hint - just a preference, not a constraint
    // Collision ALWAYS wins - nodes prefer their layer's radius but spread as needed
    .force('radial', forceRadial(getTargetRadius, 0, 0)
      .strength(radialStrength)
    )
    // Physics parameters tuned for EMERGENT STRUCTURE
    .alpha(1)           // Start with high energy for initial layout
    .alphaDecay(0.015)  // Slower decay = more time to find structure
    .alphaMin(0.001)    // Low minimum = fine settling
    .velocityDecay(0.35); // Medium friction = responsive but not bouncy

  // Apply pinning for nodes with manual positions (fx/fy locks position)
  nodes.forEach(node => {
    if (node.pinned) {
      node.fx = node.x;
      node.fy = node.y;
    }
  });

  return simulation;
}

/**
 * Start dragging a node - warms up simulation ONCE
 * Call this at drag START, not every move
 *
 * @param {Object} simulation - d3 simulation instance
 * @param {string} nodeId - ID of node being dragged
 */
export function startDrag(simulation, nodeId) {
  const node = simulation.nodes().find(n => n.id === nodeId);
  if (node) {
    node.fx = node.x;
    node.fy = node.y;
  }
  // alphaTarget keeps simulation warm WHILE dragging (not alpha!)
  // This is the key to smooth movement
  simulation.alphaTarget(0.3).restart();
}

/**
 * Update dragged node position
 * Call this on every mouse move - NO restart, just update position
 *
 * @param {Object} simulation - d3 simulation instance
 * @param {string} nodeId - ID of node being dragged
 * @param {number} x - New x position
 * @param {number} y - New y position
 */
export function updateDrag(simulation, nodeId, x, y) {
  const node = simulation.nodes().find(n => n.id === nodeId);
  if (node) {
    // Set both fixed position (fx/fy) AND actual position (x/y)
    // fx/fy tells d3-force "hold this node here"
    // x/y is what getPositions() reads for rendering
    // Without setting x/y, the node snaps back to its pre-drag position on release
    node.fx = x;
    node.fy = y;
    node.x = x;
    node.y = y;
  }
  // NO restart here! Simulation is already warm from startDrag
  // This is what makes it smooth
}

/**
 * End drag - let simulation cool down
 *
 * @param {Object} simulation - d3 simulation instance
 * @param {string} nodeId - ID of node to release
 * @param {boolean} keepPinned - If true, keep fx/fy set (user placed it manually)
 */
export function endDrag(simulation, nodeId, keepPinned = false) {
  const node = simulation.nodes().find(n => n.id === nodeId);
  if (node && !keepPinned) {
    node.fx = null;
    node.fy = null;
  }
  // Let simulation cool down naturally
  simulation.alphaTarget(0);
}

// Legacy aliases for compatibility
export const applyDrag = updateDrag;
export const releaseDrag = endDrag;

/**
 * Check if simulation has settled (low energy)
 *
 * @param {Object} simulation - d3 simulation instance
 * @returns {boolean} True if alpha is below threshold
 */
export function isSettled(simulation) {
  return simulation.alpha() < 0.01;
}

/**
 * Extract positions from simulation nodes
 *
 * @param {Object} simulation - d3 simulation instance
 * @returns {Map<string, {x: number, y: number}>} Node ID → position
 */
export function getPositions(simulation) {
  const positions = new Map();
  simulation.nodes().forEach(node => {
    positions.set(node.id, { x: node.x, y: node.y });
  });
  return positions;
}

/**
 * Update simulation with new nodes/links (for when tasks change)
 * Preserves positions of existing nodes
 *
 * @param {Object} simulation - Existing simulation
 * @param {Array} newNodes - New nodes array
 * @param {Array} newLinks - New links array
 * @param {Map} dagLayers - DAG layer map for radial hints
 * @param {Object} config - Physics config
 * @returns {Object} Updated simulation
 */
export function updateSimulation(simulation, newNodes, newLinks, dagLayers, config = {}) {
  const {
    layerSpacing = 150,
    baseRadius = 100,
    radialStrength = 0.05,
  } = config;

  // Preserve positions from old nodes
  const oldNodes = new Map();
  simulation.nodes().forEach(n => {
    oldNodes.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy, fx: n.fx, fy: n.fy });
  });

  // Merge old positions into new nodes
  newNodes.forEach(node => {
    const old = oldNodes.get(node.id);
    if (old) {
      node.x = old.x;
      node.y = old.y;
      node.vx = old.vx || 0;
      node.vy = old.vy || 0;
      if (old.fx !== null) node.fx = old.fx;
      if (old.fy !== null) node.fy = old.fy;
    }
  });

  // Recalculate layer counts for adaptive radius
  const layerCounts = new Map();
  newNodes.forEach(n => {
    const layer = n.layer || 0;
    layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
  });

  const getTargetRadius = (node) => {
    const layer = node.layer || 0;
    const nodesInLayer = layerCounts.get(layer) || 1;
    const expansionFactor = Math.sqrt(nodesInLayer / 3);
    return baseRadius + layer * layerSpacing * Math.max(1, expansionFactor);
  };

  // Update simulation
  simulation.nodes(newNodes);
  simulation.force('link').links(newLinks);
  simulation.force('radial').radius(getTargetRadius).strength(radialStrength);

  // Reheat for new layout
  simulation.alpha(0.5).restart();

  return simulation;
}
