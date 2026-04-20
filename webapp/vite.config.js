/**
 * vite.config.js — Vite Build Configuration
 *
 * Minimal config for a React SPA.
 * The @vitejs/plugin-react plugin handles JSX transformation and
 * React Fast Refresh during development.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite dev port — update if it conflicts with other projects
  },
});
