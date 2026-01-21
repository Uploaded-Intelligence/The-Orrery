import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Auto-detect Windows host IP when running in WSL2
function getTaskNotesUrl() {
  // Allow explicit override
  if (process.env.TASKNOTES_URL) {
    return process.env.TASKNOTES_URL;
  }

  // Check if running in WSL via environment variable
  if (process.env.WSL_DISTRO_NAME) {
    try {
      // Read Windows host IP from /etc/resolv.conf (WSL2 DNS points to Windows)
      const resolv = readFileSync('/etc/resolv.conf', 'utf8');
      const match = resolv.match(/nameserver\s+(\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        // resolv.conf DNS might not be the gateway, try route table via proc
        const route = readFileSync('/proc/net/route', 'utf8');
        const lines = route.split('\n');
        for (const line of lines) {
          const parts = line.split('\t');
          if (parts[1] === '00000000') { // Default route
            // Gateway is in hex, little-endian
            const hex = parts[2];
            const ip = [
              parseInt(hex.slice(6, 8), 16),
              parseInt(hex.slice(4, 6), 16),
              parseInt(hex.slice(2, 4), 16),
              parseInt(hex.slice(0, 2), 16),
            ].join('.');
            console.log(`[WSL2] Using Windows host: ${ip}`);
            return `http://${ip}:8080`;
          }
        }
      }
    } catch (e) {
      console.log('[WSL2] Failed to detect Windows host, using localhost');
    }
  }

  return 'http://localhost:8080';
}

const taskNotesUrl = getTaskNotesUrl();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'The Orrery - LifeRPG',
        short_name: 'Orrery',
        description: 'Your life as a playable game',
        theme_color: '#6366f1',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache API responses for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
        // Precache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      devOptions: {
        enabled: true, // Enable in dev for testing
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Proxy TaskNotes API to avoid CORS issues
    proxy: {
      '/api': {
        target: taskNotesUrl,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[TaskNotes Proxy] Error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[TaskNotes Proxy]', req.method, req.url);
          });
        },
      },
    },
  },
})
