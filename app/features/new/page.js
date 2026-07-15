import { redirect } from "next/navigation";
import { SiteShell } from "../../../components/site-shell";
import { createFeatureAction } from "../../actions";
import { requireProjectMember } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";

// Load member and label choices only after confirming access to the project.
export default async function NewFeaturePage({ searchParams }) {
    const { projectId, error } = await searchParams;
    if (!projectId) redirect("/dashboard?error=Choose%20a%20project%20before%20creating%20a%20feature");
    if (!(await requireProjectMember(projectId))) redirect("/dashboard?error=Project%20access%20denied");
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: { include: { user: true } }, labels: true } });
    return (
        <SiteShell>
            <section className="page-card">
                <p className="small-heading">{project.name}</p>
                <h1>Create a feature</h1>
                {error ? <p className="error-box">{error}</p> : null}
                <form action={createFeatureAction}>
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
                                {project.members.map(({ user }) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span>Due date</span>
                            <input name="dueDate" type="date" />
                        </label>
                    </div>
                    <fieldset className="label-options">
                        <legend>Labels</legend>
                        {project.labels.map((label) => (
                            <label key={label.id}>
                                <input type="checkbox" name="labelIds" value={label.id} /> <span className="tag">{label.name}</span>
                            </label>
                        ))}
                    </fieldset>
                    <label className="form-field">
                        <span>Description</span>
                        <textarea name="description" maxLength={10000} />
                    </label>
                    <div className="button-row">
                        <button className="main-button" type="submit">
                            Create feature
                        </button>
                    </div>
                </form>
            </section>
        </SiteShell>
    );
}
