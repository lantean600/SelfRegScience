/** Map server errors to safe, actionable Chinese messages for the UI. */
export function formatApiError(error: unknown): string {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const code =
    error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const causeMessage =
    error &&
    typeof error === "object" &&
    "cause" in error &&
    (error as { cause?: unknown }).cause &&
    typeof (error as { cause?: unknown }).cause === "object" &&
    "message" in ((error as { cause?: unknown }).cause as object)
      ? String((((error as { cause?: unknown }).cause as { message?: unknown }).message ?? ""))
      : "";
  const full = [msg, code, causeMessage].filter(Boolean).join(" | ");

  if (msg.includes("DATABASE_AUTH_TOKEN is required")) {
    return "服务端未配置 DATABASE_AUTH_TOKEN，请在 Cloudflare 环境变量中设置 Turso Token。";
  }
  if (msg.includes("must contain only ASCII")) {
    return "环境变量含中文或特殊符号，请只粘贴纯 ASCII 的 Token / SESSION_SECRET。";
  }
  if (msg.includes("SESSION_SECRET must be set")) {
    return "服务端未配置 SESSION_SECRET。";
  }
  if (msg.includes("Cloudflare production cannot use file:")) {
    return "服务端未配置 Turso：请在 Cloudflare 设置 DATABASE_URL=libsql://… 与 DATABASE_AUTH_TOKEN。";
  }
  if (
    full.includes("no such table") ||
    full.includes("P2021") ||
    full.includes("does not exist") ||
    full.includes("SQLITE_UNKNOWN")
  ) {
    return "数据库表未创建，请对 Turso 执行：npm run db:push:turso。";
  }
  if (
    full.includes("401") ||
    full.includes("Unauthorized") ||
    full.includes("invalid token") ||
    full.includes("InvalidAuth") ||
    full.includes("invalid type: unit value, expected i32")
  ) {
    return "DATABASE_AUTH_TOKEN 无效或已过期，请在 Turso 重新生成并更新 Cloudflare 变量。";
  }
  if (full.includes("BLOCKED") || full.includes("write permission")) {
    return "DATABASE_AUTH_TOKEN 只有只读权限，请在 Turso 生成 Full Access token 并更新 Cloudflare。";
  }
  if (full.includes("ENOTFOUND") || full.includes("fetch failed") || full.includes("Network")) {
    return "无法连接 Turso 数据库，请检查 DATABASE_URL 是否正确。";
  }

  return "服务暂时不可用，请稍后重试";
}
