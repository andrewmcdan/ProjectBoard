import Link from "next/link";
import { redirect } from "next/navigation";
import { NewWorkPicker } from "../../../components/new-work-picker";
import { SiteShell } from "../../../components/site-shell";
import { requireUser } from "../../../lib/auth-helpers";
import { getUserProjectChoices } from "../../../lib/project-data";
import { prisma } from "../../../lib/prisma";
import { createFeatureAction, createIssueAction } from "../../actions";

// Issues and features share this page because most of their creation fields are the same.
export default async function NewWorkPage({ searchParams }) {
    const { type, projectId: requestedProjectId, featureId = "", error } = await searchParams;
    // Anything besides the exact word "feature" falls back to the safer default of issue.
    const workType = type === "feature" ? "feature" : "issue";
    const user = await requireUser();
    const projects = await getUserProjectChoices(user.id);
    if (!projects.length) return <NoProjects />;

    // Use the URL's project when provided, or start with the first project in the dropdown.
    const projectId = requestedProjectId || projects[0].id;
    // some() confirms the requested ID belongs to the signed-in user's allowed projects.
    if (!projects.some((project) => project.id === projectId)) redirect("/dashboard?error=Project%20access%20denied");
    // Features are included because only issue creation needs the linked-feature dropdown.
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: { include: { user: true } }, features: { orderBy: { title: "asc" } }, labels: true } });
    const isIssue = workType === "issue";

    return (
        <SiteShell>
            <section className="page-card">
                <p className="small-heading">{project.name}</p>
                <h1>Create an issue or feature</h1>
                <NewWorkPicker projects={projects} projectId={projectId} workType={workType} />
                {error ? <p className="error-box">{error}</p> : null}
                {/* The selected type decides which server action receives this shared form. */}
                <form action={isIssue ? createIssueAction : createFeatureAction}>
                    <input type="hidden" name="projectId" value={projectId} />
                    <div className="form-fields">
                        <label className="form-field">
                            <span>Title</span>
                            <input name="title" required maxLength={180} />
                        </label>
                        <label className="form-field">
                            <span>Status</span>
                            <select name="status">
                                <option value="TODO">Todo</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span>Priority</span>
                            <select name="priority">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span>Assignee</span>
                            <select name="assignedTo">
                                <option value="">Unassigned</option>
                                {project.members.map(({ user: member }) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span>Due date</span>
                            <input name="dueDate" type="date" />
                        </label>
                        {/* Features contain issues, so this relationship only belongs on the issue form. */}
                        {isIssue ? (
                            <label className="form-field">
                                <span>Linked feature</span>
                                <select name="featureId" defaultValue={featureId}>
                                    <option value="">None</option>
                                    {project.features.map((feature) => (
                                        <option key={feature.id} value={feature.id}>
                                            {feature.title}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}
                    </div>
                    {/* Do not show an empty label box when the project has no labels. */}
                    {project.labels.length ? (
                        <fieldset className="label-options">
                            <legend>Labels</legend>
                            {project.labels.map((label) => (
                                <label key={label.id}>
                                    <input type="checkbox" name="labelIds" value={label.id} />{" "}
                                    <span className="tag" style={{ borderColor: label.color }}>
                                        {label.name}
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    ) : null}
                    <label className="form-field">
                        <span>Description (Markdown supported)</span>
                        <textarea name="description" maxLength={10000} />
                        <small className="subtext">You can use headings, lists, links, quotes, and code.</small>
                    </label>
                    <div className="button-row">
                        <button className="main-button" type="submit">
                            Create {workType}
                        </button>
                    </div>
                </form>
            </section>
        </SiteShell>
    );
}

// A user with no memberships needs a project before either create action can work.
function NoProjects() {
    return (
        <SiteShell>
            <section className="page-card">
                <p className="small-heading">New work</p>
                <h1>Create a project first</h1>
                <p className="subtext">You need to belong to a project before adding an issue or feature.</p>
                <div className="button-row">
                    <Link href="/projects/new" className="main-button">
                        Create project
                    </Link>
                </div>
            </section>
        </SiteShell>
    );
}
