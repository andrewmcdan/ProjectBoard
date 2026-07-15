import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "../../../components/markdown";
import { SiteShell } from "../../../components/site-shell";
import { requireProjectMember } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { addIssueCommentAction, updateIssueAction } from "../../actions";

export const dynamic = "force-dynamic";

// Adding ?edit=1 swaps the normal read-only details for the edit form.
export default async function IssueDetailPage({ params, searchParams }) {
    const { issueId } = await params;
    const { edit } = await searchParams;
    // Nested includes load the project choices, comments, and labels with the issue in one query.
    const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: {
            project: { include: { members: { include: { user: true } }, features: true, labels: true } },
            comments: { orderBy: { createdAt: "asc" }, include: { user: true } },
            issueLabels: { include: { label: true } },
        },
    });
    if (!issue || !(await requireProjectMember(issue.projectId))) notFound();

    return (
        <SiteShell>
            <section className="page-card">
                <div className="card-heading">
                    <div>
                        <p className="small-heading">
                            <Link href={`/projects/${issue.projectId}`}>{issue.project.name}</Link> · Issue
                        </p>
                        <h1>{issue.title}</h1>
                    </div>
                    {/* This ternary shows Cancel in edit mode and Edit in normal mode. */}
                    {edit === "1" ? (
                        <Link href={`/issues/${issue.id}`} className="plain-button">
                            Cancel editing
                        </Link>
                    ) : (
                        <Link href={`/issues/${issue.id}?edit=1`} className="main-button">
                            Edit
                        </Link>
                    )}
                </div>
                <div className="details-layout">
                    <section className="details-box">
                        <h2>Details</h2>
                        {edit === "1" ? <IssueForm issue={issue} /> : <IssueDetails issue={issue} />}
                    </section>
                    <Discussion comments={issue.comments} issueId={issue.id} />
                </div>
            </section>
        </SiteShell>
    );
}

function IssueDetails({ issue }) {
    // Relations store IDs, so turn them back into names for the read-only view.
    // find returns the matching member; ?. and ?? provide a safe fallback when nobody is assigned.
    const assignee = issue.project.members.find(({ userId }) => userId === issue.assignedTo)?.user.name ?? "Unassigned";
    const feature = issue.project.features.find(({ id }) => id === issue.featureId)?.title ?? "None";
    return (
        <>
            <dl className="read-only-fields">
                <div>
                    <dt>Status</dt>
                    <dd>{issue.status.replace("_", " ")}</dd>
                </div>
                <div>
                    <dt>Priority</dt>
                    <dd>{issue.priority}</dd>
                </div>
                <div>
                    <dt>Assignee</dt>
                    <dd>{assignee}</dd>
                </div>
                <div>
                    <dt>Feature</dt>
                    <dd>{feature}</dd>
                </div>
                <div>
                    <dt>Due date</dt>
                    <dd>{issue.dueDate?.toLocaleDateString() ?? "None"}</dd>
                </div>
                <div>
                    <dt>Labels</dt>
                    <dd className="tag-row">
                        {issue.issueLabels.map(({ label }) => (
                            <span className="tag" key={label.id}>
                                {label.name}
                            </span>
                        ))}
                        {!issue.issueLabels.length ? "None" : null}
                    </dd>
                </div>
            </dl>
            <div className="description-box">
                <h3>Description</h3>
                <Markdown>{issue.description}</Markdown>
            </div>
        </>
    );
}

function IssueForm({ issue }) {
    // Store selected label IDs in a Set so every checkbox can check membership with .has().
    const selected = new Set(issue.issueLabels.map(({ labelId }) => labelId));
    return (
        <form action={updateIssueAction}>
            <input type="hidden" name="issueId" value={issue.id} />
            <label className="form-field">
                <span>Title</span>
                <input name="title" defaultValue={issue.title} required />
            </label>
            <div className="form-fields">
                <label className="form-field">
                    <span>Status</span>
                    <select name="status" defaultValue={issue.status}>
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </label>
                <label className="form-field">
                    <span>Priority</span>
                    <select name="priority" defaultValue={issue.priority}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </label>
                <label className="form-field">
                    <span>Assignee</span>
                    <select name="assignedTo" defaultValue={issue.assignedTo ?? ""}>
                        <option value="">Unassigned</option>
                        {issue.project.members.map(({ user }) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="form-field">
                    <span>Feature</span>
                    <select name="featureId" defaultValue={issue.featureId ?? ""}>
                        <option value="">None</option>
                        {issue.project.features.map((feature) => (
                            <option key={feature.id} value={feature.id}>
                                {feature.title}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="form-field">
                    <span>Due date</span>
                    {/* HTML date inputs need YYYY-MM-DD, so slice removes the time from the ISO string. */}
                    <input name="dueDate" type="date" defaultValue={issue.dueDate?.toISOString().slice(0, 10) ?? ""} />
                </label>
            </div>
            <fieldset className="label-options">
                <legend>Labels</legend>
                {issue.project.labels.map((label) => (
                    <label key={label.id}>
                        <input type="checkbox" name="labelIds" value={label.id} defaultChecked={selected.has(label.id)} /> <span className="tag">{label.name}</span>
                    </label>
                ))}
            </fieldset>
            <label className="form-field">
                <span>Description (Markdown supported)</span>
                <textarea name="description" defaultValue={issue.description ?? ""} maxLength={10000} />
                <small className="subtext">You can use headings, lists, links, quotes, and code.</small>
            </label>
            <div className="button-row">
                <button className="main-button" type="submit">
                    Save changes
                </button>
                <Link href={`/issues/${issue.id}`} className="plain-button">
                    Cancel
                </Link>
            </div>
        </form>
    );
}

function Discussion({ comments, issueId }) {
    // Comments stay editable through a separate form even when issue fields are read-only.
    return (
        <section className="details-box">
            <h2>Discussion</h2>
            <ul className="item-list">
                {comments.map((comment) => (
                    <li className="item-box" key={comment.id}>
                        <strong>{comment.user.name}</strong>
                        <Markdown>{comment.body}</Markdown>
                        <small className="subtext">{comment.createdAt.toLocaleString()}</small>
                    </li>
                ))}
                {!comments.length ? <li className="subtext">No comments yet.</li> : null}
            </ul>
            <form action={addIssueCommentAction}>
                <input type="hidden" name="issueId" value={issueId} />
                <label className="form-field">
                    <span>Add comment (Markdown supported)</span>
                    <textarea name="body" required maxLength={5000} />
                    <small className="subtext">You can use headings, lists, links, quotes, and code.</small>
                </label>
                <div className="button-row">
                    <button className="main-button" type="submit">
                        Comment
                    </button>
                </div>
            </form>
        </section>
    );
}
