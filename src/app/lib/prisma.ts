import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { envConfig } from "../../config/env";
import { PrismaClient } from "../../generated/prisma/client/client";

const connectionString = envConfig.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}