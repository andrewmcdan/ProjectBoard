import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ constructor: vi.fn(function PrismaClient() { return { marker: "client" }; }) }));
vi.mock("@prisma/client", () => ({ PrismaClient: mocks.constructor }));

describe("Prisma client singleton", () => {
    it("constructs one reusable client in non-production environments", async () => {
        delete globalThis.prisma;
        const { prisma } = await import("../lib/prisma");
        expect(prisma).toEqual({ marker: "client" });
        expect(globalThis.prisma).toBe(prisma);
        expect(mocks.constructor).toHaveBeenCalledTimes(1);
    });
});
