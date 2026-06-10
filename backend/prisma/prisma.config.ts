import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Environment variable not found: DATABASE_URL");
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
