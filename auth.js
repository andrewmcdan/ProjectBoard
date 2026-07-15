import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import { verifyPassword } from "./lib/password";

// Auth.js handles the session cookie, while our credentials provider checks users in MariaDB.
export const { handlers, auth, signIn, signOut } = NextAuth({
    // JWT sessions keep authentication simple because we do not need a session table.
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        Credentials({
            credentials: { email: {}, password: {} },
            async authorize(credentials) {
                // Emails are stored lowercase so login is not case-sensitive.
                const email = String(credentials?.email ?? "")
                    .trim()
                    .toLowerCase();
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user || !verifyPassword(String(credentials?.password ?? ""), user.passwordHash)) return null;
                return { id: user.id, name: user.name, email: user.email };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            // Copy the database ID into the token when a user first signs in.
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            // Server components use this ID for project membership checks.
            if (session.user) session.user.id = token.id;
            return session;
        },
    },
});
