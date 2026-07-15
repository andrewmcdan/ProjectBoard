import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "../../../../components/site-shell";
import { requireUser } from "../../../../lib/auth-helpers";
import { prisma } from "../../../../lib/prisma";
import { updateProjectAction } from "../../../actions";

export const dynamic = "force-dynamic";

// Project settings include the basic details and the complete non-owner member list.
export default async function EditProjectPage({ params, searchParams }) {
    const { projectId } = await params;
    const { error, success } = await searchParams;
    const user = await requireUser();
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            owner: { select: { name: true, email: true } },
            members: {
                where: { role: "MEMBER" },
                orderBy: { createdAt: "asc" },
                include: { user: { select: { email: true } } },
            },
        },
    });

    if (!project || project.ownerId !== user.id) {
        redirect("/dashboard?error=Only%20the%20project%20owner%20can%20edit%20that%20project");
    }

    return (
        <SiteShell>
            <section className="page-card">
                <div className="card-heading">
                    <div>
                        <p className="small-heading">Project settings</p>
                        <h1>Edit {project.name}</h1>
                    </div>
                    <Link href={`/projects/${project.id}`} className="plain-button">
                        Back to board
                    </Link>
                </div>
                {error ? <p className="error-box">{error}</p> : null}
                {success ? <p className="success-box">{success}</p> : null}
                <form action={updateProjectAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <div className="form-fields">
                        <label className="form-field">
                            <span>Project name</span>
                            <input name="name" defaultValue={project.name} required maxLength={100} />
                        </label>
                        <label className="form-field">
                            <span>Owner</span>
                            <input value={`${project.owner.name} (${project.owner.email})`} disabled />
                        </label>
                    </div>
                    <label className="form-field">
                        <span>Description</span>
                        <textarea name="description" defaultValue={project.description ?? ""} maxLength={5000} />
                    </label>
                    <label className="form-field">
                        <span>Team member emails</span>
                        {/* map gets each email, and join puts one on each line in the textarea. */}
                        <textarea
                            name="memberEmails"
                            defaultValue={project.members.map(({ user: member }) => member.email).join("\n")}
                            placeholder="maya@example.com&#10;student@example.com"
                        />
                    </label>
                    <p className="subtext">Enter one registered email per line. Removing an email removes that person from the project. The owner always stays on the team.</p>
                    <div className="button-row">
                        <button type="submit" className="main-button">
                            Save project
                        </button>
                        <Link href={`/projects/${project.id}`} className="plain-button">
                            Cancel
                        </Link>
                    </div>
                </form>
            </section>
        </SiteShell>
    );
}
