import { PrismaClient, IssuePriority, IssueStatus, ProjectRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.featureLabel.deleteMany();
    await prisma.issueLabel.deleteMany();
    await prisma.featureComment.deleteMany();
    await prisma.issueComment.deleteMany();
    await prisma.issue.deleteMany();
    await prisma.feature.deleteMany();
    await prisma.label.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const andrew = await prisma.user.create({
        data: {
            id: "user-andrew",
            name: "Andrew",
            email: "andrew@example.com",
        },
    });

    const maya = await prisma.user.create({
        data: {
            id: "user-maya",
            name: "Maya",
            email: "maya@example.com",
        },
    });

    const project = await prisma.project.create({
        data: {
            id: "classboard",
            name: "ClassBoard",
            description: "Internet Programming term project scaffold backed by MariaDB.",
            ownerId: andrew.id,
            members: {
                create: [
                    { userId: andrew.id, role: ProjectRole.OWNER },
                    { userId: maya.id, role: ProjectRole.MEMBER },
                ],
            },
            labels: {
                create: [
                    { id: "label-priority", name: "priority", color: "#b94c35" },
                    { id: "label-ui", name: "ui", color: "#2f7d5a" },
                ],
            },
        },
    });

    const dashboardFeature = await prisma.feature.create({
        data: {
            id: "FEATURE-01",
            projectId: project.id,
            title: "Project Dashboard",
            description: "Show a basic dashboard and board pulled from the database.",
            status: IssueStatus.IN_PROGRESS,
            priority: IssuePriority.HIGH,
            assignedTo: maya.id,
            createdBy: andrew.id,
        },
    });

    const authFeature = await prisma.feature.create({
        data: {
            id: "FEATURE-03",
            projectId: project.id,
            title: "Authentication Flow",
            description: "Placeholder feature for login and registration work.",
            status: IssueStatus.TODO,
            priority: IssuePriority.HIGH,
            assignedTo: andrew.id,
            createdBy: andrew.id,
        },
    });

    await prisma.issue.createMany({
        data: [
            {
                id: "ISSUE-11",
                projectId: project.id,
                featureId: dashboardFeature.id,
                title: "Build dashboard layout",
                description: "Render dashboard cards from Prisma data.",
                status: IssueStatus.IN_PROGRESS,
                priority: IssuePriority.HIGH,
                assignedTo: maya.id,
                createdBy: andrew.id,
            },
            {
                id: "ISSUE-14",
                projectId: project.id,
                featureId: authFeature.id,
                title: "Design project creation form",
                description: "Create the initial placeholder form for projects.",
                status: IssueStatus.TODO,
                priority: IssuePriority.MEDIUM,
                assignedTo: andrew.id,
                createdBy: andrew.id,
            },
            {
                id: "ISSUE-15",
                projectId: project.id,
                title: "Add label model to Prisma schema",
                description: "Extend the scaffold schema with basic label support.",
                status: IssueStatus.TODO,
                priority: IssuePriority.LOW,
                createdBy: andrew.id,
            },
        ],
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
