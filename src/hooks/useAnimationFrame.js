// src/hooks/useAnimationFrame.js
// Hook for continuous animation loops (game physics, rendering)

import { useRef, useEffect, useCallback } from 'react';

/**
 * useAnimationFrame - Runs a callback on every animation frame
 *
 * @param {Function} callback - Called every frame with deltaTime (ms)
 * @param {boolean} active - Whether animation is running (default true)
 *
 * @example
 * // Basic usage
 * useAnimationFrame((deltaTime) => {
 *   physicsStep(nodes, edges);
 *   setPositions(new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }])));
 * });
 *
 * @example
 * // Conditional animation
 * useAnimationFrame((deltaTime) => {
 *   updatePhysics(deltaTime);
 * }, isPhysicsActive);
 */
export function useAnimationFrame(callback, active = true) {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const callbackRef = useRef(callback);

  // Keep callback ref current without causing effect re-runs
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;

    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active]);
}

/**
 * useThrottledAnimationFrame - Like useAnimationFrame but with FPS cap
 *
 * @param {Function} callback - Called at target FPS
 * @param {number} targetFPS - Target frames per second (default 60)
 * @param {boolean} active - Whether animation is running
 */
export function useThrottledAnimationFrame(callback, targetFPS = 60, active = true) {
  const frameInterval = 1000 / targetFPS;
  const lastFrameRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useAnimationFrame((deltaTime) => {
    const now = performance.now();
    const elapsed = now - lastFrameRef.current;

    if (elapsed >= frameInterval) {
      lastFrameRef.current = now - (elapsed % frameInterval);
      callbackRef.current(elapsed);
    }
  }, active);
}

export default useAnimationFrame;
