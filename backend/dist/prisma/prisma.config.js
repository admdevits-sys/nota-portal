import { PrismaClient } from "@prisma/client";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("Environment variable not found: DATABASE_URL");
}
export const prisma = global.__prisma ??
    new PrismaClient({
        log: ["error", "warn"],
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });
if (process.env.NODE_ENV !== "production")
    global.__prisma = prisma;
