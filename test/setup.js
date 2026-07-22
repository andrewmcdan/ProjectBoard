import "@testing-library/jest-dom/vitest";

process.env.AUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||= "mysql://test:test@localhost:3306/projectboard_test";
