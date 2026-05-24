import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { jsonOk, jsonError, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  const body = await parseBody<{ email: string; password: string }>(request);
  if (!body.email || !body.password) return jsonError("缺少邮箱或密码");

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return jsonError("邮箱已注册", 409);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: await hashPassword(body.password),
    },
  });

  await createSession(user.id);
  return jsonOk({ id: user.id, email: user.email });
}
