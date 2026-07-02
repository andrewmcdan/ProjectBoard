import { prisma } from "./prisma";

const statusMeta = {
    TODO: { id: "todo", name: "Todo", className: "statusTodo" },
    IN_PROGRESS: { id: "in-progress", name: "In Progress", className: "statusProgress" },
    DONE: { id: "done", name: "Done", className: "statusDone" },
};

export async function getDashboardProjects() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            _count: {
                select: {
                    members: true,
                    issues: true,
                    features: true,
                },
            },
        },
    });

    return projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description ?? "No description yet.",
        members: project._count.members,
        openIssues: project._count.issues,
        openFeatures: project._count.features,
    }));
}

export async function getProjectBoard(projectId) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
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

    const boardColumns = Object.keys(statusMeta).map((statusKey) => ({
        ...statusMeta[statusKey],
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
        boardColumns,
    };
}
