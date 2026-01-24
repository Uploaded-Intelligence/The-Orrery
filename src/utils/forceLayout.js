// src/utils/forceLayout.js
// DAG layer computation for The Orrery
//
// NOTE: Physics simulation has been moved to d3PhysicsEngine.js (using d3-force)
// This file now only contains computeLayers() for DAG layer computation,
// which is still used for:
// 1. Radial DAG hints in d3-force physics
// 2. Task status computation (blocked vs available)

/**
 * Compute DAG layers using topological sort
 * Layer 0 = tasks with no dependencies (roots)
 * Layer N = tasks whose dependencies are all in layers < N
 *
 * Used for:
 * - Radial DAG hints in physics (roots center, downstream radiates out)
 * - Computing task availability (blocked until dependencies complete)
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
