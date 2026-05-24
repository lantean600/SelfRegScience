import { PrismaClient, type Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function prismaLog(): Prisma.LogLevel[] {
  return process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const log = prismaLog();

  if (url.startsWith("libsql:")) {
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    if (!authToken) {
      throw new Error(
        "DATABASE_AUTH_TOKEN is required when DATABASE_URL uses libsql://",
      );
    }
    // Web client works on Cloudflare Workers and in Node for Turso HTTP access.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql/web") as typeof import("@prisma/adapter-libsql/web");
    const adapter = new PrismaLibSQL({ url, authToken });
    return new PrismaClient({ adapter: adapter as never, log });
  }

  return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
