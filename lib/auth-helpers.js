import { redirect } from "next/navigation";
import { auth } from "../auth";
import { prisma } from "./prisma";

export async function requireUser() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    return session.user;
}

export async function requireProjectMember(projectId) {
    const user = await requireUser();
    const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (!membership) return null;
    return { user, membership };
}
