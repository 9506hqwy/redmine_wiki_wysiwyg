import * as fs from 'fs'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'assets',
    rollupOptions: {
        external: [
            /@codemirror/,
            /@milkdown/,
            "codemirror",
            "unist-util-visit",
        ],
        output: {
            assetFileNames: (assetInfo) => {
                return `stylesheets/[name][extname]`;
            },
            chunkFileNames: (chunkInfo) => {
                return 'javascripts/[name]-[hash].digested.js';
            },
            paths: (id) => {
                const lockFile = fs.readFileSync("package-lock.json");
                const jsonFile = JSON.parse(lockFile);
                let pkg = jsonFile.packages[`node_modules/${id}`];
                if (pkg) {
                    return `https://cdn.jsdelivr.net/npm/${id}@${pkg.version}/+esm`;
                } else if (id.startsWith("@milkdown/")) {
                    const pkgNames = id.split("\/");
                    const pkgName = pkgNames[1];
                    const file = pkgNames.slice(2).join('/');

                    pkg = jsonFile.packages[`node_modules/@milkdown/${pkgName}`];
                    return `https://esm.run/@milkdown/${pkgName}@${pkg.version}/lib/${file}.js`;
                } else {
                    return id;
                }
            },
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
