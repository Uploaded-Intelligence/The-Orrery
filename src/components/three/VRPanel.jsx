// =====================================================================
// components/three/VRPanel.jsx
// VR UI Panel - Floating 3D panel with billboard behavior
//
// Renders text and UI elements in 3D space
// Always faces the camera for readability in VR
// =====================================================================

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { COLORS } from '@/constants';

/**
 * VRPanel - Floating UI panel for VR
 *
 * @param {Object} props
 * @param {{x: number, y: number, z: number}} props.position - World position
 * @param {string} props.title - Panel title
 * @param {string} props.content - Panel body text
 * @param {number} props.width - Panel width in world units (default 2)
 * @param {boolean} props.billboard - Face camera (default true)
 */
export function VRPanel({
  position,
  title,
  content,
  width = 2,
  billboard = true,
}) {
  const groupRef = useRef();
  const { camera } = useThree();

  // Billboard effect: always face camera
  useFrame(() => {
    if (billboard && groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const height = 1.2 + (content?.length || 0) * 0.01;
  const pos = [position.x, position.y, position.z || 0];

  return (
    <group ref={groupRef} position={pos}>
      {/* Panel background */}
      <RoundedBox
        args={[width, height, 0.05]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial
          color={COLORS.bgSurface}
          transparent
          opacity={0.95}
          roughness={0.8}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Title text */}
      <Text
        position={[0, height / 2 - 0.25, 0.03]}
        fontSize={0.12}
        color={COLORS.textPrimary}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.2}
      >
        {title}
      </Text>

      {/* Divider line */}
      <mesh position={[0, height / 2 - 0.45, 0.03]}>
        <planeGeometry args={[width - 0.3, 0.005]} />
        <meshBasicMaterial color={COLORS.accentPrimary} transparent opacity={0.5} />
      </mesh>

      {/* Content text */}
      <Text
        position={[0, -0.1, 0.03]}
        fontSize={0.08}
        color={COLORS.textSecondary}
        anchorX="center"
        anchorY="top"
        maxWidth={width - 0.3}
        lineHeight={1.4}
      >
        {content}
      </Text>
    </group>
  );
}

export default VRPanel;
