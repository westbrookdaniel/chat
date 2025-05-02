import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

export default defineConfig({
  out: resolve(__dirname, "./drizzle"),
  schema: resolve(__dirname, "./src/db/index.ts"),
  casing: "snake_case",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
