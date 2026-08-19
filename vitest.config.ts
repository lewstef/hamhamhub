import { defineConfig } from "vitest/config";
import path from "path";
import os from "os";

const cpuCount = os.cpus().length;

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    css: false,
    pool: "threads",
    fileParallelism: true,
    maxConcurrency: cpuCount,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
