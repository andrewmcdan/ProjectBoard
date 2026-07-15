import { prisma } from "./prisma";

const statusMeta = {
    TODO: { id: "todo", name: "Todo", className: "statusTodo" },
    IN_PROGRESS: { id: "in-progress", name: "In Progress", className: "statusProgress" },
    DONE: { id: "done", name: "Done", className: "statusDone" },
};

// These lightweight choices power the project dropdowns on the new work-item pages.
export async function getUserProjectChoices(userId) {
    return prisma.project.findMany({
        where: { members: { some: { userId } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });
}

// Build the smaller project summaries used by both the homepage and dashboard.
export async function getDashboardProjects(userId) {
    const projects = await prisma.project.findMany({
        // `some` means Prisma only returns projects with at least one membership for this user.
        where: { members: { some: { userId } } },
        orderBy: { createdAt: "asc" },
        include: {
            members: { where: { userId }, select: { role: true } },
            issues: { select: { status: true } },
            features: { select: { status: true } },
            _count: {
                select: {
                    members: true,
                },
            },
        },
    });

    return projects.map((project) => {
        // Issues and features share statuses, so combining them makes totals easy to calculate.
        const work = [...project.issues, ...project.features];
        // filter keeps matching work items, and length turns that filtered array into a count.
        const countStatus = (status) => work.filter((item) => item.status === status).length;

        return {
            id: project.id,
            name: project.name,
            description: project.description ?? "No description yet.",
            members: project._count.members,
            issues: project.issues.length,
            features: project.features.length,
            openIssues: project.issues.filter((issue) => issue.status !== "DONE").length,
            openFeatures: project.features.filter((feature) => feature.status !== "DONE").length,
            todo: countStatus("TODO"),
            inProgress: countStatus("IN_PROGRESS"),
            done: countStatus("DONE"),
            totalWork: work.length,
            // ?. safely handles a missing membership row instead of trying to read role from undefined.
            canEdit: project.members[0]?.role === "OWNER",
        };
    });
}

// Load everything needed for the three project board columns.
export async function getProjectBoard(projectId, userId) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            members: { include: { user: { select: { id: true, name: true } } } },
            issues: {
                orderBy: { createdAt: "asc" },
                include: {
                    assignee: {
                        select: { name: true },
                    },
                    feature: {
                        select: { title: true },
                    },
                },
            },
            features: {
                orderBy: { createdAt: "asc" },
                include: {
                    assignee: {
                        select: { name: true },
                    },
                },
            },
        },
    });

    if (!project) {
        return null;
    }
    // Returning null here keeps project data hidden from non-members.
    if (!project.members.some((member) => member.userId === userId)) return null;

    // Convert database status values into the Todo, In Progress, and Done UI columns.
    // Object.keys gives the three status names, and map builds one complete UI column for each one.
    const boardColumns = Object.keys(statusMeta).map((statusKey) => ({
        ...statusMeta[statusKey],
        // Each chain first keeps work for this status, then reshapes it into only what a card needs.
        issues: project.issues
            .filter((issue) => issue.status === statusKey)
            .map((issue) => ({
                id: issue.id,
                title: issue.title,
                assignee: issue.assignee?.name ?? "Unassigned",
                priority: issue.priority,
                feature: issue.feature?.title ?? null,
            })),
        features: project.features
            .filter((feature) => feature.status === statusKey)
            .map((feature) => ({
                id: feature.id,
                title: feature.title,
                assignee: feature.assignee?.name ?? "Unassigned",
                priority: feature.priority,
            })),
    }));

    return {
        id: project.id,
        name: project.name,
        description: project.description ?? "No description yet.",
        members: project.members.map((member) => ({ id: member.user.id, name: member.user.name, role: member.role })),
        boardColumns,
    };
}
