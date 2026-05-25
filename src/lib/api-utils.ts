import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

export function jsonServerError(context: string, error: unknown) {
  console.error(context, error);
  const hint =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "服务暂时不可用，请稍后重试";
  return jsonError(hint, 500);
}
