# Phase 4: VR Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable WebXR support for Pico 4 Ultra with controller and hand tracking, VR-optimized UI panels, and 72fps+ performance for full immersive task management experience.

**Architecture:** Phase 4 wraps the existing OrreryCanvas with XR context from @react-three/xr. The camera system from Phase 2 yields control to VR headset tracking when XR session activates. TaskSphere gains VR-specific interaction handlers via useXREvent. New VRPanel components provide 3D UI elements that face the user. Performance optimizations target 72fps+ by reducing draw calls and simplifying shaders when in VR mode.

**Tech Stack:**
- `@react-three/xr` ^5.x - WebXR integration for React Three Fiber
- Existing OrreryCanvas, TaskSphere, DependencyTube, CosmicParticles from Phases 1-3
- WebXR Device API (browser-native)
- Target Platform: Pico 4 Ultra (WebXR browser)

**Depends On:**
- Phase 2: Depth & Camera (camera system, OrbitControls, Z-depth distribution)
- Phase 3: Organism Behavior (animations optimized for 60fps baseline)

---

## Phase 4A: WebXR Foundation

**Objective:** Install @react-three/xr and wrap OrreryCanvas with XR context, adding VR entry button and basic session management.
**Verification:**
- VR Button appears on compatible browsers
- Clicking VR Button initiates WebXR session
- Scene renders correctly inside VR headset
- Exiting VR returns to desktop view

### Task 4.1: Install @react-three/xr Dependency

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/package.json`

**Step 1: Install package**

Run:
```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm install @react-three/xr@^5
```

**Step 2: Verify installation**

Run: `npm ls @react-three/xr`
Expected: Package listed at version 5.x.x

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @react-three/xr for WebXR VR support"
```

---

### Task 4.2: Create VRButton Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/VRButton.jsx`

**Step 1: Write the VRButton component**

```jsx
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
```

**Step 2: Update three component exports**

Modify `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:

Add export:
```javascript
export { VRButton } from './VRButton';
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/VRButton.jsx src/components/three/index.js
git commit -m "feat(vr): add VRButton component for WebXR session entry

- Styled button with Orrery design system colors
- Requests hand-tracking and local-floor features
- Positioned at bottom center of viewport"
```

---

### Task 4.3: Wrap OrreryCanvas with XR Context

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/OrreryCanvas.jsx`

**Step 1: Add XR imports**

Add to existing imports:
```jsx
import { XR, Controllers, Hands } from '@react-three/xr';
```

**Step 2: Add XR state prop to component signature**

Update the component signature:
```jsx
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
```

**Step 3: Wrap children in XR context**

Replace the `{children}` line with conditional XR wrapper:
```jsx
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
```

**Step 4: Adjust bloom for VR compatibility**

VR needs lower bloom intensity for comfort. Update the Bloom component:
```jsx
<EffectComposer>
  <Bloom
    luminanceThreshold={0.2}
    luminanceSmoothing={0.9}
    intensity={0.6}  // Reduced from 0.8 for VR comfort
    mipmapBlur
  />
</EffectComposer>
```

**Step 5: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 6: Commit**

```bash
git add src/components/three/OrreryCanvas.jsx
git commit -m "feat(vr): wrap OrreryCanvas with XR context

- XR component wraps scene content
- Controllers component renders tracked controllers
- Hands component renders hand tracking
- Bloom intensity reduced for VR comfort
- vrEnabled prop for conditional XR support"
```

---

### Task 4.4: Add VRButton to MicroView3D

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Import VRButton**

Add to imports:
```jsx
import { OrreryCanvas, TaskSphere, DependencyTube, CosmicParticles, VRButton } from '@/components/three';
```

**Step 2: Add VRButton as sibling to OrreryCanvas**

Update the return statement to render VRButton outside the Canvas:
```jsx
return (
  <div
    className="micro-view-3d"
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
    }}
  >
    {/* VR Entry Button - must be outside Canvas */}
    <VRButton />

    <OrreryCanvas>
      {/* ... existing content ... */}
    </OrreryCanvas>
  </div>
);
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(vr): add VRButton to MicroView3D

- VR entry button renders outside Canvas
- Enables WebXR session initiation from 3D view"
```

---

## Phase 4B: VR Controller Interaction

**Objective:** Enable task selection and session actions via VR controllers using XR event hooks.
**Verification:**
- Controller ray intersects with TaskSpheres
- Trigger press selects task (like click)
- Double-trigger starts session on available tasks
- Controller vibration feedback on interaction

### Task 4.5: Add XR Event Handlers to TaskSphere

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/TaskSphere.jsx`

**Step 1: Add XR imports**

Add to existing imports:
```jsx
import { useXREvent, useHaptics } from '@react-three/xr';
```

**Step 2: Add XR interaction hooks inside component**

After the existing state declarations, add:
```jsx
// ─── VR Controller Interaction ──────────────────────────────
const haptics = useHaptics();
const lastSelectTimeRef = useRef(0);

// Handle VR controller "select" event (trigger press)
useXREvent('select', (event) => {
  // Check if this sphere was the target
  const intersection = event.intersection;
  if (intersection?.object === meshRef.current) {
    const now = Date.now();
    const timeSinceLastSelect = now - lastSelectTimeRef.current;

    // Haptic feedback
    haptics.pulse(0.5, 50);

    if (timeSinceLastSelect < 500) {
      // Double-select (like double-click)
      onDoubleClick?.(task);
      haptics.pulse(0.8, 100);
    } else {
      // Single select
      onSelect?.(task.id);
    }

    lastSelectTimeRef.current = now;
  }
});

// Handle VR controller hover
useXREvent('selectstart', (event) => {
  if (event.intersection?.object === meshRef.current) {
    setHovered(true);
    haptics.pulse(0.2, 20);
  }
});

useXREvent('selectend', (event) => {
  if (event.intersection?.object === meshRef.current) {
    setHovered(false);
  }
});
```

**Step 3: Make mesh interactive with XR**

Update the Sphere component to be XR-interactive by ensuring it's a valid intersection target. The mesh needs to be part of the interactive layer. Add to the Sphere component:
```jsx
<Sphere
  ref={meshRef}
  args={[SPHERE_RADIUS, 32, 32]}
  onClick={(e) => {
    e.stopPropagation();
    onSelect?.(task.id);
  }}
  onDoubleClick={(e) => {
    e.stopPropagation();
    onDoubleClick?.(task);
  }}
  onPointerOver={(e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }}
  onPointerOut={() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }}
  // VR interaction layer
  layers={1}
>
```

**Step 4: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 5: Commit**

```bash
git add src/components/three/TaskSphere.jsx
git commit -m "feat(vr): add XR controller interaction to TaskSphere

- useXREvent hooks for select/selectstart/selectend
- Haptic feedback on interaction
- Double-select detection (500ms window)
- VR hover state management"
```

---

### Task 4.6: Create VR Interaction Manager

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/VRInteractionManager.jsx`

**Step 1: Write VR interaction manager for global VR state**

```jsx
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
```

**Step 2: Update exports**

Add to `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:
```javascript
export { VRInteractionManager, useVRState } from './VRInteractionManager';
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/VRInteractionManager.jsx src/components/three/index.js
git commit -m "feat(vr): add VRInteractionManager for VR state

- VRContext provides isInVR, hasControllers, hasHands
- useVRState hook for child component access
- Controller presence tracking"
```

---

### Task 4.7: Integrate VRInteractionManager in OrreryCanvas

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/OrreryCanvas.jsx`

**Step 1: Import VRInteractionManager**

Add to imports:
```jsx
import { VRInteractionManager } from './VRInteractionManager';
```

**Step 2: Wrap XR content with VRInteractionManager**

Update the XR wrapper section:
```jsx
{vrEnabled ? (
  <XR>
    <VRInteractionManager>
      <Controllers />
      <Hands />
      {children}
    </VRInteractionManager>
  </XR>
) : (
  children
)}
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/OrreryCanvas.jsx
git commit -m "feat(vr): integrate VRInteractionManager in OrreryCanvas

- VRInteractionManager wraps XR content
- VR state accessible via useVRState hook throughout scene"
```

---

## Phase 4C: VR UI Panels

**Objective:** Create VR-optimized UI panels for task details that float in 3D space and face the user.
**Verification:**
- Task detail panel appears when task selected in VR
- Panel always faces the user (billboard behavior)
- Text is readable at VR scale
- Panel positioned at comfortable viewing distance

### Task 4.8: Create VRPanel Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/VRPanel.jsx`

**Step 1: Write VRPanel with billboard behavior**

```jsx
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
import * as THREE from 'three';
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
        font="/fonts/inter-medium.woff"
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
        font="/fonts/inter-regular.woff"
      >
        {content}
      </Text>
    </group>
  );
}

export default VRPanel;
```

**Step 2: Update exports**

Add to `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:
```javascript
export { VRPanel } from './VRPanel';
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/VRPanel.jsx src/components/three/index.js
git commit -m "feat(vr): add VRPanel component for VR UI

- Floating 3D panel with rounded box background
- Billboard effect (faces camera via useFrame)
- Title and content text with proper VR scale
- Uses Orrery design system colors"
```

---

### Task 4.9: Create VRTaskDetail Panel

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/VRTaskDetail.jsx`

**Step 1: Write task detail panel for VR**

```jsx
// =====================================================================
// components/three/VRTaskDetail.jsx
// VR Task Detail Panel - Shows task information when selected in VR
//
// Positioned offset from selected task
// Shows title, status, cognitive load, quest info
// =====================================================================

import { useMemo } from 'react';
import { VRPanel } from './VRPanel';
import { useVRState } from './VRInteractionManager';

const STATUS_LABELS = {
  locked: 'Locked',
  available: 'Ready to Start',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const COGNITIVE_LABELS = [
  'Light Focus',
  'Some Focus',
  'Moderate Focus',
  'Deep Focus',
  'Intense Focus',
];

/**
 * VRTaskDetail - Task information panel for VR mode
 *
 * @param {Object} props
 * @param {Object} props.task - Task data
 * @param {{x: number, y: number, z: number}} props.taskPosition - Task's world position
 * @param {Array} props.quests - Quest list for quest name lookup
 */
export function VRTaskDetail({ task, taskPosition, quests = [] }) {
  const { isInVR } = useVRState();

  // Only render in VR mode
  if (!isInVR) return null;

  // Position panel offset from task (to the right and slightly forward)
  const panelPosition = useMemo(() => ({
    x: taskPosition.x + 2.5,
    y: taskPosition.y,
    z: (taskPosition.z || 0) + 0.5,
  }), [taskPosition]);

  // Build content string
  const status = task.status || 'available';
  const cognitiveLoad = Math.min(5, Math.max(1, task.cognitiveLoad || 3));
  const questName = quests.find(q => q.id === task.questIds?.[0])?.title || 'No Quest';

  const content = [
    `Status: ${STATUS_LABELS[status]}`,
    `Focus: ${COGNITIVE_LABELS[cognitiveLoad - 1]}`,
    `Quest: ${questName}`,
    task.estimatedMinutes ? `Est: ${task.estimatedMinutes} min` : '',
  ].filter(Boolean).join('\n');

  return (
    <VRPanel
      position={panelPosition}
      title={task.title}
      content={content}
      width={2.5}
    />
  );
}

export default VRTaskDetail;
```

**Step 2: Update exports**

Add to `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:
```javascript
export { VRTaskDetail } from './VRTaskDetail';
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/VRTaskDetail.jsx src/components/three/index.js
git commit -m "feat(vr): add VRTaskDetail panel for task info in VR

- Shows task title, status, cognitive load, quest
- Positioned offset from selected task
- Only renders when in VR session
- Uses VRPanel for consistent styling"
```

---

### Task 4.10: Integrate VRTaskDetail in MicroView3D

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Import VRTaskDetail**

Add to imports:
```jsx
import { OrreryCanvas, TaskSphere, DependencyTube, CosmicParticles, VRButton, VRTaskDetail } from '@/components/three';
```

**Step 2: Add VRTaskDetail to render when task selected**

Inside OrreryCanvas, after the TaskSphere map, add:
```jsx
{/* VR Task Detail Panel - shows for selected task in VR */}
{selectedTaskId && (() => {
  const selectedTask = visibleTasks.find(t => t.id === selectedTaskId);
  if (!selectedTask) return null;
  const taskPos = getPosition(selectedTask);
  return (
    <VRTaskDetail
      task={{
        ...selectedTask,
        status: getComputedTaskStatus(selectedTask, state),
      }}
      taskPosition={taskPos}
      quests={questsWithColors}
    />
  );
})()}
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(vr): integrate VRTaskDetail in MicroView3D

- VRTaskDetail renders when task selected
- Shows task info panel in VR mode
- Passes task data and quest colors"
```

---

## Phase 4D: VR Performance Optimization

**Objective:** Optimize rendering for 72fps+ in VR by reducing draw calls, simplifying materials, and managing particle counts.
**Verification:**
- VR maintains smooth 72fps on Pico 4 Ultra
- No visual stuttering during head movement
- Interaction response feels immediate
- Bloom and particles scale appropriately

### Task 4.11: Create VR Performance Manager

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/VRPerformanceManager.jsx`

**Step 1: Write VR performance utilities**

```jsx
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
```

**Step 2: Update exports**

Add to `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:
```javascript
export { VRPerformanceManager, useVRPerformance } from './VRPerformanceManager';
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/VRPerformanceManager.jsx src/components/three/index.js
git commit -m "feat(vr): add VRPerformanceManager for VR optimization

- Reduces particle count in VR (100 -> 50)
- Reduces sphere segments in VR (32 -> 24)
- Limits visible nodes in VR (100 -> 60)
- useVRPerformance hook for component access"
```

---

### Task 4.12: Integrate VRPerformanceManager

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/OrreryCanvas.jsx`

**Step 1: Import VRPerformanceManager**

Add to imports:
```jsx
import { VRPerformanceManager } from './VRPerformanceManager';
```

**Step 2: Wrap content with VRPerformanceManager**

Update the XR section to include VRPerformanceManager:
```jsx
{vrEnabled ? (
  <XR>
    <VRPerformanceManager>
      <VRInteractionManager>
        <Controllers />
        <Hands />
        {children}
      </VRInteractionManager>
    </VRPerformanceManager>
  </XR>
) : (
  children
)}
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/components/three/OrreryCanvas.jsx
git commit -m "feat(vr): integrate VRPerformanceManager in OrreryCanvas

- Performance settings available via useVRPerformance
- Automatically adjusts based on VR session state"
```

---

### Task 4.13: Apply Performance Settings to CosmicParticles

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/CosmicParticles.jsx`

**Step 1: Import performance hook**

Add to imports:
```jsx
import { useVRPerformance } from './VRPerformanceManager';
```

**Step 2: Use VR particle count**

Update the component to use VR-aware particle count:
```jsx
export function CosmicParticles({
  count: propCount,
  focusPosition = null,
  sessionState = 'idle',
}) {
  const pointsRef = useRef();
  const { particleCount: vrParticleCount, isVR } = useVRPerformance();

  // Use VR-optimized count when in VR, otherwise prop or default
  const count = isVR ? vrParticleCount : (propCount || 100);

  // ... rest of component unchanged, but use `count` variable
```

**Step 3: Update particles useMemo to use count**

Ensure the particles useMemo depends on count:
```jsx
const particles = useMemo(() => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }
  return positions;
}, [count]);
```

**Step 4: Update useFrame loop to use count**

Ensure the animation loop uses the count variable.

**Step 5: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 6: Commit**

```bash
git add src/components/three/CosmicParticles.jsx
git commit -m "feat(vr): apply VR performance settings to CosmicParticles

- Uses VR-optimized particle count when in VR session
- Automatically reduces from 100 to 50 particles in VR"
```

---

### Task 4.14: Apply Performance Settings to TaskSphere

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/TaskSphere.jsx`

**Step 1: Import performance hook**

Add to imports:
```jsx
import { useVRPerformance } from './VRPerformanceManager';
```

**Step 2: Use VR-optimized sphere detail**

Inside the TaskSphere component, add:
```jsx
const { sphereDetail, isVR } = useVRPerformance();
```

**Step 3: Update Sphere args to use VR detail**

Update the main Sphere component:
```jsx
<Sphere
  ref={meshRef}
  args={[SPHERE_RADIUS, sphereDetail, sphereDetail]}
  // ... rest of props
>
```

**Step 4: Also update quest badge sphere**

```jsx
{primaryQuestId && (
  <Sphere
    args={[0.15, isVR ? 8 : 16, isVR ? 8 : 16]}
    position={[0, -SPHERE_RADIUS * 0.8, SPHERE_RADIUS * 0.3]}
  >
    {/* ... */}
  </Sphere>
)}
```

**Step 5: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 6: Commit**

```bash
git add src/components/three/TaskSphere.jsx
git commit -m "feat(vr): apply VR performance settings to TaskSphere

- Uses VR-optimized sphere segments (32 -> 24 in VR)
- Quest badge uses fewer segments in VR (16 -> 8)"
```

---

## Phase 4E: Integration and VR Verification

**Objective:** Full integration test with Pico 4 Ultra, verify all features work end-to-end, fix any issues.
**Verification:**
- VR Button appears on Pico 4 Ultra browser
- Scene renders correctly in VR headset
- Controller tracking works with TaskSphere selection
- Hand tracking works (if available on device)
- VRTaskDetail panel appears and is readable
- Performance maintains 72fps+ during normal usage
- Exit VR returns to desktop mode cleanly

### Task 4.15: Add VR Mode Indicator

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Add VR status indicator for desktop debugging**

Add after VRButton:
```jsx
{/* VR Status Indicator (desktop debugging) */}
<div
  style={{
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 12px',
    background: 'rgba(26, 28, 40, 0.9)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#a0aec0',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}
>
  <span style={{
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22d3ee',
    animation: 'pulse 2s infinite',
  }} />
  VR Ready
</div>
```

**Step 2: Commit**

```bash
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(vr): add VR status indicator for desktop debugging

- Shows VR Ready status in top-right corner
- Helps verify XR context is properly initialized"
```

---

### Task 4.16: Browser and VR Verification

**Step 1: Start development server**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run dev`

**Step 2: Desktop browser verification**

Open browser to localhost URL and verify:
- [ ] VR Button appears at bottom center (on WebXR-capable browser)
- [ ] VR Ready indicator shows in top-right
- [ ] 3D view renders normally without errors
- [ ] Console shows no XR-related errors

**Step 3: Pico 4 Ultra VR verification**

If Pico 4 Ultra is available:
- [ ] Navigate to dev server URL in Pico browser
- [ ] VR Button should be visible
- [ ] Tap VR Button to enter VR session
- [ ] Scene renders correctly in VR (both eyes)
- [ ] Head tracking moves viewpoint
- [ ] Controllers are visible and tracked
- [ ] Point controller at TaskSphere - highlight visible
- [ ] Trigger press selects task (haptic feedback)
- [ ] Double-trigger starts session on available task
- [ ] VRTaskDetail panel appears for selected task
- [ ] Panel text is readable at arm's length
- [ ] Exit VR button returns to desktop view
- [ ] Performance feels smooth (no judder)

**Step 4: Fix any issues discovered**

If issues found, create targeted fixes and commit.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(vr): Phase 4 complete - VR Integration

Phase 4 delivers:
- WebXR support via @react-three/xr
- VRButton for session entry
- Controller tracking with haptic feedback
- Hand tracking support (device-dependent)
- VRTaskDetail panel for task info in VR
- VRPanel billboard UI components
- VRPerformanceManager for 72fps+ optimization
- Reduced particle count and sphere detail in VR

Ready for epic completion verification."
```

---

## Epic Integration

### Dependencies

This feature depends on:

**Phase 2: Depth & Camera** (Wave 2) - REQUIRED inputs:
- `OrreryCanvas.jsx` with PerspectiveCamera that can be overridden by XR
- `OrbitControls` that can be disabled when VR session activates (XR auto-disables)
- `CameraController` patterns for potential VR focus mechanics
- Z-depth distribution providing meaningful 3D space for VR navigation
- Distance-based opacity that works in VR (no post-processing dependency)

**Phase 3: Organism Behavior** (Wave 2) - REQUIRED inputs:
- Animated TaskSphere components optimized for 60fps baseline (VR needs 72fps+)
- CosmicParticles with sessionState prop for VR-aware animations
- ReadinessMaterial shader compatible with VR rendering pipeline
- Cascade unlock animations that work in 3D space
- All animations using `useFrame` pattern (VR-compatible)

### Provides To

This feature provides to dependent features:

**Final Deliverable** (Epic completion)
- Full VR experience on Pico 4 Ultra
- WebXR session management
- Controller and hand tracking
- VR-optimized UI panels
- 72fps+ performance in VR

### Integration Verification

Before declaring epic complete:

- [ ] VRButton appears on WebXR-capable browsers
- [ ] Clicking VRButton initiates WebXR immersive-vr session
- [ ] Scene renders correctly in both eyes
- [ ] Head tracking controls camera view
- [ ] Controllers visible and tracked
- [ ] Controller ray intersects with TaskSpheres
- [ ] Trigger press selects task with haptic feedback
- [ ] Double-trigger starts session on available tasks
- [ ] VRTaskDetail panel appears for selected task
- [ ] Panel text readable at VR scale
- [ ] Hand tracking works (if device supports)
- [ ] Exit VR returns to desktop view cleanly
- [ ] Performance maintains 72fps+ during normal usage
- [ ] No visual judder during head movement
- [ ] Phase 3 animations (cascade unlock, particles) work in VR

### Handoff Criteria

Phase 4 success criteria (epic complete):

- [ ] All Phase 4 tasks completed and committed
- [ ] VR session entry/exit works without errors
- [ ] Controller interaction functional (select, double-select)
- [ ] VR UI panels readable and properly positioned
- [ ] Performance acceptable in VR (72fps+ target)
- [ ] No regressions in desktop 3D mode
- [ ] Tested on Pico 4 Ultra (or WebXR emulator if unavailable)

---

## Summary

| Phase | Tasks | Objective |
|-------|-------|-----------|
| 4A | 4.1-4.4 | WebXR Foundation (VRButton, XR wrapper) |
| 4B | 4.5-4.7 | VR Controller Interaction |
| 4C | 4.8-4.10 | VR UI Panels (VRPanel, VRTaskDetail) |
| 4D | 4.11-4.14 | VR Performance Optimization |
| 4E | 4.15-4.16 | Integration and VR Verification |

**Total Tasks:** 16
**Estimated Duration:** 4-5 days
**Critical Path:** 4.1 -> 4.3 -> 4.5 -> 4.8 -> 4.11 -> 4.16

**Commit Strategy:** One focused commit per task, final summary commit after verification.

---

## Platform-Specific Notes

### Pico 4 Ultra

- WebXR browser has good standards compliance
- More GPU headroom than Quest 2
- Supports hand tracking (enable in settings)
- Controllers have:
  - Trigger (select)
  - Grip
  - Thumbstick
  - A/B buttons (right) / X/Y buttons (left)
- Target framerate: 72fps (90fps supported but 72 is comfortable minimum)

### Testing Without VR Hardware

If Pico 4 Ultra unavailable:
- Chrome/Firefox WebXR emulator extension can simulate VR session
- Test basic VR entry/exit flow
- Verify XR context initializes without errors
- Real controller/hand testing requires actual hardware

---

## Rollback Strategy

If VR features cause issues:
- `vrEnabled={false}` on OrreryCanvas disables all XR functionality
- Desktop 3D mode remains fully functional
- VRButton hidden when vrEnabled is false
- All VR components check `isInVR` before rendering VR-specific UI
