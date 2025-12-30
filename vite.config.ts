import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Esbuild options for minification (removes console/debugger in production)
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Use esbuild for minification (built-in, faster)
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Inline assets smaller than 4KB
    assetsInlineLimit: 4096,
    // Rollup options for chunk splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation library (large, separate chunk)
          'vendor-motion': ['framer-motion'],
          // Icons (tree-shakeable but still significant)
          'vendor-icons': ['lucide-react'],
          // Utilities
          'vendor-utils': ['clsx', 'tailwind-merge'],
        },
        // Asset file naming with hash for caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // Generate source maps for debugging (disabled for smaller size)
    sourcemap: false,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
  },
})
