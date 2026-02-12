import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico'],
  manifest: {
    name: 'Mi App',
    short_name: 'MiApp',
    description: 'Aplicación web',
    theme_color: '#4f46e5',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: '/icons/pwa-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/pwa-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
})

  ]
})
