import fs from 'fs';
import path from 'path';

// 1. The corrected content for vite.config.js
// WHY: The original config uses '__dirname' which is not defined in ES modules (type: "module" in package.json).
// This fix defines __dirname using path.resolve() to ensure the alias resolution works correctly.
const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Fix for __dirname in ES modules
const __dirname = path.resolve();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`;

// 2. The corrected content for src/main.jsx
// WHY: The app relies on a 'window.storage' API that existed in the generation environment but not locally.
// This patch adds a polyfill that maps 'window.storage' calls to the browser's native 'localStorage', preventing crash on load.
const mainJsxContent = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- Polyfill for window.storage (Local Testing Fix) ---
if (!window.storage) {
  window.storage = {
    get: async (key) => ({ value: localStorage.getItem(key) }),
    set: async (key, value) => localStorage.setItem(key, value),
  };
}
// -------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;

// Execution
try {
    fs.writeFileSync('vite.config.js', viteConfigContent);
    console.log('✅ Fixed vite.config.js (ES Module path resolution)');
    
    fs.writeFileSync('src/main.jsx', mainJsxContent);
    console.log('✅ Fixed src/main.jsx (window.storage polyfill)');
    
    console.log('\nSUCCESS! Environment bootstrapped for local execution.');
} catch (err) {
    console.error('CRITICAL ERROR: Failed to write bootstrap files:', err);
    process.exit(1);
}