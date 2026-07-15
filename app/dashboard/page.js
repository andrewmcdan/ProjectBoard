import Link from "next/link";
import { SectionCard } from "../../components/section-card";
import { SiteShell } from "../../components/site-shell";
import { getDashboardProjects } from "../../lib/project-data";
import { requireUser } from "../../lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }) {
    const user = await requireUser();
    const projects = await getDashboardProjects(user.id);
    const { error } = await searchParams;

    return (
        <SiteShell>
            <SectionCard
                title={`${user.name}'s Projects`}
                eyebrow="Dashboard"
                actions={<Link href="/projects/new" className="buttonLink">Create Project</Link>}
            >
                {error ? <p className="errorMessage">{error}</p> : null}
                <div className="cardGrid">
                    {projects.map((project) => (
                        <article key={project.id} className="card">
                            <h3>{project.name}</h3>
                            <p className="muted">{project.description}</p>
                            <div className="metaRow">
                                <span className="pill">{project.members} team members</span>
                                <span className="pill">{project.openIssues} active issues</span>
                                <span className="pill">{project.openFeatures} active features</span>
                            </div>
                            <div className="actions">
                                <Link href={`/projects/${project.id}`} className="ghostLink">
                                    Open board
                                </Link>
                            </div>
                        </article>
                    ))}
                    {!projects.length ? <p className="muted">You do not have any projects yet.</p> : null}
                </div>
            </SectionCard>
        </SiteShell>
    );
}
