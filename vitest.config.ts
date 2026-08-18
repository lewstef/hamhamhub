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
    poolOptions: {
      threads: {
        maxThreads: cpuCount,
        minThreads: Math.max(1, Math.floor(cpuCount / 2)),
      },
      forks: {
        maxForks: cpuCount,
        minForks: Math.max(1, Math.floor(cpuCount / 2)),
      },
    },
    maxConcurrency: cpuCount,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
