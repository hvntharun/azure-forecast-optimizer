import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite config optimized for Databricks static hosting
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer" 
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',

    base: './',
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts', 'plotly.js', 'react-plotly.js']
        }
      }
    }
  },
  // Ensure environment variables are available
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer']
  }
}));
