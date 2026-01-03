import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- Polyfill for window.storage (Local Development Fix) ---
// The app was designed for an environment with window.storage API.
// This polyfill maps to browser's localStorage for local development.
if (!window.storage) {
  window.storage = {
    get: async (key) => ({ value: localStorage.getItem(key) }),
    set: async (key, value) => localStorage.setItem(key, value),
  };
}
// -----------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
