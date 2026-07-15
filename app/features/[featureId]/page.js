import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "../../../components/markdown";
import { SiteShell } from "../../../components/site-shell";
import { requireProjectMember } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { addFeatureCommentAction, updateFeatureAction } from "../../actions";

export const dynamic = "force-dynamic";

// Adding ?edit=1 swaps the normal read-only details for the edit form.
export default async function FeatureDetailPage({ params, searchParams }) {
    const { featureId } = await params;
    const { edit } = await searchParams;
    const feature = await prisma.feature.findUnique({ where: { id: featureId }, include: { project: { include: { members: { include: { user: true } }, labels: true } }, featureLabels: { include: { label: true } }, issues: { orderBy: { createdAt: "asc" } }, comments: { orderBy: { createdAt: "asc" }, include: { user: true } } } });
    if (!feature || !(await requireProjectMember(feature.projectId))) notFound();

    return <SiteShell><section className="page-card"><div className="card-heading"><div><p className="small-heading"><Link href={`/projects/${feature.projectId}`}>{feature.project.name}</Link> · Feature</p><h1>{feature.title}</h1></div>{edit === "1" ? <Link href={`/features/${feature.id}`} className="plain-button">Cancel editing</Link> : <Link href={`/features/${feature.id}?edit=1`} className="main-button">Edit</Link>}</div><div className="details-layout"><section className="details-box"><h2>Details</h2>{edit === "1" ? <FeatureForm feature={feature} /> : <FeatureDetails feature={feature} />}<h3>Linked issues</h3><ul className="item-list">{feature.issues.map((issue) => <li className="item-box" key={issue.id}><Link href={`/issues/${issue.id}`}>{issue.title}</Link> <span className="tag">{issue.status.replace("_", " ")}</span></li>)}{!feature.issues.length ? <li className="subtext">No linked issues.</li> : null}</ul><div className="button-row"><Link className="plain-button" href={`/issues/new?projectId=${feature.projectId}&featureId=${feature.id}`}>Create linked issue</Link></div></section><Discussion comments={feature.comments} featureId={feature.id} /></div></section></SiteShell>;
}

function FeatureDetails({ feature }) {
    // Look up the assignee's display name from the project's member list.
    const assignee = feature.project.members.find(({ userId }) => userId === feature.assignedTo)?.user.name ?? "Unassigned";
    return <><dl className="read-only-fields"><div><dt>Status</dt><dd>{feature.status.replace("_", " ")}</dd></div><div><dt>Priority</dt><dd>{feature.priority}</dd></div><div><dt>Assignee</dt><dd>{assignee}</dd></div><div><dt>Due date</dt><dd>{feature.dueDate?.toLocaleDateString() ?? "None"}</dd></div><div><dt>Labels</dt><dd className="tag-row">{feature.featureLabels.map(({ label }) => <span className="tag" key={label.id}>{label.name}</span>)}{!feature.featureLabels.length ? "None" : null}</dd></div></dl><div className="description-box"><h3>Description</h3><Markdown>{feature.description}</Markdown></div></>;
}

function FeatureForm({ feature }) {
    const selected = new Set(feature.featureLabels.map(({ labelId }) => labelId));
    return <form action={updateFeatureAction}><input type="hidden" name="featureId" value={feature.id} /><label className="form-field"><span>Title</span><input name="title" defaultValue={feature.title} required /></label><div className="form-fields"><label className="form-field"><span>Status</span><select name="status" defaultValue={feature.status}><option value="TODO">Todo</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select></label><label className="form-field"><span>Priority</span><select name="priority" defaultValue={feature.priority}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label><label className="form-field"><span>Assignee</span><select name="assignedTo" defaultValue={feature.assignedTo ?? ""}><option value="">Unassigned</option>{feature.project.members.map(({ user }) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><label className="form-field"><span>Due date</span><input name="dueDate" type="date" defaultValue={feature.dueDate?.toISOString().slice(0, 10) ?? ""} /></label></div><fieldset className="label-options"><legend>Labels</legend>{feature.project.labels.map((label) => <label key={label.id}><input type="checkbox" name="labelIds" value={label.id} defaultChecked={selected.has(label.id)} /> <span className="tag">{label.name}</span></label>)}</fieldset><label className="form-field"><span>Description (Markdown supported)</span><textarea name="description" defaultValue={feature.description ?? ""} maxLength={10000} /></label><div className="button-row"><button className="main-button" type="submit">Save changes</button><Link href={`/features/${feature.id}`} className="plain-button">Cancel</Link></div></form>;
}

function Discussion({ comments, featureId }) {
    // Markdown is stored as plain text and only rendered when the page is displayed.
    return <section className="details-box"><h2>Discussion</h2><ul className="item-list">{comments.map((comment) => <li className="item-box" key={comment.id}><strong>{comment.user.name}</strong><Markdown>{comment.body}</Markdown><small className="subtext">{comment.createdAt.toLocaleString()}</small></li>)}{!comments.length ? <li className="subtext">No comments yet.</li> : null}</ul><form action={addFeatureCommentAction}><input type="hidden" name="featureId" value={featureId} /><label className="form-field"><span>Add comment (Markdown supported)</span><textarea name="body" required maxLength={5000} /></label><div className="button-row"><button className="main-button" type="submit">Comment</button></div></form></section>;
}
