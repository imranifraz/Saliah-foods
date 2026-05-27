import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
      "/assets": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      png: false,
      jpeg: { quality: 82 },
      webp: { quality: 82 },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
          router: ["react-router", "react-router-dom"],
          vendor: ["react", "react-dom"],
        },
      },
    },
    cssMinify: true,
    minify: "esbuild",
  },
});
