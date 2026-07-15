import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import { verifyPassword } from "./lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        Credentials({
            credentials: { email: {}, password: {} },
            async authorize(credentials) {
                const email = String(credentials?.email ?? "").trim().toLowerCase();
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user || !verifyPassword(String(credentials?.password ?? ""), user.passwordHash)) return null;
                return { id: user.id, name: user.name, email: user.email };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (session.user) session.user.id = token.id;
            return session;
        },
    },
});
