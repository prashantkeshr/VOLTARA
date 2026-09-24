import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { staticPages } from './build/static-pages';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // For GitHub Pages project sites set VITE_BASE=/<repo>/
  const base = env.VITE_BASE || '/';
  return {
    base,
    plugins: [react(), staticPages(env.VITE_SITE_URL ?? '')],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
