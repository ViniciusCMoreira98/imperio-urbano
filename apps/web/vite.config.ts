import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Mesma origem para o navegador: /api vai para o servidor Spring Boot local, sem CORS.
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
  // Pré-empacota tudo de uma vez: evita a reotimização no meio da sessão, que carrega duas cópias do React.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'three', '@react-three/fiber', '@react-three/drei', 'zustand', 'gsap'],
  },
});
