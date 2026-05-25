import { prisma } from "@/lib/db";
import { formatApiError } from "@/lib/format-api-error";
import { jsonOk, jsonError } from "@/lib/api-utils";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const config = {
    databaseUrl: url.startsWith("libsql:")
      ? "libsql"
      : url.startsWith("file:")
        ? "sqlite-file"
        : "missing",
    hasAuthToken: Boolean(process.env.DATABASE_AUTH_TOKEN?.trim()),
    hasSessionSecret: Boolean(process.env.SESSION_SECRET?.trim()),
  };

  try {
    await prisma.user.count();
    return jsonOk({ ok: true, ...config });
  } catch (error) {
    return jsonError(formatApiError(error), 503);
  }
}
