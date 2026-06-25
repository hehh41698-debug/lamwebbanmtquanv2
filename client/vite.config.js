import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins
  plugins: [
    vue({
      // Options for Vue
      template: {
        compilerOptions: {
          // Custom directives
          isCustomElement: (tag) => tag.startsWith('custom-')
        }
      }
    })
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@store': path.resolve(__dirname, './src/store'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/assets/css'),
    }
  },

  // Server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    cors: true,
    hmr: {
      overlay: true
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: [
            'vue',
            'vue-router',
            'pinia',
            'axios'
          ],
          ui: [
            'bootstrap',
            'bootstrap-icons',
            'vue3-carousel',
            'vue3-toastify',
            'vue-awesome-paginate'
          ],
          utils: [
            '@vuelidate/core',
            '@vuelidate/validators',
            '@vueuse/core'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true
  },

  // Preview configuration
  preview: {
    port: 4173,
    host: true,
    open: true
  },

  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/css/variables.scss";
        `
      }
    },
    postcss: {
      plugins: [
        // Add PostCSS plugins if needed
      ]
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'bootstrap',
      '@popperjs/core',
      'vue3-toastify',
      'vue3-carousel',
      '@vuelidate/core',
      '@vuelidate/validators'
    ],
    exclude: []
  },

  // Environmental variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __APP_NAME__: JSON.stringify(process.env.npm_package_name)
  },

  // Public directory
  publicDir: 'public',

  // Cache directory
  cacheDir: '.vite',

  // Clear screen
  clearScreen: true,

  // Log level
  logLevel: 'info',

  // Custom logger
  customLogger: {
    info: (msg) => console.log(`[Vite] ${msg}`),
    warn: (msg) => console.warn(`[Vite] ${msg}`),
    error: (msg) => console.error(`[Vite] ${msg}`)
  }
})