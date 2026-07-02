import Link from "next/link";
import { SiteShell } from "../../../components/site-shell";
import { getProjectBoard } from "../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function ProjectBoardPage({ params }) {
    const { projectId } = await params;
    const project = await getProjectBoard(projectId);

    if (!project) {
        return (
            <SiteShell>
                <section className="section">
                    <p className="eyebrow">Project Board</p>
                    <h1>Project not found</h1>
                    <p className="muted">Seed the database and open a known project such as `classboard`.</p>
                </section>
            </SiteShell>
        );
    }

    return (
        <SiteShell>
            <section className="board">
                <div className="sectionHeader">
                    <div>
                        <p className="eyebrow">Project Board</p>
                        <h1>{project.name}</h1>
                    </div>
                    <div className="actions">
                        <Link href="/issues/new" className="buttonLink">New Issue</Link>
                        <Link href="/features/new" className="ghostLink">New Feature</Link>
                    </div>
                </div>
                <p className="muted">
                    This board is now reading seeded placeholder records from MariaDB through Prisma.
                </p>
                <div className="boardColumns">
                    {project.boardColumns.map((column) => (
                        <section key={column.id} className="column">
                            <div className="columnHeader">
                                <h3>{column.name}</h3>
                                <span className={`statusPill ${column.className}`}>
                                    {column.issues.length} issues / {column.features.length} features
                                </span>
                            </div>
                            <div className="issueStack">
                                {column.features.map((feature) => (
                                    <article key={feature.id} className="issueCard">
                                        <p className="eyebrow">{feature.id}</p>
                                        <h3>{feature.title}</h3>
                                        <div className="metaRow">
                                            <span className="pill">{feature.assignee}</span>
                                            <span className="pill">{feature.priority}</span>
                                            <span className="statusPill">Feature</span>
                                        </div>
                                        <div className="actions">
                                            <Link href={`/features/${feature.id}`} className="ghostLink">
                                                View feature
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <div className="issueStack">
                                {column.issues.map((issue) => (
                                    <article key={issue.id} className="issueCard">
                                        <p className="eyebrow">{issue.id}</p>
                                        <h3>{issue.title}</h3>
                                        <div className="metaRow">
                                            <span className="pill">{issue.assignee}</span>
                                            <span className="pill">{issue.priority}</span>
                                            {issue.feature ? <span className="pill">Feature: {issue.feature}</span> : null}
                                        </div>
                                        <div className="actions">
                                            <Link href={`/issues/${issue.id}`} className="ghostLink">
                                                View issue
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </section>
        </SiteShell>
    );
}
