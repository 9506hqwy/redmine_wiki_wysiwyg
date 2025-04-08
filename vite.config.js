import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'assets',
    rollupOptions: {
        output: {
            assetFileNames: (assetInfo) => {
                return `stylesheets/[name][extname]`;
            },
            chunkFileNames: (chunkInfo) => {
                return 'javascripts/[name]-[hash].js';
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
