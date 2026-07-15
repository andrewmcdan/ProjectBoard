import Link from "next/link";
import { auth } from "../auth";
import { SectionCard } from "../components/section-card";
import { SiteShell } from "../components/site-shell";
import { getDashboardProjects } from "../lib/project-data";

export const dynamic = "force-dynamic";

// Guests see the public sales-style homepage; signed-in users get project data instead.
function GuestHome() {
    return (
        <>
            <section className="welcome-box">
                <div className="welcome-content">
                    <div>
                        <p className="small-heading">CS 4720 Term Project</p>
                        <h1>ProjectBoard</h1>
                        <h2>Keep projects visible.</h2>
                    </div>
                    <p className="intro-text">A server-rendered project board for small teams. Organize projects, issues, features, assignments, labels, due dates, and team discussions in one place.</p>
                    <div className="button-row">
                        <Link href="/dashboard" className="main-button">
                            Open Dashboard
                        </Link>
                        <Link href="/register" className="plain-button">
                            Create Account
                        </Link>
                    </div>
                </div>

                <div className="number-grid">
                    <div className="number-card">
                        <strong>3</strong>
                        <span>core statuses</span>
                    </div>
                    <div className="number-card">
                        <strong>7</strong>
                        <span>core data models</span>
                    </div>
                    <div className="number-card">
                        <strong>2</strong>
                        <span>tracked work types</span>
                    </div>
                </div>
            </section>

            <SectionCard title="Everything your team needs" eyebrow="Included workflows">
                <div className="card-list">
                    <article className="info-card">
                        <h3>Visual boards</h3>
                        <p className="subtext">See issues and features grouped into Todo, In Progress, and Done.</p>
                    </article>
                    <article className="info-card">
                        <h3>Detailed work</h3>
                        <p className="subtext">Track priority, assignee, due date, labels, descriptions, and linked issues.</p>
                    </article>
                    <article className="info-card">
                        <h3>Team discussion</h3>
                        <p className="subtext">Keep context attached to work with server-rendered comment threads.</p>
                    </article>
                </div>
            </SectionCard>

            <SectionCard title="Built for trustworthy collaboration" eyebrow="Under the hood">
                <div className="card-list">
                    <article className="info-card">
                        <h3>Auth.js</h3>
                        <p className="subtext">Secure credentials sessions and protected application routes.</p>
                    </article>
                    <article className="info-card">
                        <h3>Prisma + MariaDB</h3>
                        <p className="subtext">Relational, server-rendered project data with consistent relationships.</p>
                    </article>
                    <article className="info-card">
                        <h3>Authorization</h3>
                        <p className="subtext">Membership checks protect every project read and mutation.</p>
                    </article>
                </div>
            </SectionCard>
        </>
    );
}

function MemberHome({ user, projects }) {
    // Add up the per-project counts for the summary cards at the top.
    const totals = projects.reduce(
        (summary, project) => ({
            work: summary.work + project.totalWork,
            inProgress: summary.inProgress + project.inProgress,
            done: summary.done + project.done,
        }),
        { work: 0, inProgress: 0, done: 0 },
    );

    return (
        <>
            <section className="welcome-box">
                <div className="welcome-content">
                    <div>
                        <p className="small-heading">Project overview</p>
                        <h1 className="welcome-title">Welcome back, {user.name}.</h1>
                    </div>
                    <p className="intro-text">Here is the latest snapshot of the projects you belong to.</p>
                    <div className="button-row">
                        <Link href="/projects/new" className="main-button">
                            Create Project
                        </Link>
                        <Link href="/dashboard" className="plain-button">
                            Open Dashboard
                        </Link>
                    </div>
                </div>
                <div className="number-grid">
                    <div className="number-card">
                        <strong>{projects.length}</strong>
                        <span>projects</span>
                    </div>
                    <div className="number-card">
                        <strong>{totals.work}</strong>
                        <span>issues and features</span>
                    </div>
                    <div className="number-card">
                        <strong>{totals.inProgress}</strong>
                        <span>in progress</span>
                    </div>
                    <div className="number-card">
                        <strong>{totals.done}</strong>
                        <span>completed</span>
                    </div>
                </div>
            </section>

            <SectionCard
                title="Your projects"
                eyebrow="Current workload"
                actions={
                    <Link href="/projects/new" className="plain-button">
                        New project
                    </Link>
                }
            >
                <div className="card-list">
                    {projects.map((project) => {
                        const completion = project.totalWork ? Math.round((project.done / project.totalWork) * 100) : 0;
                        return (
                            <article key={project.id} className="info-card">
                                <h3>{project.name}</h3>
                                <p className="subtext">{project.description}</p>
                                <div className="tag-row">
                                    <span className="tag">{project.members} members</span>
                                    <span className="tag">{project.issues} issues</span>
                                    <span className="tag">{project.features} features</span>
                                </div>
                                <p>
                                    <strong>{completion}% complete</strong>
                                </p>
                                <div className="tag-row">
                                    <span className="status-tag statusTodo">{project.todo} todo</span>
                                    <span className="status-tag statusProgress">{project.inProgress} in progress</span>
                                    <span className="status-tag statusDone">{project.done} done</span>
                                </div>
                                <div className="button-row">
                                    <Link href={`/projects/${project.id}`} className="plain-button">
                                        Open board
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                    {!projects.length ? (
                        <article className="info-card">
                            <h3>No projects yet</h3>
                            <p className="subtext">Create your first project to start tracking issues and features.</p>
                            <div className="button-row">
                                <Link href="/projects/new" className="main-button">
                                    Create Project
                                </Link>
                            </div>
                        </article>
                    ) : null}
                </div>
            </SectionCard>
        </>
    );
}

export default async function HomePage() {
    // Only query project data when a user is actually signed in.
    const session = await auth();
    const projects = session?.user?.id ? await getDashboardProjects(session.user.id) : null;
    return <SiteShell>{session?.user ? <MemberHome user={session.user} projects={projects} /> : <GuestHome />}</SiteShell>;
}
