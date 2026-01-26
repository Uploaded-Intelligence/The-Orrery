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
