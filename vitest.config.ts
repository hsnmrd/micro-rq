import { defineConfig } from "vitest/config";

process.env.TMPDIR = "/tmp";
process.env.TMP = "/tmp";
process.env.TEMP = "/tmp";

export default defineConfig({
  cacheDir: "/tmp/micro-rq-vitest-cache",
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
