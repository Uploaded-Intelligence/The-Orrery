// ═══════════════════════════════════════════════════════════════
// components/three/ReadinessMaterial.jsx
// Custom shader for readiness gradient visualization
//
// Shows "fill level" based on upstream dependency completion
// Gradient rises from bottom as more dependencies complete
// ═══════════════════════════════════════════════════════════════

import { useRef } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Vertex Shader ──────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Fragment Shader ────────────────────────────────────────
const fragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 glowColor;
  uniform float readiness;      // 0.0 - 1.0
  uniform float glowIntensity;
  uniform float time;
  uniform float opacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Calculate fill level based on readiness (bottom to top)
    // vPosition.y goes from -1 to 1 on sphere
    float normalizedY = (vPosition.y + 1.0) / 2.0; // 0 at bottom, 1 at top
    float fillLevel = readiness;

    // Soft edge for the fill gradient
    float fillEdge = smoothstep(fillLevel - 0.1, fillLevel + 0.1, normalizedY);

    // Base color below fill, glow color at/above fill
    vec3 color = mix(glowColor, baseColor, fillEdge);

    // Emissive glow based on readiness and fill position
    float emissiveStrength = glowIntensity * (1.0 - fillEdge) * readiness;

    // Subtle pulse animation
    float pulse = 1.0 + sin(time * 2.0) * 0.05 * readiness;
    emissiveStrength *= pulse;

    // Rim lighting for 3D depth
    float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    rim = pow(rim, 2.0) * 0.3;

    // Final color with emission
    vec3 finalColor = color + glowColor * emissiveStrength + vec3(rim);

    gl_FragColor = vec4(finalColor, opacity);
  }
`;

// ─── Create Shader Material ─────────────────────────────────
const ReadinessShaderMaterial = shaderMaterial(
  {
    baseColor: new THREE.Color('#3d4255'),
    glowColor: new THREE.Color('#7c3aed'),
    readiness: 0.0,
    glowIntensity: 0.5,
    time: 0,
    opacity: 1.0,
  },
  vertexShader,
  fragmentShader
);

// Extend Three.js with our custom material
extend({ ReadinessShaderMaterial });

/**
 * ReadinessMaterial - Wrapper component for readiness shader
 *
 * @param {Object} props
 * @param {string} props.baseColor - Base sphere color (hex)
 * @param {string} props.glowColor - Glow/emissive color (hex)
 * @param {number} props.readiness - Fill level 0-1 (0% to 100% ready)
 * @param {number} props.glowIntensity - Emissive intensity multiplier
 * @param {number} props.opacity - Material opacity
 */
export function ReadinessMaterial({
  baseColor = '#3d4255',
  glowColor = '#7c3aed',
  readiness = 0,
  glowIntensity = 0.5,
  opacity = 1.0,
}) {
  const materialRef = useRef();

  // Animate time uniform for pulse effect
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <readinessShaderMaterial
      ref={materialRef}
      baseColor={new THREE.Color(baseColor)}
      glowColor={new THREE.Color(glowColor)}
      readiness={readiness}
      glowIntensity={glowIntensity}
      opacity={opacity}
      transparent={opacity < 1}
      side={THREE.FrontSide}
    />
  );
}

export default ReadinessMaterial;
