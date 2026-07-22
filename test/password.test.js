import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("password helpers", () => {
    it("creates salted hashes and verifies only the correct password", () => {
        const first = hashPassword("correct horse battery staple");
        const second = hashPassword("correct horse battery staple");
        expect(first).not.toBe(second);
        expect(first).toMatch(/^[a-f0-9]{32}:[a-f0-9]{128}$/);
        expect(verifyPassword("correct horse battery staple", first)).toBe(true);
        expect(verifyPassword("wrong", first)).toBe(false);
    });

    it.each([null, undefined, "", "not-a-hash"])("rejects malformed stored value %s", (stored) => {
        expect(verifyPassword("password", stored)).toBe(false);
    });
});
