import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    publicDir: false,
    build: {
        outDir: 'static/frontend',
        rollupOptions: {
            input: './src/index.tsx',
            output: {
                entryFileNames: '[name].js',
                // sourcemap: true,
                compact: true
            }
        }
    }
})