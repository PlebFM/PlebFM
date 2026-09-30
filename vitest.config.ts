import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig.json sets `"jsx": "preserve"` for Next's own compiler, which leaves
  // Vitest's esbuild transform on the classic runtime and every component test
  // failing with "React is not defined". Next injects the automatic runtime in
  // its build, so tests need the same thing configured explicitly.
  esbuild: { jsx: 'automatic' },
  test: {
    // Node by default; files needing a DOM opt in with
    // `// @vitest-environment jsdom`, so pure logic tests stay fast.
    environment: 'node',
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
  },
});
