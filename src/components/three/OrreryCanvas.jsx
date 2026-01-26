// ═══════════════════════════════════════════════════════════════
// components/three/OrreryCanvas.jsx
// Main 3D canvas for The Orrery - React Three Fiber wrapper
//
// Phase 1: Perspective camera at locked angle (depth visible)
// Phase 2: Add OrbitControls for navigation
// ═══════════════════════════════════════════════════════════════

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { XR, Controllers, Hands } from '@react-three/xr';
import { COLORS } from '@/constants';

/**
 * Main 3D canvas wrapper for The Orrery
 * Provides perspective camera, lighting, and post-processing
 * Phase 4: Wraps content in XR context for VR support
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 3D scene content
 * @param {boolean} props.vrEnabled - Whether to include XR wrapper (default: true)
 */
export function OrreryCanvas({ children, vrEnabled = true }) {
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
      {/* Perspective camera for 3D depth perception
          Phase 2: Now with OrbitControls for navigation */}
      <PerspectiveCamera
        makeDefault
        position={[0, -15, 40]}  // Slight downward angle
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Phase 2: OrbitControls for navigation
          Limits prevent disorientation while allowing exploration */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}        // Don't zoom too close
        maxDistance={150}       // Don't zoom too far
        minPolarAngle={Math.PI / 6}   // Limit downward angle (30 degrees from top)
        maxPolarAngle={Math.PI / 2.2} // Limit upward angle (can't go below horizon)
        enableDamping={true}    // Smooth camera movement
        dampingFactor={0.05}    // Gentle damping
        rotateSpeed={0.5}       // Slower rotation for precision
        panSpeed={0.5}          // Slower pan for precision
        zoomSpeed={0.8}         // Responsive zoom
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

      {/* Phase 4: XR wrapper for VR support
          When VR session is active, camera control transfers to headset
          Controllers and Hands render tracked input devices */}
      {vrEnabled ? (
        <XR>
          <Controllers />
          <Hands />
          {children}
        </XR>
      ) : (
        children
      )}

      {/* Post-processing for bioluminescent glow effect */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.6}  // Reduced from 0.8 for VR comfort
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

export default OrreryCanvas;
