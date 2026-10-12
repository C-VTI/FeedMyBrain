import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  // Fester Port: Der Fortschritt liegt im localStorage und ist an die Adresse gebunden.
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
