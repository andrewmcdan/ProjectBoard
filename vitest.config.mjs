import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { transformWithEsbuild } from "vite";

const jsxInJs = {
    name: "jsx-in-js",
    enforce: "pre",
    async transform(code, id) {
        if (!/\/(app|components|test)\/.*\.js$/.test(id)) return null;
        return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
    },
};

export default defineConfig({
    plugins: [jsxInJs, react()],
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./test/setup.js"],
        clearMocks: true,
        restoreMocks: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: ["app/**/*.{js,mjs}", "components/**/*.js", "lib/**/*.js", "auth.js", "next.config.mjs"],
            exclude: ["app/globals.css", "prisma/seed.mjs"],
        },
    },
});
