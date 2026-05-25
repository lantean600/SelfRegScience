import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";
import { assertAsciiEnv, stripBearerPrefix } from "@/lib/ascii-env";
import { resolveDatabaseUrl } from "@/lib/resolve-database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function prismaLog(): Prisma.LogLevel[] {
  return process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
}

function tursoAuthToken(): string {
  const raw = process.env.DATABASE_AUTH_TOKEN;
  if (!raw) {
    throw new Error(
      "DATABASE_AUTH_TOKEN is required when DATABASE_URL uses libsql://",
    );
  }
  return assertAsciiEnv("DATABASE_AUTH_TOKEN", stripBearerPrefix(raw));
}

function createPrismaClient(): PrismaClient {
  const url = resolveDatabaseUrl();
  const log = prismaLog();

  if (url.startsWith("libsql:")) {
    const adapter = new PrismaLibSQL({ url, authToken: tursoAuthToken() });
    return new PrismaClient({ adapter: adapter as never, log });
  }

  // Prisma reads env("DATABASE_URL") from schema; override when .env file: wins over injected libsql://
  return new PrismaClient({
    datasources: { db: { url } },
    log,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
