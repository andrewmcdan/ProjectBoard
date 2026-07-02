export const boardColumns = [
    {
        id: "todo",
        name: "Todo",
        className: "statusTodo",
        issues: [
            { id: "ISSUE-14", title: "Design project creation form", assignee: "Andrew", priority: "Medium", feature: "Authentication Flow" },
            { id: "ISSUE-15", title: "Add label model to Prisma schema", assignee: "Unassigned", priority: "Low", feature: null },
        ],
        features: [
            { id: "FEATURE-03", title: "Authentication Flow", assignee: "Andrew", priority: "High" },
        ],
    },
    {
        id: "in-progress",
        name: "In Progress",
        className: "statusProgress",
        issues: [
            { id: "ISSUE-11", title: "Build dashboard layout", assignee: "Maya", priority: "High", feature: "Project Dashboard" },
        ],
        features: [
            { id: "FEATURE-01", title: "Project Dashboard", assignee: "Maya", priority: "High" },
        ],
    },
    {
        id: "done",
        name: "Done",
        className: "statusDone",
        issues: [
            { id: "ISSUE-02", title: "Draft term project overview", assignee: "Andrew", priority: "Done", feature: null },
        ],
        features: [
            { id: "FEATURE-00", title: "Term Project Definition", assignee: "Andrew", priority: "Done" },
        ],
    },
];

export const projects = [
    { id: "classboard", name: "ClassBoard", description: "Internet Programming term project", members: 3, openIssues: 3, openFeatures: 2 },
    { id: "capstone-site", name: "Capstone Site", description: "Landing page rebuild for a student team", members: 5, openIssues: 8, openFeatures: 4 },
];

export const comments = [
    { id: 1, author: "Maya", body: "The server-rendered board can start with static columns, then switch to Prisma data." },
    { id: 2, author: "Andrew", body: "Need project membership checks before wiring edit actions." },
];

export const features = [
    { id: "FEATURE-01", title: "Project Dashboard", status: "In Progress", priority: "High", linkedIssues: 1 },
    { id: "FEATURE-03", title: "Authentication Flow", status: "Todo", priority: "High", linkedIssues: 1 },
];
