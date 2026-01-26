// =====================================================================
// components/three/VRButton.jsx
// VR Session Entry Button - Renders outside Canvas
//
// Uses @react-three/xr's VRButton but with custom styling
// Only visible on WebXR-capable browsers
// =====================================================================

import { VRButton as XRVRButton } from '@react-three/xr';
import { COLORS } from '@/constants';

/**
 * VRButton - Entry point for VR mode
 * Renders a styled button that initiates WebXR immersive-vr session
 *
 * Must be rendered OUTSIDE the Canvas (sibling, not child)
 */
export function VRButton() {
  return (
    <XRVRButton
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        background: COLORS.accentPrimary,
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: `0 4px 16px ${COLORS.accentPrimary}40`,
        transition: 'all 0.2s ease',
      }}
      sessionInit={{
        optionalFeatures: [
          'local-floor',
          'bounded-floor',
          'hand-tracking',
          'layers',
        ],
      }}
    />
  );
}

export default VRButton;
