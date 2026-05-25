import { formatApiError } from "@/lib/format-api-error";
import { jsonOk, jsonError } from "@/lib/api-utils";
import { getDb, getDbRuntimeInfo } from "@/lib/db";

export async function GET() {
  try {
    const runtime = await getDbRuntimeInfo();
    const prisma = await getDb();
    await prisma.user.count();
    return jsonOk({
      ok: true,
      databaseBackend: runtime.databaseBackend,
      hasD1Binding: runtime.hasD1Binding,
      runtimePath: runtime.runtimePath,
      hasSessionSecret: Boolean(process.env.SESSION_SECRET?.trim()),
    });
  } catch (error) {
    return jsonError(formatApiError(error), 503);
  }
}
