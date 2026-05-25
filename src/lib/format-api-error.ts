/** Map server errors to safe, actionable Chinese messages for the UI. */
export function formatApiError(error: unknown): string {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

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
    msg.includes("no such table") ||
    msg.includes("P2021") ||
    msg.includes("does not exist") ||
    msg.includes("SQLITE_UNKNOWN")
  ) {
    return "数据库表未创建，请对 Turso 执行：npx prisma db push（见 docs/deploy-cloudflare.md）。";
  }
  if (
    msg.includes("401") ||
    msg.includes("Unauthorized") ||
    msg.includes("invalid token") ||
    msg.includes("InvalidAuth")
  ) {
    return "DATABASE_AUTH_TOKEN 无效或已过期，请在 Turso 重新生成并更新 Cloudflare 变量。";
  }
  if (msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("Network")) {
    return "无法连接 Turso 数据库，请检查 DATABASE_URL 是否正确。";
  }

  return "服务暂时不可用，请稍后重试";
}
