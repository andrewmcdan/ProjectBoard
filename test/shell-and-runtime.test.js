import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), get: vi.fn(), post: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a> }));
vi.mock("../auth", () => ({ auth: mocks.auth, handlers: { GET: mocks.get, POST: mocks.post } }));
vi.mock("../app/actions", () => ({ logoutAction: vi.fn() }));
vi.mock("../components/primary-nav", () => ({ PrimaryNav: () => <nav>Primary navigation</nav> }));

import RootLayout, { metadata } from "../app/layout";
import { GET, POST } from "../app/api/auth/[...nextauth]/route";
import { SiteShell } from "../components/site-shell";

beforeEach(() => vi.clearAllMocks());

describe("application shell and runtime wiring", () => {
    it("defines metadata and the HTML root layout", () => {
        expect(metadata.title).toContain("ProjectBoard");
        const output = renderToStaticMarkup(<RootLayout><p>Body</p></RootLayout>);
        expect(output).toContain("<html lang=\"en\"");
        expect(output).toContain("Body");
    });

    it("renders guest and signed-in shell variants", async () => {
        mocks.auth.mockResolvedValueOnce(null);
        let output = renderToStaticMarkup(await SiteShell({ children: <p>Page</p> }));
        expect(output).toContain("Sign in");
        expect(output).not.toContain("Primary navigation");
        mocks.auth.mockResolvedValueOnce({ user: { id: "u1", name: "Andrew" } });
        output = renderToStaticMarkup(await SiteShell({ children: <p>Page</p> }));
        expect(output).toContain("Primary navigation");
        expect(output).toContain("Sign out");
    });

    it("re-exports the Auth.js route handlers", () => {
        expect(GET).toBe(mocks.get);
        expect(POST).toBe(mocks.post);
    });
});
