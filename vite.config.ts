import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        fs: {
          allow: [
            path.resolve(__dirname, '..'),  // Allow workspace root
            path.resolve(__dirname),         // Allow project root
            path.join(__dirname, 'node_modules/cesium/Build/Cesium')
          ],
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        esbuildOptions: {
          define: {
            global: 'globalThis',
          },
        },
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              cesium: ['cesium'],
            },
          },
        },
      },
    };
});
