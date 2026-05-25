import { verifyPassword, attachSessionCookie } from "@/lib/auth";
import { jsonOk, jsonError, parseBody, jsonServerError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/db");
    const body = await parseBody<{ email: string; password: string }>(request);
    if (!body.email?.trim() || !body.password) {
      return jsonError("请输入邮箱和密码", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email.trim() },
    });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("邮箱或密码错误", 401);
    }

    const response = jsonOk({ id: user.id, email: user.email });
    attachSessionCookie(response, user.id, request);
    return response;
  } catch (error) {
    return jsonServerError("[auth/login]", error);
  }
}
