import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
    fs: {
      strict: false,
    },
    // Agar kerak bo‘lsa, quyidagini ham qo‘shish mumkin:
    // historyApiFallback: true,
  },
});
