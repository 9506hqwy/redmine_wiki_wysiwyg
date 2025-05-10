import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      "vue": "vue/dist/vue.runtime.esm-browser.prod.js",
    },
  },
  build: {
    outDir: 'assets',
    rollupOptions: {
        output: {
            assetFileNames: (assetInfo) => {
                return `stylesheets/[name][extname]`;
            },
            chunkFileNames: (chunkInfo) => {
                return 'javascripts/[name]-[hash].digested.js';
            }
        }
    },
    lib: {
        entry: ['src/wiki_wysiwyg.js'],
        formats: ['es'],
        fileName: 'javascripts/[name]',
        cssFileName: 'wiki_wysiwyg'
    },
  },
})
