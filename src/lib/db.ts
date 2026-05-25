import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";

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
    const adapter = new PrismaLibSQL({ url, authToken });
    return new PrismaClient({ adapter: adapter as never, log });
  }

  return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
