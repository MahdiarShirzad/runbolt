import { defineConfig, env } from "prisma/config";

// Prisma evaluates this config file before the CLI loads `.env`,
// so load it here or `env()` below would have nothing to read.
try {
  process.loadEnvFile();
} catch {
  // No .env file — DATABASE_URL may already be provided by the shell.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
