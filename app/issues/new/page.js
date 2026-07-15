import { redirect } from "next/navigation";
import { SiteShell } from "../../../components/site-shell";
import { createIssueAction } from "../../actions";
import { requireProjectMember } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";

export default async function NewIssuePage({ searchParams }) {
    const { projectId, featureId = "", error } = await searchParams;
    if (!projectId) redirect("/dashboard?error=Choose%20a%20project%20before%20creating%20an%20issue");
    if (!(await requireProjectMember(projectId))) redirect("/dashboard?error=Project%20access%20denied");
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: { include: { user: true } }, features: { orderBy: { title: "asc" } }, labels: true } });
    return <SiteShell><section className="section"><p className="eyebrow">{project.name}</p><h1>Create an issue</h1>{error ? <p className="errorMessage">{error}</p> : null}<form action={createIssueAction}><input type="hidden" name="projectId" value={projectId} /><div className="formGrid"><label className="field"><span>Title</span><input name="title" required maxLength={180} /></label><Selects members={project.members} features={project.features} featureId={featureId} /></div><LabelChoices labels={project.labels} /><label className="field"><span>Description</span><textarea name="description" maxLength={10000} /></label><div className="actions"><button className="buttonLink" type="submit">Create issue</button></div></form></section></SiteShell>;
}

function Selects({ members, features, featureId }) { return <><label className="field"><span>Status</span><select name="status"><option value="TODO">Todo</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select></label><label className="field"><span>Priority</span><select name="priority"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label><label className="field"><span>Assignee</span><select name="assignedTo"><option value="">Unassigned</option>{members.map(({ user }) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><label className="field"><span>Due date</span><input name="dueDate" type="date" /></label><label className="field"><span>Linked feature</span><select name="featureId" defaultValue={featureId}><option value="">None</option>{features.map((feature) => <option key={feature.id} value={feature.id}>{feature.title}</option>)}</select></label></>; }
function LabelChoices({ labels }) { return labels.length ? <fieldset className="labelChoices"><legend>Labels</legend>{labels.map((label) => <label key={label.id}><input type="checkbox" name="labelIds" value={label.id} /> <span className="pill" style={{ borderColor: label.color }}>{label.name}</span></label>)}</fieldset> : null; }
