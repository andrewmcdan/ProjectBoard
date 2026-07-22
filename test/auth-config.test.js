import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ nextAuth: vi.fn(), credentials: vi.fn(), findUnique: vi.fn(), verify: vi.fn(), config: null }));
vi.mock("next-auth", () => ({ default: (config) => { mocks.config = config; return mocks.nextAuth(config); } }));
vi.mock("next-auth/providers/credentials", () => ({ default: (config) => { mocks.credentials(config); return { id: "credentials", ...config }; } }));
vi.mock("../lib/prisma", () => ({ prisma: { user: { findUnique: mocks.findUnique } } }));
vi.mock("../lib/password", () => ({ verifyPassword: mocks.verify }));

beforeAll(() => {
    mocks.nextAuth.mockReturnValue({ handlers: { GET: "get", POST: "post" }, auth: "auth", signIn: "signIn", signOut: "signOut" });
});

beforeEach(() => vi.clearAllMocks());

describe("Auth.js configuration", () => {
    it("exports the configured Auth.js helpers", async () => {
        const mod = await import("../auth");
        expect(mod.handlers).toEqual({ GET: "get", POST: "post" });
        expect(mocks.config.session.strategy).toBe("jwt");
    });

    it("authorizes normalized credentials only when password verification succeeds", async () => {
        await import("../auth");
        const authorize = mocks.config.providers[0].authorize;
        mocks.findUnique.mockResolvedValue(null);
        await expect(authorize({ email: " A@EXAMPLE.COM ", password: " password " })).resolves.toBeNull();
        expect(mocks.findUnique).toHaveBeenCalledWith({ where: { email: "a@example.com" } });

        const user = { id: "u1", email: "a@example.com", name: "Andrew", passwordHash: "hash" };
        mocks.findUnique.mockResolvedValue(user);
        mocks.verify.mockReturnValueOnce(false).mockReturnValueOnce(true);
        await expect(authorize({ email: "a@example.com", password: "bad" })).resolves.toBeNull();
        await expect(authorize({ email: "a@example.com", password: "good" })).resolves.toEqual({ id: "u1", email: "a@example.com", name: "Andrew" });
    });

    it("copies the database id through JWT and session callbacks", async () => {
        await import("../auth");
        const token = await mocks.config.callbacks.jwt({ token: {}, user: { id: "u1" } });
        expect(token.id).toBe("u1");
        expect(await mocks.config.callbacks.jwt({ token, user: null })).toBe(token);
        const session = await mocks.config.callbacks.session({ session: { user: { name: "Andrew" } }, token });
        expect(session.user.id).toBe("u1");
    });
});
