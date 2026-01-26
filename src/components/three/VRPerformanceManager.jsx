// =====================================================================
// components/three/VRPerformanceManager.jsx
// VR Performance Manager - Optimizes rendering for VR framerates
//
// VR requires 72fps+ for comfort
// Reduces complexity when in VR session
// =====================================================================

import { createContext, useContext, useMemo } from 'react';
import { useXR } from '@react-three/xr';

const VRPerfContext = createContext({
  isVR: false,
  particleCount: 100,
  sphereDetail: 32,
  enableBloom: true,
  maxVisibleNodes: 100,
  lodDistance: 50,
});

// VR-optimized settings
const VR_SETTINGS = {
  particleCount: 50,       // Reduce from 100
  sphereDetail: 24,        // Reduce from 32 segments
  enableBloom: true,       // Keep bloom but intensity reduced in OrreryCanvas
  maxVisibleNodes: 60,     // Limit visible nodes in VR
  lodDistance: 40,         // Start LOD sooner in VR
};

// Desktop settings
const DESKTOP_SETTINGS = {
  particleCount: 100,
  sphereDetail: 32,
  enableBloom: true,
  maxVisibleNodes: 100,
  lodDistance: 50,
};

/**
 * VRPerformanceManager - Provides performance settings based on VR state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function VRPerformanceManager({ children }) {
  const { isPresenting } = useXR();

  const perfSettings = useMemo(() => ({
    isVR: isPresenting,
    ...(isPresenting ? VR_SETTINGS : DESKTOP_SETTINGS),
  }), [isPresenting]);

  return (
    <VRPerfContext.Provider value={perfSettings}>
      {children}
    </VRPerfContext.Provider>
  );
}

/**
 * Hook to access VR performance settings
 */
export function useVRPerformance() {
  return useContext(VRPerfContext);
}

export default VRPerformanceManager;
