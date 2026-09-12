import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // Precaches the built app shell (JS/CSS/HTML/icons) so the page
    // itself loads with zero network — a service worker serves it from
    // cache and updates in the background on the next visit.
    //
    // This only covers the SHELL. It does NOT make your actual training
    // data (Supabase) or the exercise dataset (GitHub) available
    // offline — those still need a network call the first time, and
    // there's a separate, bigger piece of work to mirror that data
    // locally. See offlineQueue.js for the write-side half of that,
    // which already exists.
    VitePWA({
      registerType: "autoUpdate",
      // We already ship our own /public/manifest.json and link to it
      // by hand in index.html — tell the plugin not to generate one.
      manifest: false,
      includeAssets: ["icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      workbox: {
        // Precache every built asset so the app shell has no
        // network dependency after the first load.
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        runtimeCaching: [
          {
            // Google Fonts stylesheet: check network first, but fall
            // back to cache so a slow/offline connection doesn't
            // block the page render.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            // Actual font files rarely change — cache-first is safe
            // and saves a round trip on every load once cached.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
