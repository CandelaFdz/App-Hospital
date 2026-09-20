import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt", //para que no se auto-actualice, el Service Worker busca nuevas versiones solo ante interaccion de usuario
      manifest: {
        name: "Buscador de Protocolos Hospitalarios",
        short_name: "Protocolos",
        description: "Consulta offline de protocolos hospitalarios",
        theme_color: "#0b5cab",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/"
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    })
  ],
  base: '/App-Hospital/',
})
