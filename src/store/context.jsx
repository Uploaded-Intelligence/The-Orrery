// ═══════════════════════════════════════════════════════════════
// store/context.js
// React context for Orrery state management
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useReducer } from 'react';
import { orreryReducer } from './reducer.js';
import { INITIAL_STATE } from '@/constants';

/**
 * @type {React.Context<{state: import('@/types').OrreryState, dispatch: Function} | null>}
 */
const OrreryContext = createContext(null);

/**
 * Provider component for Orrery state
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function OrreryProvider({ children }) {
  const [state, dispatch] = useReducer(orreryReducer, INITIAL_STATE);

  return (
    <OrreryContext.Provider value={{ state, dispatch }}>
      {children}
    </OrreryContext.Provider>
  );
}

/**
 * Hook to access Orrery state and dispatch
 * @returns {{state: import('@/types').OrreryState, dispatch: Function}}
 */
export function useOrrery() {
  const context = useContext(OrreryContext);
  if (!context) {
    throw new Error('useOrrery must be used within OrreryProvider');
  }
  return context;
}

export { OrreryContext };
