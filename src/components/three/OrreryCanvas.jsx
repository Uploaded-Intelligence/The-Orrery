// ═══════════════════════════════════════════════════════════════
// components/three/OrreryCanvas.jsx
// Main 3D canvas for The Orrery - React Three Fiber wrapper
//
// Phase 1: Perspective camera at locked angle (depth visible)
// Phase 2: Add OrbitControls for navigation
// ═══════════════════════════════════════════════════════════════

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { COLORS } from '@/constants';

/**
 * Main 3D canvas wrapper for The Orrery
 * Provides perspective camera, lighting, and post-processing
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 3D scene content
 */
export function OrreryCanvas({ children }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]} // Retina support, capped at 2x for performance
      style={{ background: COLORS.bgVoid }}
    >
      {/* Phase 1: Perspective camera at LOCKED angle
          Position creates slight downward angle for depth perception
          No orbit controls yet - camera is fixed but shows dimensionality */}
      <PerspectiveCamera
        makeDefault
        position={[0, -15, 40]}  // Slight downward angle
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.3} />

      {/* Point light for depth cues and highlights */}
      <pointLight
        position={[0, 0, 50]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Secondary point light for rim lighting effect */}
      <pointLight
        position={[-30, 20, -20]}
        intensity={0.3}
        color={COLORS.accentPrimary}
      />

      {children}

      {/* Post-processing for bioluminescent glow effect */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

export default OrreryCanvas;
