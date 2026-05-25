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

  if (msg.includes("must contain only ASCII")) {
    return "环境变量含中文或特殊符号，请只使用纯 ASCII 的 SESSION_SECRET。";
  }
  if (msg.includes("SESSION_SECRET must be set")) {
    return "服务端未配置 SESSION_SECRET。";
  }
  if (full.includes("Cloudflare D1 binding `DB` is not configured")) {
    return "Cloudflare D1 绑定 `DB` 未配置，请在 wrangler 或 Dashboard 中绑定 D1 数据库。";
  }
  if (
    full.includes("no such table") ||
    full.includes("P2021") ||
    full.includes("does not exist") ||
    full.includes("SQLITE_UNKNOWN")
  ) {
    return "D1 数据库表未创建，请先执行 D1 migration。";
  }
  if (full.includes("ENOTFOUND") || full.includes("fetch failed") || full.includes("Network")) {
    return "无法连接 Cloudflare D1，请检查绑定和部署配置。";
  }

  return "服务暂时不可用，请稍后重试";
}
