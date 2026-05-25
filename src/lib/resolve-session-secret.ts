import { getCloudflareContext } from "@opennextjs/cloudflare";
import { assertAsciiEnv } from "@/lib/ascii-env";

function isCloudflareWorkerRuntime(): boolean {
  return Boolean((globalThis as { WebSocketPair?: unknown }).WebSocketPair);
}

/** Secrets are on `env` but are not always copied onto `process.env` by OpenNext. */
export function resolveSessionSecret(): string | undefined {
  const fromProcess = process.env.SESSION_SECRET?.trim();
  if (fromProcess) return fromProcess;

  if (!isCloudflareWorkerRuntime()) return undefined;

  try {
    const { env } = getCloudflareContext({ async: false });
    const fromBinding =
      typeof env.SESSION_SECRET === "string" ? env.SESSION_SECRET.trim() : "";
    return fromBinding || undefined;
  } catch {
    return undefined;
  }
}

export function requireSessionSecret(): string {
  const secret = resolveSessionSecret();
  if (!secret) return "";
  return assertAsciiEnv("SESSION_SECRET", secret);
}
