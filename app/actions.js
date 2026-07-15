"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../auth";
import { requireProjectMember, requireUser } from "../lib/auth-helpers";
import { hashPassword, verifyPassword } from "../lib/password";
import { prisma } from "../lib/prisma";

// FormData can return null or a File, so this turns the value into trimmed text every time.
const text = (form, key) => String(form.get(key) ?? "").trim();
const optional = (value) => value || null;
// getAll collects every checked box with this name, then the chain cleans up empty values.
const selectedLabels = (form) => form.getAll("labelIds").map(String).filter(Boolean);

// Authentication actions redirect directly because they finish the current request.
export async function loginAction(formData) {
    try {
        await signIn("credentials", { email: text(formData, "email"), password: text(formData, "password"), redirectTo: "/dashboard" });
    } catch (error) {
        // Auth.js throws AuthError for a bad login; other errors are thrown again so bugs are not hidden.
        if (error instanceof AuthError) redirect("/login?error=Invalid%20email%20or%20password");
        throw error;
    }
}

export async function registerAction(formData) {
    const name = text(formData, "name");
    const email = text(formData, "email").toLowerCase();
    const password = text(formData, "password");
    // The || operators make this fail when even one registration requirement is not met.
    if (name.length < 2 || !email.includes("@") || password.length < 8) redirect("/register?error=Use%20a%20valid%20name%2C%20email%2C%20and%208-character%20password");
    if (await prisma.user.findUnique({ where: { email } })) redirect("/register?error=That%20email%20is%20already%20registered");
    await prisma.user.create({ data: { name, email, passwordHash: hashPassword(password) } });
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/" });
}

export async function changePasswordAction(formData) {
    const sessionUser = await requireUser();
    const currentPassword = text(formData, "currentPassword");
    const newPassword = text(formData, "newPassword");
    const confirmPassword = text(formData, "confirmPassword");
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

    // Always verify the old password before allowing a credential change.
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
        redirect("/settings?error=Current%20password%20is%20incorrect");
    }
    if (newPassword.length < 8) {
        redirect("/settings?error=New%20password%20must%20be%20at%20least%208%20characters");
    }
    if (newPassword !== confirmPassword) {
        redirect("/settings?error=New%20password%20and%20confirmation%20do%20not%20match");
    }
    if (verifyPassword(newPassword, user.passwordHash)) {
        redirect("/settings?error=New%20password%20must%20be%20different%20from%20the%20current%20password");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(newPassword) },
    });
    revalidatePath("/settings");
    redirect("/settings?success=Password%20updated%20successfully");
}

export async function createProjectAction(formData) {
    const user = await requireUser();
    const name = text(formData, "name");
    if (!name) redirect("/projects/new?error=Project%20name%20is%20required");
    // Split on commas or new lines, normalize each email, remove blanks/the owner, and use Set to remove duplicates.
    const memberEmails = [
        ...new Set(
            text(formData, "memberEmails")
                .split(/[\n,]+/)
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email && email !== user.email.toLowerCase()),
        ),
    ];
    // The ternary skips the database query when the user left the team list empty.
    const memberUsers = memberEmails.length
        ? await prisma.user.findMany({
              where: { email: { in: memberEmails } },
              select: { id: true, email: true },
          })
        : [];
    // A Set makes it quick to compare requested emails with the accounts Prisma found.
    const foundEmails = new Set(memberUsers.map(({ email }) => email.toLowerCase()));
    const missingEmails = memberEmails.filter((email) => !foundEmails.has(email));

    if (missingEmails.length) {
        const message = encodeURIComponent(`No registered account found for: ${missingEmails.join(", ")}`);
        redirect(`/projects/new?error=${message}`);
    }

    // Create the project, initial team, and starter labels in one database query.
    const project = await prisma.project.create({
        data: {
            name,
            description: optional(text(formData, "description")),
            ownerId: user.id,
            // The spread operator adds the mapped member rows after the owner's row in this array.
            members: { create: [{ userId: user.id, role: "OWNER" }, ...memberUsers.map(({ id }) => ({ userId: id, role: "MEMBER" }))] },
            labels: {
                create: [
                    { name: "bug", color: "#b94c35" },
                    { name: "enhancement", color: "#2f7d5a" },
                    { name: "priority", color: "#9a6b22" },
                ],
            },
        },
    });
    redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(formData) {
    const user = await requireUser();
    const projectId = text(formData, "projectId");
    const name = text(formData, "name");
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { owner: { select: { email: true } } },
    });

    // Only the owner can change project settings or decide who has access.
    if (!project || project.ownerId !== user.id) {
        redirect("/dashboard?error=Only%20the%20project%20owner%20can%20edit%20that%20project");
    }
    if (!name) redirect(`/projects/${projectId}/edit?error=Project%20name%20is%20required`);

    // This is the same cleanup used at creation, except the current project's owner is filtered out.
    const memberEmails = [
        ...new Set(
            text(formData, "memberEmails")
                .split(/[\n,]+/)
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email && email !== project.owner.email.toLowerCase()),
        ),
    ];
    const memberUsers = memberEmails.length
        ? await prisma.user.findMany({
              where: { email: { in: memberEmails } },
              select: { id: true, email: true },
          })
        : [];
    const foundEmails = new Set(memberUsers.map(({ email }) => email.toLowerCase()));
    const missingEmails = memberEmails.filter((email) => !foundEmails.has(email));

    if (missingEmails.length) {
        const message = encodeURIComponent(`No registered account found for: ${missingEmails.join(", ")}`);
        redirect(`/projects/${projectId}/edit?error=${message}`);
    }

    // The textarea is the complete member list, so replace old MEMBER rows with this list.
    // The transaction means all three membership edits succeed together or all get rolled back.
    await prisma.$transaction(async (tx) => {
        await tx.project.update({
            where: { id: projectId },
            data: { name, description: optional(text(formData, "description")) },
        });
        await tx.projectMember.deleteMany({ where: { projectId, role: "MEMBER" } });
        if (memberUsers.length) {
            await tx.projectMember.createMany({
                data: memberUsers.map(({ id }) => ({ projectId, userId: id, role: "MEMBER" })),
                skipDuplicates: true,
            });
        }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);
    redirect(`/projects/${projectId}/edit?success=Project%20updated%20successfully`);
}

async function workContext(formData) {
    // Every work-item mutation goes through the same project membership check.
    const projectId = text(formData, "projectId");
    const access = await requireProjectMember(projectId);
    if (!access) redirect("/dashboard?error=Project%20access%20denied");
    return { projectId, user: access.user };
}

export async function createIssueAction(formData) {
    const { projectId, user } = await workContext(formData);
    const title = text(formData, "title");
    if (!title) redirect(`/work/new?type=issue&projectId=${projectId}&error=Title%20is%20required`);
    const labelIds = selectedLabels(formData);
    const issue = await prisma.issue.create({
        data: {
            projectId,
            title,
            description: optional(text(formData, "description")),
            status: text(formData, "status") || "TODO",
            priority: text(formData, "priority") || "MEDIUM",
            assignedTo: optional(text(formData, "assignedTo")),
            featureId: optional(text(formData, "featureId")),
            // Noon avoids a date appearing one day early when local timezone conversion happens.
            dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null,
            createdBy: user.id,
            issueLabels: { create: labelIds.map((labelId) => ({ labelId })) },
        },
    });
    revalidatePath(`/projects/${projectId}`);
    redirect(`/issues/${issue.id}`);
}

export async function updateIssueAction(formData) {
    const issueId = text(formData, "issueId");
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    // Short-circuiting stops before the membership lookup when the issue does not exist.
    if (!issue || !(await requireProjectMember(issue.projectId))) redirect("/dashboard?error=Issue%20access%20denied");
    // Replace label joins and update the issue together so they cannot get out of sync.
    // Passing an array makes Prisma run label deletion and the issue update as one transaction.
    await prisma.$transaction([
        prisma.issueLabel.deleteMany({ where: { issueId } }),
        prisma.issue.update({
            where: { id: issueId },
            data: {
                title: text(formData, "title"),
                description: optional(text(formData, "description")),
                status: text(formData, "status"),
                priority: text(formData, "priority"),
                assignedTo: optional(text(formData, "assignedTo")),
                featureId: optional(text(formData, "featureId")),
                dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null,
                issueLabels: { create: selectedLabels(formData).map((labelId) => ({ labelId })) },
            },
        }),
    ]);
    revalidatePath(`/issues/${issueId}`);
    revalidatePath(`/projects/${issue.projectId}`);
    redirect(`/issues/${issueId}`);
}

export async function addIssueCommentAction(formData) {
    const issueId = text(formData, "issueId");
    const body = text(formData, "body");
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue || !(await requireProjectMember(issue.projectId))) redirect("/dashboard?error=Issue%20access%20denied");
    // The nested await gets the signed-in user's ID before Prisma creates the comment row.
    if (body) await prisma.issueComment.create({ data: { issueId, userId: (await requireUser()).id, body } });
    revalidatePath(`/issues/${issueId}`);
}

export async function createFeatureAction(formData) {
    const { projectId, user } = await workContext(formData);
    const title = text(formData, "title");
    if (!title) redirect(`/work/new?type=feature&projectId=${projectId}&error=Title%20is%20required`);
    const feature = await prisma.feature.create({
        data: {
            projectId,
            title,
            description: optional(text(formData, "description")),
            status: text(formData, "status") || "TODO",
            priority: text(formData, "priority") || "MEDIUM",
            assignedTo: optional(text(formData, "assignedTo")),
            // The ternary stores a real Date when filled in and database null when left blank.
            dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null,
            createdBy: user.id,
            // map turns checkbox values into the small objects Prisma needs for join-table rows.
            featureLabels: { create: selectedLabels(formData).map((labelId) => ({ labelId })) },
        },
    });
    revalidatePath(`/projects/${projectId}`);
    redirect(`/features/${feature.id}`);
}

export async function updateFeatureAction(formData) {
    const featureId = text(formData, "featureId");
    const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    // If the feature is missing, || prevents the code from trying to read its project ID.
    if (!feature || !(await requireProjectMember(feature.projectId))) redirect("/dashboard?error=Feature%20access%20denied");
    // Feature labels use the same delete-and-recreate transaction as issue labels.
    // Both promises are passed to Prisma so label changes and field changes stay in sync.
    await prisma.$transaction([
        prisma.featureLabel.deleteMany({ where: { featureId } }),
        prisma.feature.update({
            where: { id: featureId },
            data: {
                title: text(formData, "title"),
                description: optional(text(formData, "description")),
                status: text(formData, "status"),
                priority: text(formData, "priority"),
                assignedTo: optional(text(formData, "assignedTo")),
                dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null,
                featureLabels: { create: selectedLabels(formData).map((labelId) => ({ labelId })) },
            },
        }),
    ]);
    revalidatePath(`/features/${featureId}`);
    revalidatePath(`/projects/${feature.projectId}`);
    redirect(`/features/${featureId}`);
}

export async function addFeatureCommentAction(formData) {
    const featureId = text(formData, "featureId");
    const body = text(formData, "body");
    const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature || !(await requireProjectMember(feature.projectId))) redirect("/dashboard?error=Feature%20access%20denied");
    if (body) await prisma.featureComment.create({ data: { featureId, userId: (await requireUser()).id, body } });
    revalidatePath(`/features/${featureId}`);
}
