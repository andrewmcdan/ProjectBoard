// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ pathname: "/dashboard", push: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a> }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname, useRouter: () => ({ push: mocks.push }) }));

import { Markdown } from "../components/markdown";
import { NewWorkPicker } from "../components/new-work-picker";
import { PrimaryNav } from "../components/primary-nav";
import { SectionCard } from "../components/section-card";

beforeEach(() => vi.clearAllMocks());

describe("shared components", () => {
    it("renders Markdown, GFM, and its empty fallback", () => {
        const { rerender } = render(<Markdown>{"# Heading\n\n- one\n- two\n\n~~old~~"}</Markdown>);
        expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
        expect(screen.getByText("old").tagName).toBe("DEL");
        rerender(<Markdown>{"   "}</Markdown>);
        expect(screen.getByText("No description provided.")).toBeInTheDocument();
        rerender(<Markdown empty="Nothing here">{null}</Markdown>);
        expect(screen.getByText("Nothing here")).toBeInTheDocument();
    });

    it("renders a section card with optional eyebrow and actions", () => {
        render(<SectionCard title="Projects" eyebrow="Dashboard" actions={<button>New</button>}><p>Body</p></SectionCard>);
        expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
        expect(screen.getByText("Body")).toBeInTheDocument();
    });

    it("marks the active primary navigation item", () => {
        render(<PrimaryNav />);
        expect(screen.getByRole("link", { name: "Dashboard" })).toHaveClass("current-page");
        expect(screen.getByRole("link", { name: "New Issue or Feature" })).not.toHaveClass("current-page");
    });

    it("builds a new-work URL from controlled selections", () => {
        render(<NewWorkPicker projects={[{ id: "p1", name: "Alpha" }, { id: "p2", name: "Beta" }]} projectId="p1" workType="issue" />);
        fireEvent.change(screen.getByLabelText("What are you creating?"), { target: { value: "feature" } });
        expect(mocks.push).toHaveBeenCalledWith("/work/new?type=feature&projectId=p1");
        fireEvent.change(screen.getByLabelText("Project"), { target: { value: "p2" } });
        expect(mocks.push).toHaveBeenCalledWith("/work/new?type=issue&projectId=p2");
    });
});
