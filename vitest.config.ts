import { defineConfig } from 'vitest/config';

// Vitest runs the unit tests only; test/e2e/*.spec.ts belongs to Playwright (`npm run e2e`).
export default defineConfig({
  test: { include: ['test/*.test.ts'] },
});
