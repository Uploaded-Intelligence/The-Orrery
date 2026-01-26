// =====================================================================
// components/three/CameraController.jsx
// Camera management for The Orrery 3D view
//
// Provides:
// - Programmatic camera positioning
// - Focus-on-node animation
// - Camera state for distance-based effects
// =====================================================================

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CameraController - Manages camera state and provides focus capabilities
 *
 * @param {Object} props
 * @param {{x: number, y: number, z: number}|null} props.focusTarget - Position to focus on
 * @param {Function} props.onCameraUpdate - Called with camera position each frame
 */
export function CameraController({ focusTarget = null, onCameraUpdate = null }) {
  const { camera, controls } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  // Animate camera to focus target when it changes
  useEffect(() => {
    if (focusTarget && controls) {
      // Set animation target
      targetRef.current.set(focusTarget.x, focusTarget.y, focusTarget.z);
      isAnimating.current = true;
    }
  }, [focusTarget, controls]);

  // Animation loop for smooth camera focus
  useFrame(() => {
    if (isAnimating.current && controls) {
      // Smoothly interpolate controls target toward focus position
      controls.target.lerp(targetRef.current, 0.05);

      // Check if close enough to stop
      if (controls.target.distanceTo(targetRef.current) < 0.1) {
        controls.target.copy(targetRef.current);
        isAnimating.current = false;
      }

      controls.update();
    }

    // Report camera position for distance-based effects
    if (onCameraUpdate) {
      onCameraUpdate({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });
    }
  });

  return null; // Pure logic component, no visual output
}

/**
 * Hook to get camera distance to a point
 * Used by TaskSphere for distance-based opacity
 */
export function useCameraDistance(position) {
  const { camera } = useThree();
  const posVec = new THREE.Vector3(position.x, position.y, position.z || 0);
  return camera.position.distanceTo(posVec);
}

export default CameraController;
