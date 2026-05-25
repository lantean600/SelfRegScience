import fs from "fs";
import path from "path";

function readDotEnvValue(key: string): string | undefined {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return undefined;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      if (trimmed.slice(0, eq).trim() !== key) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Resolve DB URL for Prisma.
 * In development, `.env` file:./dev.db wins over shell/IDE-injected libsql://
 * (common on Windows when Turso vars were set globally).
 */
export function resolveDatabaseUrl(): string {
  const fromFile = readDotEnvValue("DATABASE_URL");
  const fromEnv = process.env.DATABASE_URL?.trim();

  if (process.env.NODE_ENV === "development" && fromFile?.startsWith("file:")) {
    if (fromEnv && fromEnv !== fromFile && fromEnv.startsWith("libsql:")) {
      console.warn(
        "[db] Development: using DATABASE_URL from .env (local SQLite). " +
          "Shell/IDE libsql:// is ignored. Unset system DATABASE_* vars or set USE_TURSO_LOCAL=1 to force Turso.",
      );
    }
    return fromFile;
  }

  if (process.env.USE_TURSO_LOCAL === "1" && fromEnv?.startsWith("libsql:")) {
    return fromEnv;
  }

  const url = fromEnv ?? fromFile ?? "file:./dev.db";

  // Cloudflare Pages/Workers: file: SQLite is not available at runtime
  if (process.env.CF_PAGES === "1" && url.startsWith("file:")) {
    throw new Error(
      "Cloudflare production cannot use file: SQLite. Set DATABASE_URL=libsql://… and DATABASE_AUTH_TOKEN.",
    );
  }

  return url;
}
