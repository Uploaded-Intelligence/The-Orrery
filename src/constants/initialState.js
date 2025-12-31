// ═══════════════════════════════════════════════════════════════
// constants/initialState.js
// Initial state and storage key for The Orrery
// ═══════════════════════════════════════════════════════════════

export const STORAGE_KEY = 'orrery-state';

/** @type {import('@/types').OrreryState} */
export const INITIAL_STATE = {
  quests: [],
  tasks: [],
  edges: [],
  questVines: [],  // Quest-to-quest connections (celestial vines)
  activeSession: null,
  preferences: {
    currentView: 'macro',
    focusQuestId: null,
    showActualOnly: false,
    microViewPosition: { x: 0, y: 0 },
    microViewZoom: 1.0,
    macroViewPosition: { x: 0, y: 0 },
    macroViewZoom: 1.0,
  },
  lastSyncedAt: new Date().toISOString(),
};
