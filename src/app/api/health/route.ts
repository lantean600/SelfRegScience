import { getCloudflareContext } from "@opennextjs/cloudflare";
import { formatApiError } from "@/lib/format-api-error";
import { jsonOk, jsonError } from "@/lib/api-utils";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const cloudflareContext = await getCloudflareContext({ async: true }).catch(() => null);
    const prisma = await getDb();
    await prisma.user.count();
    return jsonOk({
      ok: true,
      databaseBackend: cloudflareContext?.env.DB ? "d1" : "sqlite-file",
      hasD1Binding: Boolean(cloudflareContext?.env.DB),
      hasSessionSecret: Boolean(process.env.SESSION_SECRET?.trim()),
    });
  } catch (error) {
    return jsonError(formatApiError(error), 503);
  }
}
