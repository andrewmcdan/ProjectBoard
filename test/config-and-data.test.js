import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";
import { boardColumns, comments, features, projects } from "../lib/mock-data";

describe("static configuration and sample data", () => {
    it("builds standalone output and permits configured development origins", () => {
        expect(nextConfig.output).toBe("standalone");
        expect(nextConfig.allowedDevOrigins).toContain("10.0.6.37");
    });

    it("exposes complete legacy sample collections", () => {
        expect(boardColumns.map(({ id }) => id)).toEqual(["todo", "in-progress", "done"]);
        expect(projects.length).toBeGreaterThan(0);
        expect(features.every((feature) => feature.id && feature.title && feature.status)).toBe(true);
        expect(comments.every((comment) => comment.id && comment.author && comment.body)).toBe(true);
    });
});
