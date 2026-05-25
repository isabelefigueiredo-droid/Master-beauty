import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My Orbit",
        short_name: "My Orbit",
        description: "Seu dashboard de vida pessoal",
        theme_color: "#E63946",
        background_color: "#FFF8F0",
        display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
