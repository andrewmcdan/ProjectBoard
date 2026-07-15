import Link from "next/link";
import { SiteShell } from "../../../components/site-shell";
import { getProjectBoard } from "../../../lib/project-data";
import { requireUser } from "../../../lib/auth-helpers";

export const dynamic = "force-dynamic";

// The data helper checks membership before giving this page any project details.
export default async function ProjectBoardPage({ params }) {
    const { projectId } = await params;
    const user = await requireUser();
    const project = await getProjectBoard(projectId, user.id);

    if (!project) {
        return (
            <SiteShell>
                <section className="page-card">
                    <p className="small-heading">Project Board</p>
                    <h1>Project not found</h1>
                    <p className="subtext">This project does not exist or you are not a member.</p>
                </section>
            </SiteShell>
        );
    }

    return (
        <SiteShell>
            <section className="project-board">
                <div className="card-heading">
                    <div>
                        <p className="small-heading">Project Board</p>
                        <h1>{project.name}</h1>
                    </div>
                    <div className="button-row">
                        <Link href={`/work/new?type=issue&projectId=${project.id}`} className="main-button">
                            New Issue or Feature
                        </Link>
                    </div>
                </div>
                <p className="subtext">
                    {/* map pulls out member names, then join turns the array into readable comma-separated text. */}
                    {project.description} · {project.members.map((member) => member.name).join(", ")}
                </p>
                {/* Issues and features share the same three status columns. */}
                <div className="project-columns">
                    {project.boardColumns.map((column) => (
                        <section key={column.id} className="project-column">
                            <div className="column-heading">
                                <h3>{column.name}</h3>
                                <span className={`status-tag ${column.className}`}>
                                    {column.issues.length} issues / {column.features.length} features
                                </span>
                            </div>
                            <div className="work-list">
                                {column.features.map((feature) => (
                                    <article key={feature.id} className="work-card">
                                        <p className="small-heading">{feature.id}</p>
                                        <h3>{feature.title}</h3>
                                        <div className="tag-row">
                                            <span className="tag">{feature.assignee}</span>
                                            <span className="tag">{feature.priority}</span>
                                            <span className="status-tag">Feature</span>
                                        </div>
                                        <div className="button-row">
                                            <Link href={`/features/${feature.id}`} className="plain-button">
                                                View feature
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                                {column.issues.map((issue) => (
                                    <article key={issue.id} className="work-card">
                                        <p className="small-heading">{issue.id}</p>
                                        <h3>{issue.title}</h3>
                                        <div className="tag-row">
                                            <span className="tag">{issue.assignee}</span>
                                            <span className="tag">{issue.priority}</span>
                                            {/* Only render the feature tag when this issue is actually linked to one. */}
                                            {issue.feature ? <span className="tag">Feature: {issue.feature}</span> : null}
                                        </div>
                                        <div className="button-row">
                                            <Link href={`/issues/${issue.id}`} className="plain-button">
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
