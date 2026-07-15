"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../auth";
import { requireProjectMember, requireUser } from "../lib/auth-helpers";
import { hashPassword } from "../lib/password";
import { prisma } from "../lib/prisma";

const text = (form, key) => String(form.get(key) ?? "").trim();
const optional = (value) => value || null;
const selectedLabels = (form) => form.getAll("labelIds").map(String).filter(Boolean);

export async function loginAction(formData) {
    try {
        await signIn("credentials", { email: text(formData, "email"), password: text(formData, "password"), redirectTo: "/dashboard" });
    } catch (error) {
        if (error instanceof AuthError) redirect("/login?error=Invalid%20email%20or%20password");
        throw error;
    }
}

export async function registerAction(formData) {
    const name = text(formData, "name");
    const email = text(formData, "email").toLowerCase();
    const password = text(formData, "password");
    if (name.length < 2 || !email.includes("@") || password.length < 8) redirect("/register?error=Use%20a%20valid%20name%2C%20email%2C%20and%208-character%20password");
    if (await prisma.user.findUnique({ where: { email } })) redirect("/register?error=That%20email%20is%20already%20registered");
    await prisma.user.create({ data: { name, email, passwordHash: hashPassword(password) } });
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/" });
}

export async function createProjectAction(formData) {
    const user = await requireUser();
    const name = text(formData, "name");
    if (!name) redirect("/projects/new?error=Project%20name%20is%20required");
    const project = await prisma.project.create({ data: { name, description: optional(text(formData, "description")), ownerId: user.id, members: { create: { userId: user.id, role: "OWNER" } }, labels: { create: [{ name: "bug", color: "#b94c35" }, { name: "enhancement", color: "#2f7d5a" }, { name: "priority", color: "#9a6b22" }] } } });
    redirect(`/projects/${project.id}`);
}

async function workContext(formData) {
    const projectId = text(formData, "projectId");
    const access = await requireProjectMember(projectId);
    if (!access) redirect("/dashboard?error=Project%20access%20denied");
    return { projectId, user: access.user };
}

export async function createIssueAction(formData) {
    const { projectId, user } = await workContext(formData);
    const title = text(formData, "title");
    if (!title) redirect(`/issues/new?projectId=${projectId}&error=Title%20is%20required`);
    const labelIds = selectedLabels(formData);
    const issue = await prisma.issue.create({ data: { projectId, title, description: optional(text(formData, "description")), status: text(formData, "status") || "TODO", priority: text(formData, "priority") || "MEDIUM", assignedTo: optional(text(formData, "assignedTo")), featureId: optional(text(formData, "featureId")), dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null, createdBy: user.id, issueLabels: { create: labelIds.map((labelId) => ({ labelId })) } } });
    revalidatePath(`/projects/${projectId}`);
    redirect(`/issues/${issue.id}`);
}

export async function updateIssueAction(formData) {
    const issueId = text(formData, "issueId");
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue || !(await requireProjectMember(issue.projectId))) redirect("/dashboard?error=Issue%20access%20denied");
    await prisma.$transaction([prisma.issueLabel.deleteMany({ where: { issueId } }), prisma.issue.update({ where: { id: issueId }, data: { title: text(formData, "title"), description: optional(text(formData, "description")), status: text(formData, "status"), priority: text(formData, "priority"), assignedTo: optional(text(formData, "assignedTo")), featureId: optional(text(formData, "featureId")), dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null, issueLabels: { create: selectedLabels(formData).map((labelId) => ({ labelId })) } } })]);
    revalidatePath(`/issues/${issueId}`); revalidatePath(`/projects/${issue.projectId}`);
}

export async function addIssueCommentAction(formData) {
    const issueId = text(formData, "issueId"); const body = text(formData, "body");
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue || !(await requireProjectMember(issue.projectId))) redirect("/dashboard?error=Issue%20access%20denied");
    if (body) await prisma.issueComment.create({ data: { issueId, userId: (await requireUser()).id, body } });
    revalidatePath(`/issues/${issueId}`);
}

export async function createFeatureAction(formData) {
    const { projectId, user } = await workContext(formData); const title = text(formData, "title");
    if (!title) redirect(`/features/new?projectId=${projectId}&error=Title%20is%20required`);
    const feature = await prisma.feature.create({ data: { projectId, title, description: optional(text(formData, "description")), status: text(formData, "status") || "TODO", priority: text(formData, "priority") || "MEDIUM", assignedTo: optional(text(formData, "assignedTo")), dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null, createdBy: user.id, featureLabels: { create: selectedLabels(formData).map((labelId) => ({ labelId })) } } });
    revalidatePath(`/projects/${projectId}`); redirect(`/features/${feature.id}`);
}

export async function updateFeatureAction(formData) {
    const featureId = text(formData, "featureId"); const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature || !(await requireProjectMember(feature.projectId))) redirect("/dashboard?error=Feature%20access%20denied");
    await prisma.$transaction([prisma.featureLabel.deleteMany({ where: { featureId } }), prisma.feature.update({ where: { id: featureId }, data: { title: text(formData, "title"), description: optional(text(formData, "description")), status: text(formData, "status"), priority: text(formData, "priority"), assignedTo: optional(text(formData, "assignedTo")), dueDate: text(formData, "dueDate") ? new Date(`${text(formData, "dueDate")}T12:00:00`) : null, featureLabels: { create: selectedLabels(formData).map((labelId) => ({ labelId })) } } })]);
    revalidatePath(`/features/${featureId}`); revalidatePath(`/projects/${feature.projectId}`);
}

export async function addFeatureCommentAction(formData) {
    const featureId = text(formData, "featureId"); const body = text(formData, "body"); const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature || !(await requireProjectMember(feature.projectId))) redirect("/dashboard?error=Feature%20access%20denied");
    if (body) await prisma.featureComment.create({ data: { featureId, userId: (await requireUser()).id, body } });
    revalidatePath(`/features/${featureId}`);
}
