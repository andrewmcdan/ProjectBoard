import { beforeEach, describe, expect, it, vi } from "vitest";
import { form, RedirectError } from "./helpers";

const mocks = vi.hoisted(() => ({
    redirect: vi.fn(), revalidatePath: vi.fn(), signIn: vi.fn(), signOut: vi.fn(),
    requireUser: vi.fn(), requireProjectMember: vi.fn(), hashPassword: vi.fn(), verifyPassword: vi.fn(),
    userFindUnique: vi.fn(), userFindMany: vi.fn(), userCreate: vi.fn(), userUpdate: vi.fn(),
    projectCreate: vi.fn(), projectFindUnique: vi.fn(), projectUpdate: vi.fn(),
    memberDeleteMany: vi.fn(), memberCreateMany: vi.fn(),
    issueCreate: vi.fn(), issueFindUnique: vi.fn(), issueUpdate: vi.fn(), issueLabelDeleteMany: vi.fn(),
    issueCommentCreate: vi.fn(), issueCommentFindUnique: vi.fn(), issueCommentDelete: vi.fn(),
    featureCreate: vi.fn(), featureFindUnique: vi.fn(), featureUpdate: vi.fn(), featureLabelDeleteMany: vi.fn(),
    featureCommentCreate: vi.fn(), featureCommentFindUnique: vi.fn(), featureCommentDelete: vi.fn(), transaction: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("../auth", () => ({ signIn: mocks.signIn, signOut: mocks.signOut }));
vi.mock("../lib/auth-helpers", () => ({ requireUser: mocks.requireUser, requireProjectMember: mocks.requireProjectMember }));
vi.mock("../lib/password", () => ({ hashPassword: mocks.hashPassword, verifyPassword: mocks.verifyPassword }));
vi.mock("../lib/prisma", () => ({
    prisma: {
        user: { findUnique: mocks.userFindUnique, findMany: mocks.userFindMany, create: mocks.userCreate, update: mocks.userUpdate },
        project: { create: mocks.projectCreate, findUnique: mocks.projectFindUnique, update: mocks.projectUpdate },
        projectMember: { deleteMany: mocks.memberDeleteMany, createMany: mocks.memberCreateMany },
        issue: { create: mocks.issueCreate, findUnique: mocks.issueFindUnique, update: mocks.issueUpdate },
        issueLabel: { deleteMany: mocks.issueLabelDeleteMany },
        issueComment: { create: mocks.issueCommentCreate, findUnique: mocks.issueCommentFindUnique, delete: mocks.issueCommentDelete },
        feature: { create: mocks.featureCreate, findUnique: mocks.featureFindUnique, update: mocks.featureUpdate },
        featureLabel: { deleteMany: mocks.featureLabelDeleteMany },
        featureComment: { create: mocks.featureCommentCreate, findUnique: mocks.featureCommentFindUnique, delete: mocks.featureCommentDelete },
        $transaction: mocks.transaction,
    },
}));

import { AuthError } from "next-auth";
import {
    addFeatureCommentAction, addIssueCommentAction, changePasswordAction, createFeatureAction, createIssueAction,
    createProjectAction, deleteFeatureCommentAction, deleteIssueCommentAction, loginAction, logoutAction,
    registerAction, updateFeatureAction, updateIssueAction, updateProjectAction,
} from "../app/actions";

beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
    mocks.redirect.mockImplementation((url) => { throw new RedirectError(url); });
    mocks.requireUser.mockResolvedValue({ id: "u1", email: "owner@example.com" });
    mocks.requireProjectMember.mockResolvedValue({ user: { id: "u1" }, membership: { role: "MEMBER" } });
    mocks.hashPassword.mockReturnValue("hashed");
    mocks.transaction.mockImplementation(async (arg) => typeof arg === "function" ? arg({
        project: { update: mocks.projectUpdate }, projectMember: { deleteMany: mocks.memberDeleteMany, createMany: mocks.memberCreateMany },
    }) : Promise.all(arg));
});

describe("authentication actions", () => {
    it("logs in with trimmed credentials and logs out", async () => {
        await loginAction(form({ email: "  a@example.com ", password: " secret " }));
        expect(mocks.signIn).toHaveBeenCalledWith("credentials", { email: "a@example.com", password: "secret", redirectTo: "/dashboard" });
        await logoutAction();
        expect(mocks.signOut).toHaveBeenCalledWith({ redirectTo: "/" });
    });

    it("converts Auth.js login failures into a friendly redirect", async () => {
        mocks.signIn.mockRejectedValue(new AuthError("bad"));
        await expect(loginAction(form({ email: "a@b.com", password: "bad" }))).rejects.toMatchObject({ url: "/login?error=Invalid%20email%20or%20password" });
    });

    it("rethrows unexpected login failures", async () => {
        mocks.signIn.mockRejectedValue(new Error("network"));
        await expect(loginAction(form({}))).rejects.toThrow("network");
    });

    it("validates, normalizes, creates, and signs in a registration", async () => {
        await expect(registerAction(form({ name: "A", email: "bad", password: "short" }))).rejects.toMatchObject({ url: expect.stringContaining("Use%20a%20valid") });
        mocks.userFindUnique.mockResolvedValueOnce({ id: "existing" });
        await expect(registerAction(form({ name: "Andrew", email: "A@EXAMPLE.COM", password: "password" }))).rejects.toMatchObject({ url: expect.stringContaining("already%20registered") });
        mocks.userFindUnique.mockResolvedValueOnce(null);
        await registerAction(form({ name: " Andrew ", email: "A@EXAMPLE.COM", password: "password" }));
        expect(mocks.userCreate).toHaveBeenCalledWith({ data: { name: "Andrew", email: "a@example.com", passwordHash: "hashed" } });
        expect(mocks.signIn).toHaveBeenCalledWith("credentials", { email: "a@example.com", password: "password", redirectTo: "/dashboard" });
    });

    it("covers password-change validation and success", async () => {
        mocks.userFindUnique.mockResolvedValue({ id: "u1", passwordHash: "old" });
        mocks.verifyPassword.mockReturnValueOnce(false);
        await expect(changePasswordAction(form({ currentPassword: "bad" }))).rejects.toMatchObject({ url: expect.stringContaining("Current%20password") });

        mocks.verifyPassword.mockReturnValueOnce(true);
        await expect(changePasswordAction(form({ currentPassword: "old", newPassword: "short", confirmPassword: "short" }))).rejects.toMatchObject({ url: expect.stringContaining("at%20least%208") });

        mocks.verifyPassword.mockReturnValueOnce(true);
        await expect(changePasswordAction(form({ currentPassword: "old", newPassword: "newpassword", confirmPassword: "different" }))).rejects.toMatchObject({ url: expect.stringContaining("do%20not%20match") });

        mocks.verifyPassword.mockReturnValueOnce(true).mockReturnValueOnce(true);
        await expect(changePasswordAction(form({ currentPassword: "old", newPassword: "samepassword", confirmPassword: "samepassword" }))).rejects.toMatchObject({ url: expect.stringContaining("must%20be%20different") });

        mocks.verifyPassword.mockReturnValueOnce(true).mockReturnValueOnce(false);
        await expect(changePasswordAction(form({ currentPassword: "old", newPassword: "newpassword", confirmPassword: "newpassword" }))).rejects.toMatchObject({ url: expect.stringContaining("success=Password") });
        expect(mocks.userUpdate).toHaveBeenCalledWith({ where: { id: "u1" }, data: { passwordHash: "hashed" } });
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/settings");
    });
});

describe("project actions", () => {
    it("requires a project name and reports missing member accounts", async () => {
        await expect(createProjectAction(form({ name: "" }))).rejects.toMatchObject({ url: expect.stringContaining("name%20is%20required") });
        mocks.userFindMany.mockResolvedValue([{ id: "u2", email: "member@example.com" }]);
        await expect(createProjectAction(form({ name: "Alpha", memberEmails: "member@example.com, missing@example.com" }))).rejects.toMatchObject({ url: expect.stringContaining("missing%40example.com") });
    });

    it("normalizes members and creates the complete project graph", async () => {
        mocks.userFindMany.mockResolvedValue([{ id: "u2", email: "member@example.com" }]);
        mocks.projectCreate.mockResolvedValue({ id: "p1" });
        await expect(createProjectAction(form({ name: " Alpha ", description: "", memberEmails: "MEMBER@example.com\nmember@example.com\nowner@example.com" }))).rejects.toMatchObject({ url: "/projects/p1" });
        expect(mocks.projectCreate).toHaveBeenCalledWith({ data: expect.objectContaining({
            name: "Alpha", description: null, ownerId: "u1",
            members: { create: [{ userId: "u1", role: "OWNER" }, { userId: "u2", role: "MEMBER" }] },
            labels: { create: [{ name: "bug", color: "#b94c35" }, { name: "enhancement", color: "#2f7d5a" }, { name: "priority", color: "#9a6b22" }] },
        }) });
    });

    it("protects project updates and replaces members transactionally", async () => {
        mocks.projectFindUnique.mockResolvedValueOnce(null);
        await expect(updateProjectAction(form({ projectId: "p1" }))).rejects.toMatchObject({ url: expect.stringContaining("Only%20the%20project%20owner") });
        mocks.projectFindUnique.mockResolvedValueOnce({ id: "p1", ownerId: "u1", owner: { email: "owner@example.com" } });
        await expect(updateProjectAction(form({ projectId: "p1", name: "" }))).rejects.toMatchObject({ url: expect.stringContaining("name%20is%20required") });

        mocks.projectFindUnique.mockResolvedValueOnce({ id: "p1", ownerId: "u1", owner: { email: "owner@example.com" } });
        mocks.userFindMany.mockResolvedValueOnce([{ id: "u2", email: "member@example.com" }]);
        await expect(updateProjectAction(form({ projectId: "p1", name: "Alpha 2", memberEmails: "member@example.com" }))).rejects.toMatchObject({ url: expect.stringContaining("success=Project") });
        expect(mocks.projectUpdate).toHaveBeenCalledWith({ where: { id: "p1" }, data: { name: "Alpha 2", description: null } });
        expect(mocks.memberDeleteMany).toHaveBeenCalledWith({ where: { projectId: "p1", role: "MEMBER" } });
        expect(mocks.memberCreateMany).toHaveBeenCalledWith({ data: [{ projectId: "p1", userId: "u2", role: "MEMBER" }], skipDuplicates: true });
    });
});

describe("issue and feature actions", () => {
    it("denies inaccessible work creation and requires titles", async () => {
        mocks.requireProjectMember.mockResolvedValueOnce(null);
        await expect(createIssueAction(form({ projectId: "p1" }))).rejects.toMatchObject({ url: expect.stringContaining("Project%20access%20denied") });
        await expect(createFeatureAction(form({ projectId: "p1", title: "" }))).rejects.toMatchObject({ url: expect.stringContaining("Title%20is%20required") });
    });

    it("creates issues with defaults, labels, relationships, and noon dates", async () => {
        mocks.issueCreate.mockResolvedValue({ id: "i1" });
        await expect(createIssueAction(form({ projectId: "p1", title: " Fix ", dueDate: "2026-07-22", labelIds: ["l1", "l2"], featureId: "f1" }))).rejects.toMatchObject({ url: "/issues/i1" });
        expect(mocks.issueCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ projectId: "p1", title: "Fix", description: null, status: "TODO", priority: "MEDIUM", assignedTo: null, featureId: "f1", createdBy: "u1", issueLabels: { create: [{ labelId: "l1" }, { labelId: "l2" }] } }) });
        expect(mocks.issueCreate.mock.calls[0][0].data.dueDate.getHours()).toBe(12);
    });

    it("updates an authorized issue and replaces labels in a transaction", async () => {
        mocks.issueFindUnique.mockResolvedValue({ id: "i1", projectId: "p1" });
        await expect(updateIssueAction(form({ issueId: "i1", title: "Updated", status: "DONE", priority: "HIGH", labelIds: "l1" }))).rejects.toMatchObject({ url: "/issues/i1" });
        expect(mocks.transaction).toHaveBeenCalled();
        expect(mocks.issueLabelDeleteMany).toHaveBeenCalledWith({ where: { issueId: "i1" } });
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/p1");
    });

    it("denies missing issue updates", async () => {
        mocks.issueFindUnique.mockResolvedValue(null);
        await expect(updateIssueAction(form({ issueId: "missing" }))).rejects.toMatchObject({ url: expect.stringContaining("Issue%20access%20denied") });
        expect(mocks.requireProjectMember).not.toHaveBeenCalled();
    });

    it("creates and updates features", async () => {
        mocks.featureCreate.mockResolvedValue({ id: "f1" });
        await expect(createFeatureAction(form({ projectId: "p1", title: "Feature", status: "IN_PROGRESS", priority: "HIGH", assignedTo: "u2", labelIds: "l1" }))).rejects.toMatchObject({ url: "/features/f1" });
        expect(mocks.featureCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ status: "IN_PROGRESS", priority: "HIGH", assignedTo: "u2", featureLabels: { create: [{ labelId: "l1" }] } }) });

        mocks.featureFindUnique.mockResolvedValue({ id: "f1", projectId: "p1" });
        await expect(updateFeatureAction(form({ featureId: "f1", title: "Updated", status: "DONE", priority: "LOW" }))).rejects.toMatchObject({ url: "/features/f1" });
        expect(mocks.featureLabelDeleteMany).toHaveBeenCalledWith({ where: { featureId: "f1" } });
    });
});

describe("comment actions", () => {
    it("adds non-empty issue and feature comments", async () => {
        mocks.issueFindUnique.mockResolvedValue({ id: "i1", projectId: "p1" });
        await addIssueCommentAction(form({ issueId: "i1", body: " Hello " }));
        expect(mocks.issueCommentCreate).toHaveBeenCalledWith({ data: { issueId: "i1", userId: "u1", body: "Hello" } });
        mocks.featureFindUnique.mockResolvedValue({ id: "f1", projectId: "p1" });
        await addFeatureCommentAction(form({ featureId: "f1", body: "Feature note" }));
        expect(mocks.featureCommentCreate).toHaveBeenCalledWith({ data: { featureId: "f1", userId: "u1", body: "Feature note" } });
    });

    it("does not create blank comments", async () => {
        mocks.issueFindUnique.mockResolvedValue({ id: "i1", projectId: "p1" });
        await addIssueCommentAction(form({ issueId: "i1", body: "  " }));
        expect(mocks.issueCommentCreate).not.toHaveBeenCalled();
    });

    it("allows authors to delete comments and rejects everyone else", async () => {
        mocks.issueCommentFindUnique.mockResolvedValue({ id: "c1", userId: "u1", issue: { id: "i1", projectId: "p1" } });
        await deleteIssueCommentAction(form({ commentId: "c1" }));
        expect(mocks.issueCommentDelete).toHaveBeenCalledWith({ where: { id: "c1" } });

        mocks.featureCommentFindUnique.mockResolvedValue({ id: "c2", userId: "other", feature: { id: "f1", projectId: "p1" } });
        await expect(deleteFeatureCommentAction(form({ commentId: "c2" }))).rejects.toMatchObject({ url: expect.stringContaining("only%20delete%20your%20own") });
        expect(mocks.featureCommentDelete).not.toHaveBeenCalled();
    });
});
