import { defineConfig } from "vitest/config";
import { defaults } from "vitest/globals";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["server/**/*.test.ts"],
  },
});
