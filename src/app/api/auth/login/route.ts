import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { jsonOk, jsonError, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  const body = await parseBody<{ email: string; password: string }>(request);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return jsonError("邮箱或密码错误", 401);
  }
  await createSession(user.id);
  return jsonOk({ id: user.id, email: user.email });
}
