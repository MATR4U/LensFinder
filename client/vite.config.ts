import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, process.cwd(), '');
  const apiTarget = rootEnv.VITE_API_BASE_URL || `http://localhost:${rootEnv.PORT ?? '3001'}`;
  const forceOutage = rootEnv.VITE_FORCE_OUTAGE === '1' || rootEnv.VITE_FORCE_OUTAGE === 'true';
  return {
    plugins: [react()],
    build: {
      target: process.env.ESNEXT === 'true' ? 'esnext' : 'es2020',
      cssTarget: 'safari14',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const parts = id.split('node_modules/')[1].split('/');
              const pkg = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
              if (pkg === 'plotly.js-dist-min') return 'plotly';
              if (pkg === 'react' || pkg === 'react-dom') return 'react';
              return `vendor-${pkg.replace(/[@/]/g, '_')}`;
            }
          }
        }
      }
    },
    server: {
      host: rootEnv.HOST || '0.0.0.0',
      port: Number(rootEnv.CLIENT_PORT || 3000),
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },
        '/ready': {
          target: apiTarget,
          changeOrigin: true
        },
        '/favicon.ico': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    define: {
      'window.__FORCE_OUTAGE__': JSON.stringify(forceOutage)
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      globals: true,
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        lines: 50,
        functions: 50,
        statements: 50,
        branches: 40
      }
    }
  };
});


