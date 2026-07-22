import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedirectError } from "./helpers";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), redirect: vi.fn(), membership: vi.fn() }));
vi.mock("../auth", () => ({ auth: mocks.auth }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("../lib/prisma", () => ({ prisma: { projectMember: { findUnique: mocks.membership } } }));

import { requireProjectMember, requireUser } from "../lib/auth-helpers";

beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((url) => { throw new RedirectError(url); });
});

describe("authorization helpers", () => {
    it("redirects guests to login", async () => {
        mocks.auth.mockResolvedValue(null);
        await expect(requireUser()).rejects.toMatchObject({ url: "/login" });
    });

    it("returns the signed-in user", async () => {
        mocks.auth.mockResolvedValue({ user: { id: "u1", name: "Andrew" } });
        await expect(requireUser()).resolves.toEqual({ id: "u1", name: "Andrew" });
    });

    it("returns membership only when the compound key exists", async () => {
        const user = { id: "u1" };
        mocks.auth.mockResolvedValue({ user });
        mocks.membership.mockResolvedValueOnce(null).mockResolvedValueOnce({ role: "MEMBER" });
        await expect(requireProjectMember("p1")).resolves.toBeNull();
        await expect(requireProjectMember("p1")).resolves.toEqual({ user, membership: { role: "MEMBER" } });
        expect(mocks.membership).toHaveBeenCalledWith({ where: { projectId_userId: { projectId: "p1", userId: "u1" } } });
    });
});
