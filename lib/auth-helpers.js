import { redirect } from "next/navigation";
import { auth } from "../auth";
import { prisma } from "./prisma";

export async function requireUser() {
    // Protected pages call this helper instead of repeating the same redirect logic.
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    return session.user;
}

export async function requireProjectMember(projectId) {
    const user = await requireUser();
    // Finding the compound key is faster and clearer than loading every project member.
    const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (!membership) return null;
    return { user, membership };
}
