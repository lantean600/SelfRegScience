/**
 * Push Prisma schema to Turso (Prisma CLI only accepts file: URLs).
 * Requires:
 *   DATABASE_URL=libsql://...
 *   DATABASE_AUTH_TOKEN=<turso jwt>
 */
import { spawnSync } from "child_process";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL?.trim();
const token = process.env.DATABASE_AUTH_TOKEN?.trim();

if (!url?.startsWith("libsql:")) {
  console.error("Set DATABASE_URL=libsql://your-db.turso.io");
  process.exit(1);
}
if (!token) {
  console.error("Set DATABASE_AUTH_TOKEN to a Turso database JWT (ASCII only).");
  process.exit(1);
}
if (/[^\x21-\x7E]/.test(token)) {
  console.error("DATABASE_AUTH_TOKEN must be ASCII only (no Chinese labels).");
  process.exit(1);
}

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const diff = spawnSync(
  npxCommand,
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--script",
  ],
  {
    encoding: "utf-8",
    shell: false,
    env: { ...process.env, DATABASE_URL: "file:./dev.db" },
  },
);

if (diff.status !== 0) {
  console.error(diff.stderr || diff.stdout);
  process.exit(diff.status ?? 1);
}

const sql = diff.stdout;
const statements = sql
  .split(";")
  .map((chunk) =>
    chunk
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim(),
  )
  .filter((statement) => statement.length > 0);

console.log(`Applying ${statements.length} statements to Turso…`);

const client = createClient({ url, authToken: token });

try {
  for (const statement of statements) {
    await client.execute(statement);
  }
  console.log("Turso schema push complete.");
} catch (e) {
  console.error("Turso push failed:", e);
  process.exit(1);
}
