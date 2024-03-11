import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.?(c|m)[jt]s?(x)'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
    },
    reporters: ['junit', 'json', 'verbose'],
    outputFile: {
      junit: './reports/junit-report.xml',
      json: './reports/json-report.json',
    },
  },
});
