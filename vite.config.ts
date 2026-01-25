import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";

export default defineConfig({
  plugins: [
    react(), 
    nodePolyfills(), 
    tailwindcss(),
    wasm(),
    topLevelAwait()
  ],
  base: "/web_based_wallet",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})