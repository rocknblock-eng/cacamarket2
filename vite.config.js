import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Usamos caminhos relativos ("./") para que a build funcione
// tanto em hospedagem partilhada normal como dentro da app Android (Capacitor).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
