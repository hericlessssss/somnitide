import { defineConfig } from 'vitest/config';
import angular from '@angular/build/vitest';

export default defineConfig({
    plugins: [angular()],
    test: {
        globals: true,
        setupFiles: ['src/test-setup.ts'],
        environment: 'jsdom',
        reporters: ['default', 'junit'],
        outputFile: 'test-results.xml',
        watch: false,
    },
});
