import { PrismaClient } from "@prisma/client";

// Reuse one Prisma client during development so hot reloads do not open a bunch of connections.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
