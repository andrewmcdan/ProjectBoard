import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), requireUser: vi.fn(), dashboard: vi.fn(), board: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a> }));
vi.mock("../auth", () => ({ auth: mocks.auth }));
vi.mock("../lib/auth-helpers", () => ({ requireUser: mocks.requireUser }));
vi.mock("../lib/project-data", () => ({ getDashboardProjects: mocks.dashboard, getProjectBoard: mocks.board }));
vi.mock("../components/site-shell", () => ({ SiteShell: ({ children }) => <main data-testid="shell">{children}</main> }));
vi.mock("../components/section-card", () => ({ SectionCard: ({ title, eyebrow, actions, children }) => <section><span>{eyebrow}</span><h2>{title}</h2>{actions}{children}</section> }));

import HomePage from "../app/page";
import DashboardPage from "../app/dashboard/page";
import ProjectBoardPage from "../app/projects/[projectId]/page";

beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "u1", name: "Andrew" });
});

describe("server-rendered pages", () => {
    it("renders the guest homepage without querying private project data", async () => {
        mocks.auth.mockResolvedValue(null);
        const html = renderToStaticMarkup(await HomePage());
        expect(html).toContain("Keep projects visible");
        expect(html).toContain("Create Account");
        expect(mocks.dashboard).not.toHaveBeenCalled();
    });

    it("renders member totals, completion, and empty states", async () => {
        mocks.auth.mockResolvedValue({ user: { id: "u1", name: "Andrew" } });
        mocks.dashboard.mockResolvedValueOnce([{ id: "p1", name: "Alpha", description: "A", members: 2, issues: 2, features: 1, totalWork: 3, todo: 1, inProgress: 1, done: 1 }]);
        let html = renderToStaticMarkup(await HomePage());
        expect(html).toContain("Welcome back, Andrew");
        expect(html).toContain("33% complete");
        expect(html).toContain("3</strong><span>issues and features");
        mocks.dashboard.mockResolvedValueOnce([]);
        html = renderToStaticMarkup(await HomePage());
        expect(html).toContain("No projects yet");
    });

    it("renders dashboard projects, errors, owner controls, and empty state", async () => {
        mocks.dashboard.mockResolvedValueOnce([{ id: "p1", name: "Alpha", description: "A", members: 2, openIssues: 1, openFeatures: 0, canEdit: true }]);
        let html = renderToStaticMarkup(await DashboardPage({ searchParams: Promise.resolve({ error: "Denied" }) }));
        expect(html).toContain("Andrew&#x27;s Projects");
        expect(html).toContain("Denied");
        expect(html).toContain("Edit project");
        mocks.dashboard.mockResolvedValueOnce([]);
        html = renderToStaticMarkup(await DashboardPage({ searchParams: Promise.resolve({}) }));
        expect(html).toContain("You do not have any projects yet");
    });

    it("renders unauthorized and populated project boards", async () => {
        mocks.board.mockResolvedValueOnce(null);
        let html = renderToStaticMarkup(await ProjectBoardPage({ params: Promise.resolve({ projectId: "p1" }) }));
        expect(html).toContain("Project not found");
        mocks.board.mockResolvedValueOnce({
            id: "p1", name: "Alpha", description: "A", members: [{ name: "Andrew" }, { name: "Maya" }],
            boardColumns: [
                { id: "todo", name: "Todo", className: "statusTodo", features: [{ id: "f1", title: "Auth", assignee: "Maya", priority: "HIGH" }], issues: [{ id: "i1", title: "Fix", assignee: "Unassigned", priority: "LOW", feature: "Auth" }] },
            ],
        });
        html = renderToStaticMarkup(await ProjectBoardPage({ params: Promise.resolve({ projectId: "p1" }) }));
        expect(html).toContain("Alpha");
        expect(html).toContain("Andrew, Maya");
        expect(html).toContain("1 issues / 1 features");
        expect(html).toContain("Feature: Auth");
    });
});
