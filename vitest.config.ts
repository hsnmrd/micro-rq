import { defineConfig } from "vitest/config";

process.env.TMPDIR = "/tmp";
process.env.TMP = "/tmp";
process.env.TEMP = "/tmp";

export default defineConfig({
  cacheDir: "/tmp/tanstack-rest-query-vitest-cache",
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
