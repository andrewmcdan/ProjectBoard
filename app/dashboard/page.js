import Link from "next/link";
import { SectionCard } from "../../components/section-card";
import { SiteShell } from "../../components/site-shell";
import { getDashboardProjects } from "../../lib/project-data";
import { requireUser } from "../../lib/auth-helpers";

export const dynamic = "force-dynamic";

// The dashboard is protected and only loads projects the current user belongs to.
export default async function DashboardPage({ searchParams }) {
    const user = await requireUser();
    const projects = await getDashboardProjects(user.id);
    const { error } = await searchParams;

    return (
        <SiteShell>
            <SectionCard
                title={`${user.name}'s Projects`}
                eyebrow="Dashboard"
                actions={
                    <Link href="/projects/new" className="main-button">
                        Create Project
                    </Link>
                }
            >
                {error ? <p className="error-box">{error}</p> : null}
                <div className="card-list">
                    {projects.map((project) => (
                        <article key={project.id} className="info-card">
                            <h3>{project.name}</h3>
                            <p className="subtext">{project.description}</p>
                            <div className="tag-row">
                                <span className="tag">{project.members} team members</span>
                                <span className="tag">{project.openIssues} active issues</span>
                                <span className="tag">{project.openFeatures} active features</span>
                            </div>
                            <div className="button-row">
                                <Link href={`/projects/${project.id}`} className="plain-button">
                                    Open board
                                </Link>
                                {project.canEdit ? (
                                    <Link href={`/projects/${project.id}/edit`} className="plain-button">
                                        Edit project
                                    </Link>
                                ) : null}
                            </div>
                        </article>
                    ))}
                    {!projects.length ? <p className="subtext">You do not have any projects yet.</p> : null}
                </div>
            </SectionCard>
        </SiteShell>
    );
}
