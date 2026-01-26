// =====================================================================
// components/three/VRInteractionManager.jsx
// VR Interaction Manager - Global VR session state and utilities
//
// Provides:
// - VR session detection
// - Controller/hand presence tracking
// - VR-specific interaction settings
// =====================================================================

import { createContext, useContext, useMemo } from 'react';
import { useXR, useController } from '@react-three/xr';

const VRContext = createContext({
  isInVR: false,
  hasControllers: false,
  hasHands: false,
  preferredHand: 'right',
});

/**
 * VRInteractionManager - Provides VR context to child components
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function VRInteractionManager({ children }) {
  const { isPresenting } = useXR();
  const leftController = useController('left');
  const rightController = useController('right');

  const vrState = useMemo(() => ({
    isInVR: isPresenting,
    hasControllers: !!(leftController || rightController),
    hasHands: false, // Will be true when hand tracking is active
    leftController,
    rightController,
    preferredHand: rightController ? 'right' : 'left',
  }), [isPresenting, leftController, rightController]);

  return (
    <VRContext.Provider value={vrState}>
      {children}
    </VRContext.Provider>
  );
}

/**
 * Hook to access VR state from any component
 */
export function useVRState() {
  return useContext(VRContext);
}

export default VRInteractionManager;
