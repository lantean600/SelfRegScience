import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getCloudflareContext, type CloudflareContext } from "@opennextjs/cloudflare";
import { resolveDatabaseUrl } from "@/lib/resolve-database-url";

type GlobalPrismaState = {
  sqlitePrisma?: PrismaClient;
  d1PrismaByBinding?: WeakMap<object, PrismaClient>;
};

const globalForPrisma = globalThis as unknown as GlobalPrismaState;

function prismaLog(): Prisma.LogLevel[] {
  return process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
}

function getSqlitePrisma(): PrismaClient {
  const existing = globalForPrisma.sqlitePrisma;
  if (existing) return existing;

  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: resolveDatabaseUrl() }),
    log: prismaLog(),
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.sqlitePrisma = prisma;
  }
  return prisma;
}

function getD1PrismaFromBinding(binding: NonNullable<CloudflareEnv["DB"]>): PrismaClient {
  const cache = globalForPrisma.d1PrismaByBinding ??= new WeakMap();
  const existing = cache.get(binding as object);
  if (existing) return existing;

  const prisma = new PrismaClient({
    adapter: new PrismaD1(binding) as never,
    log: prismaLog(),
  });
  cache.set(binding as object, prisma);
  return prisma;
}

async function getCloudflareDbContext(): Promise<CloudflareContext | null> {
  try {
    return await getCloudflareContext({ async: true });
  } catch {
    return null;
  }
}

export async function getDb(): Promise<PrismaClient> {
  const cloudflareContext = await getCloudflareDbContext();
  if (cloudflareContext?.env.DB) {
    return getD1PrismaFromBinding(cloudflareContext.env.DB);
  }

  if (
    process.env.CF_PAGES === "1" ||
    process.env.OPEN_NEXT_CLOUDFLARE_DEV === "1" ||
    Boolean(process.env.NEXT_DEV_WRANGLER_ENV)
  ) {
    throw new Error("Cloudflare D1 binding `DB` is not configured.");
  }

  return getSqlitePrisma();
}

function createLazyPrismaProxy(path: PropertyKey[] = []): unknown {
  return new Proxy(function prismaProxy() {}, {
    get(_target, prop) {
      if (prop === "then") return undefined;
      return createLazyPrismaProxy([...path, prop]);
    },
    apply(_target, _thisArg, argArray) {
      return getDb().then((db) => {
        let owner: unknown = db;
        let target: unknown = db;
        for (const key of path) {
          owner = target;
          target = (target as Record<PropertyKey, unknown>)[key];
        }
        if (typeof target !== "function") return target;
        return target.apply(owner, argArray);
      });
    },
  });
}

export const prisma = createLazyPrismaProxy() as PrismaClient;
