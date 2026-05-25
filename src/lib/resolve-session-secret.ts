import { getCloudflareContext } from "@opennextjs/cloudflare";
import { assertAsciiEnv } from "@/lib/ascii-env";

const DEV_FALLBACK_SECRET = "dev-insecure-session-secret";

function isCloudflareWorkerRuntime(): boolean {
  return Boolean((globalThis as { WebSocketPair?: unknown }).WebSocketPair);
}

function secretFromCloudflareEnv(env: { SESSION_SECRET?: unknown }): string | undefined {
  const value = typeof env.SESSION_SECRET === "string" ? env.SESSION_SECRET.trim() : "";
  return value || undefined;
}

/** Read secret from process.env or Cloudflare `env` (sync — call before other awaits). */
export function resolveSessionSecret(): string | undefined {
  const fromProcess = process.env.SESSION_SECRET?.trim();
  if (fromProcess) return fromProcess;

  if (!isCloudflareWorkerRuntime()) return undefined;

  try {
    const { env } = getCloudflareContext({ async: false });
    return secretFromCloudflareEnv(env);
  } catch {
    return undefined;
  }
}

/** Fallback when sync context is unavailable after earlier awaits. */
export async function resolveSessionSecretAsync(): Promise<string | undefined> {
  const immediate = resolveSessionSecret();
  if (immediate) return immediate;

  try {
    const { env } = await getCloudflareContext({ async: true });
    return secretFromCloudflareEnv(env);
  } catch {
    return undefined;
  }
}

/** Resolve at Route Handler entry; pass the result into attachSessionCookie. */
export async function requireSessionSecretForRequest(): Promise<string> {
  let secret = resolveSessionSecret();
  if (!secret) {
    secret = await resolveSessionSecretAsync();
  }
  if (secret) return assertAsciiEnv("SESSION_SECRET", secret);

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }

  return DEV_FALLBACK_SECRET;
}
