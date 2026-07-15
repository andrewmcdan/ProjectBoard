import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
    // Every password gets its own random salt before scrypt hashes it.
    const salt = randomBytes(16).toString("hex");
    // scrypt derives 64 hard-to-guess bytes, and hex makes those bytes safe to store as text.
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
    // Older/provider-based accounts may not have a local password hash.
    if (!stored?.includes(":")) return false;
    // Destructuring splits the saved "salt:hash" string back into its two pieces.
    const [salt, hash] = stored.split(":");
    const expected = Buffer.from(hash, "hex");
    // Hash the attempted password with the original salt so both byte arrays can be compared.
    const actual = scryptSync(password, salt, expected.length);
    // timingSafeEqual avoids leaking how much of the hash matched.
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
