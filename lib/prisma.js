import { PrismaClient } from "@prisma/client";

// Reuse one Prisma client during development so hot reloads do not open a bunch of connections.
const globalForPrisma = globalThis;

// ?? uses the cached client when it exists and creates one only when it does not.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
