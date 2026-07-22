import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedirectError } from "./helpers";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(), redirect: vi.fn(), notFound: vi.fn(), requireUser: vi.fn(), requireMember: vi.fn(), choices: vi.fn(),
    projectFind: vi.fn(), issueFind: vi.fn(), featureFind: vi.fn(),
}));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a> }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
vi.mock("../auth", () => ({ auth: mocks.auth }));
vi.mock("../lib/auth-helpers", () => ({ requireUser: mocks.requireUser, requireProjectMember: mocks.requireMember }));
vi.mock("../lib/project-data", () => ({ getUserProjectChoices: mocks.choices }));
vi.mock("../lib/prisma", () => ({ prisma: { project: { findUnique: mocks.projectFind }, issue: { findUnique: mocks.issueFind }, feature: { findUnique: mocks.featureFind } } }));
vi.mock("../app/actions", () => ({
    loginAction: vi.fn(), registerAction: vi.fn(), changePasswordAction: vi.fn(), createProjectAction: vi.fn(), updateProjectAction: vi.fn(),
    createIssueAction: vi.fn(), createFeatureAction: vi.fn(), updateIssueAction: vi.fn(), updateFeatureAction: vi.fn(),
    addIssueCommentAction: vi.fn(), deleteIssueCommentAction: vi.fn(), addFeatureCommentAction: vi.fn(), deleteFeatureCommentAction: vi.fn(),
}));
vi.mock("../components/site-shell", () => ({ SiteShell: ({ children }) => <main>{children}</main> }));
vi.mock("../components/new-work-picker", () => ({ NewWorkPicker: ({ projectId, workType }) => <div>Picker {projectId} {workType}</div> }));
vi.mock("../components/markdown", () => ({ Markdown: ({ children }) => <div>{children || "No description provided."}</div> }));

import LoginPage from "../app/login/page";
import RegisterPage from "../app/register/page";
import SettingsPage from "../app/settings/page";
import NewProjectPage from "../app/projects/new/page";
import EditProjectPage from "../app/projects/[projectId]/edit/page";
import NewWorkPage from "../app/work/new/page";
import OldNewIssuePage from "../app/issues/new/page";
import OldNewFeaturePage from "../app/features/new/page";
import IssueDetailPage from "../app/issues/[issueId]/page";
import FeatureDetailPage from "../app/features/[featureId]/page";

const html = async (value) => renderToStaticMarkup(await value);

beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((url) => { throw new RedirectError(url); });
    mocks.notFound.mockImplementation(() => { throw new Error("NOT_FOUND"); });
    mocks.auth.mockResolvedValue(null);
    mocks.requireUser.mockResolvedValue({ id: "u1", name: "Andrew", email: "andrew@example.com" });
    mocks.requireMember.mockResolvedValue({ user: { id: "u1" }, membership: { role: "OWNER" } });
});

describe("account and project form routes", () => {
    it("renders login and registration errors and redirects existing sessions", async () => {
        expect(await html(LoginPage({ searchParams: Promise.resolve({ error: "Bad login" }) }))).toContain("Bad login");
        expect(await html(RegisterPage({ searchParams: Promise.resolve({ error: "Bad registration" }) }))).toContain("Bad registration");
        mocks.auth.mockResolvedValue({ user: { id: "u1" } });
        await expect(LoginPage({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({ url: "/dashboard" });
        await expect(RegisterPage({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({ url: "/dashboard" });
    });

    it("renders settings and new-project forms", async () => {
        let output = await html(SettingsPage({ searchParams: Promise.resolve({ error: "Wrong", success: "Changed" }) }));
        expect(output).toContain("Change password");
        expect(output).toContain("Wrong");
        expect(output).toContain("Changed");
        output = await html(NewProjectPage({ searchParams: Promise.resolve({ error: "Missing" }) }));
        expect(output).toContain("Create a project");
        expect(output).toContain("Andrew");
    });

    it("protects and renders project editing", async () => {
        mocks.projectFind.mockResolvedValueOnce(null);
        await expect(EditProjectPage({ params: Promise.resolve({ projectId: "p1" }), searchParams: Promise.resolve({}) })).rejects.toMatchObject({ url: expect.stringContaining("Only%20the%20project%20owner") });
        mocks.projectFind.mockResolvedValueOnce({ id: "p1", ownerId: "u1", name: "Alpha", description: null, owner: { name: "Andrew", email: "andrew@example.com" }, members: [{ user: { email: "maya@example.com" } }] });
        const output = await html(EditProjectPage({ params: Promise.resolve({ projectId: "p1" }), searchParams: Promise.resolve({ success: "Saved" }) }));
        expect(output).toContain("Edit Alpha");
        expect(output).toContain("maya@example.com");
        expect(output).toContain("Saved");
    });
});

describe("new work routes", () => {
    it("redirects legacy issue and feature URLs to the combined route", async () => {
        await expect(OldNewIssuePage({ searchParams: Promise.resolve({ projectId: "p1" }) })).rejects.toMatchObject({ url: "/work/new?type=issue&projectId=p1" });
        await expect(OldNewFeaturePage({ searchParams: Promise.resolve({ projectId: "p1" }) })).rejects.toMatchObject({ url: "/work/new?type=feature&projectId=p1" });
    });

    it("handles no projects, unauthorized choices, and both form types", async () => {
        mocks.choices.mockResolvedValueOnce([]);
        expect(await html(NewWorkPage({ searchParams: Promise.resolve({}) }))).toContain("Create a project first");
        mocks.choices.mockResolvedValueOnce([{ id: "p1", name: "Alpha" }]);
        await expect(NewWorkPage({ searchParams: Promise.resolve({ projectId: "other" }) })).rejects.toMatchObject({ url: expect.stringContaining("Project%20access%20denied") });
        const project = { id: "p1", name: "Alpha", members: [{ user: { id: "u1", name: "Andrew" } }], features: [{ id: "f1", title: "Auth" }], labels: [{ id: "l1", name: "bug", color: "red" }] };
        mocks.choices.mockResolvedValueOnce([{ id: "p1", name: "Alpha" }]); mocks.projectFind.mockResolvedValueOnce(project);
        let output = await html(NewWorkPage({ searchParams: Promise.resolve({ type: "issue", featureId: "f1", error: "Missing title" }) }));
        expect(output).toContain("Linked feature"); expect(output).toContain("Create issue"); expect(output).toContain("Missing title");
        mocks.choices.mockResolvedValueOnce([{ id: "p1", name: "Alpha" }]); mocks.projectFind.mockResolvedValueOnce(project);
        output = await html(NewWorkPage({ searchParams: Promise.resolve({ type: "feature" }) }));
        expect(output).not.toContain("Linked feature"); expect(output).toContain("Create feature");
    });
});

describe("work detail routes", () => {
    const baseProject = { name: "Alpha", members: [{ userId: "u1", user: { id: "u1", name: "Andrew" } }], features: [{ id: "f1", title: "Auth" }], labels: [{ id: "l1", name: "bug" }] };
    const issue = { id: "i1", projectId: "p1", title: "Fix login", description: "Issue text", status: "IN_PROGRESS", priority: "HIGH", assignedTo: "u1", featureId: "f1", dueDate: new Date("2026-07-22T12:00:00"), project: baseProject, issueLabels: [{ labelId: "l1", label: { id: "l1", name: "bug" } }], comments: [{ id: "c1", userId: "u1", body: "Done", createdAt: new Date("2026-07-22T12:00:00"), user: { name: "Andrew" } }] };
    const feature = { id: "f1", projectId: "p1", title: "Auth", description: "Feature text", status: "TODO", priority: "MEDIUM", assignedTo: null, dueDate: null, project: { name: "Alpha", members: baseProject.members, labels: baseProject.labels }, featureLabels: [], issues: [{ id: "i1", title: "Fix login", status: "IN_PROGRESS" }], comments: [] };

    it("returns not found for missing or unauthorized work", async () => {
        mocks.issueFind.mockResolvedValueOnce(null);
        await expect(IssueDetailPage({ params: Promise.resolve({ issueId: "missing" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
        mocks.featureFind.mockResolvedValueOnce(feature); mocks.requireMember.mockResolvedValueOnce(null);
        await expect(FeatureDetailPage({ params: Promise.resolve({ featureId: "f1" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
    });

    it("renders issue read and edit states with owned comments", async () => {
        mocks.issueFind.mockResolvedValueOnce(issue);
        let output = await html(IssueDetailPage({ params: Promise.resolve({ issueId: "i1" }), searchParams: Promise.resolve({}) }));
        expect(output).toContain("Fix login"); expect(output).toContain("IN PROGRESS"); expect(output).toContain("Delete comment"); expect(output).toContain("Feature</dt><dd>Auth");
        mocks.issueFind.mockResolvedValueOnce(issue);
        output = await html(IssueDetailPage({ params: Promise.resolve({ issueId: "i1" }), searchParams: Promise.resolve({ edit: "1" }) }));
        expect(output).toContain("Cancel editing"); expect(output).toContain("Save changes");
    });

    it("renders feature read and edit states, linked work, and empty discussion", async () => {
        mocks.featureFind.mockResolvedValueOnce(feature);
        let output = await html(FeatureDetailPage({ params: Promise.resolve({ featureId: "f1" }), searchParams: Promise.resolve({}) }));
        expect(output).toContain("Unassigned"); expect(output).toContain("Fix login"); expect(output).toContain("No comments yet");
        mocks.featureFind.mockResolvedValueOnce(feature);
        output = await html(FeatureDetailPage({ params: Promise.resolve({ featureId: "f1" }), searchParams: Promise.resolve({ edit: "1" }) }));
        expect(output).toContain("Cancel editing"); expect(output).toContain("Save changes");
    });
});
