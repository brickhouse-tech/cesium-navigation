import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CesiumNavigation',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'cesium-navigation.js' : 'cesium-navigation.umd.js'
    },
    rollupOptions: {
      external: ['cesium', '@turf/helpers'],
      output: {
        globals: {
          cesium: 'Cesium',
          '@turf/helpers': 'TurfHelpers'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return assetInfo.name || 'asset';
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
