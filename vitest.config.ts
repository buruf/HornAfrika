import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // These are unit tests over pure logic. Anything needing a database or the
    // network belongs in a separate integration run, not here.
    passWithNoTests: false,
  },
});
