import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        exclude: [...configDefaults.exclude, 'e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80,
            },
            include: ['app/api/**', 'lib/**'],
            exclude: ['**/*.test.ts', '**/*.spec.ts', 'lib/supabase/__tests__/**'],
        },
    },
})
