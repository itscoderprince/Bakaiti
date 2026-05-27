import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Chunk grouping map: module id substring → chunk name
// Vite 8 uses rolldown which requires manualChunks as a function, not an object.
const CHUNK_MAP = [
  { test: /node_modules\/react-dom\//, name: "vendor-react" },
  { test: /node_modules\/react\//, name: "vendor-react" },
  { test: /node_modules\/react-router-dom\//, name: "vendor-router" },
  { test: /node_modules\/@reduxjs\//, name: "vendor-redux" },
  { test: /node_modules\/react-redux\//, name: "vendor-redux" },
  { test: /node_modules\/lucide-react\//, name: "vendor-ui" },
  { test: /node_modules\/class-variance-authority\//, name: "vendor-ui" },
  { test: /node_modules\/clsx\//, name: "vendor-ui" },
  { test: /node_modules\/tailwind-merge\//, name: "vendor-ui" },
  { test: /node_modules\/socket\.io-client\//, name: "vendor-socket" },
  { test: /node_modules\/engine\.io-client\//, name: "vendor-socket" },
  { test: /node_modules\/react-hook-form\//, name: "vendor-forms" },
  { test: /node_modules\/@hookform\//, name: "vendor-forms" },
  { test: /node_modules\/zod\//, name: "vendor-forms" },
  { test: /node_modules\/react-hot-toast\//, name: "vendor-toast" },
  { test: /node_modules\/axios\//, name: "vendor-axios" },
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Vite 8 / rolldown requires manualChunks as a function
        manualChunks(id) {
          for (const { test, name } of CHUNK_MAP) {
            if (test.test(id)) return name;
          }
        },
      },
    },
  },
});
