import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn(), findUnique: vi.fn() }));
vi.mock("../lib/prisma", () => ({ prisma: { project: mocks } }));

import { getDashboardProjects, getProjectBoard, getUserProjectChoices } from "../lib/project-data";

beforeEach(() => vi.clearAllMocks());

describe("project data", () => {
    it("queries project choices for the current member", async () => {
        mocks.findMany.mockResolvedValue([{ id: "p1", name: "Alpha" }]);
        await expect(getUserProjectChoices("u1")).resolves.toEqual([{ id: "p1", name: "Alpha" }]);
        expect(mocks.findMany).toHaveBeenCalledWith({ where: { members: { some: { userId: "u1" } } }, orderBy: { name: "asc" }, select: { id: true, name: true } });
    });

    it("maps dashboard counts, defaults, and edit permission", async () => {
        mocks.findMany.mockResolvedValue([
            { id: "p1", name: "Alpha", description: null, members: [{ role: "OWNER" }], issues: [{ status: "TODO" }, { status: "DONE" }], features: [{ status: "IN_PROGRESS" }, { status: "DONE" }], _count: { members: 3 } },
            { id: "p2", name: "Beta", description: "B", members: [], issues: [], features: [], _count: { members: 1 } },
        ]);
        const result = await getDashboardProjects("u1");
        expect(result[0]).toMatchObject({ members: 3, issues: 2, features: 2, openIssues: 1, openFeatures: 1, todo: 1, inProgress: 1, done: 2, totalWork: 4, canEdit: true, description: "No description yet." });
        expect(result[1]).toMatchObject({ totalWork: 0, canEdit: false, description: "B" });
    });

    it("hides missing projects and projects from non-members", async () => {
        mocks.findUnique.mockResolvedValueOnce(null);
        await expect(getProjectBoard("missing", "u1")).resolves.toBeNull();
        mocks.findUnique.mockResolvedValueOnce({ members: [], issues: [], features: [] });
        await expect(getProjectBoard("p1", "u1")).resolves.toBeNull();
    });

    it("maps authorized work into the three board columns", async () => {
        mocks.findUnique.mockResolvedValue({
            id: "p1", name: "Alpha", description: null,
            members: [{ userId: "u1", role: "OWNER", user: { id: "u1", name: "Andrew" } }],
            issues: [{ id: "i1", title: "Fix", status: "TODO", priority: "HIGH", assignee: null, feature: { title: "Auth" } }, { id: "i2", title: "Ship", status: "DONE", priority: "LOW", assignee: { name: "Maya" }, feature: null }],
            features: [{ id: "f1", title: "Auth", status: "IN_PROGRESS", priority: "MEDIUM", assignee: null }],
        });
        const result = await getProjectBoard("p1", "u1");
        expect(result).toMatchObject({ id: "p1", description: "No description yet.", members: [{ id: "u1", name: "Andrew", role: "OWNER" }] });
        expect(result.boardColumns.map(({ name }) => name)).toEqual(["Todo", "In Progress", "Done"]);
        expect(result.boardColumns[0].issues[0]).toEqual({ id: "i1", title: "Fix", assignee: "Unassigned", priority: "HIGH", feature: "Auth" });
        expect(result.boardColumns[1].features[0].assignee).toBe("Unassigned");
        expect(result.boardColumns[2].issues[0].assignee).toBe("Maya");
    });
});
