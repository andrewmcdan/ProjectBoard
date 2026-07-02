import Link from "next/link";
import { SectionCard } from "../components/section-card";
import { SiteShell } from "../components/site-shell";
import { projects } from "../lib/mock-data";

export default function HomePage() {
    return (
        <SiteShell>
            <section className="hero">
                <div className="heroGrid">
                    <div>
                        <p className="eyebrow">CS 4720 Term Project</p>
                        <h1>ProjectBoard</h1><h2>Keep projects visible.</h2>
                    </div>
                    <p className="lede">
                        A server-rendered project board for small teams. This scaffold includes basic routes,
                        placeholder data, and a Prisma schema built around projects, issues, features, comments, and labels.
                    </p>
                    <div className="actions">
                        <Link href="/dashboard" className="buttonLink">
                            Open Dashboard
                        </Link>
                        <Link href="/register" className="ghostLink">
                            Create Account
                        </Link>
                    </div>
                </div>

                <div className="stats">
                    <div className="stat">
                        <strong>3</strong>
                        <span>core statuses</span>
                    </div>
                    <div className="stat">
                        <strong>7</strong>
                        <span>core data models</span>
                    </div>
                    <div className="stat">
                        <strong>2</strong>
                        <span>tracked work types</span>
                    </div>
                </div>
            </section>

            <SectionCard title="Starter Project Views" eyebrow="Included routes">
                <div className="cardGrid">
                    {projects.map((project) => (
                        <article key={project.id} className="card">
                            <h3>{project.name}</h3>
                            <p className="muted">{project.description}</p>
                            <div className="metaRow">
                                <span className="pill">{project.members} members</span>
                                <span className="pill">{project.openIssues} open issues</span>
                                <span className="pill">{project.openFeatures} open features</span>
                            </div>
                            <div className="actions">
                                <Link href={`/projects/${project.id}`} className="ghostLink">
                                    View board
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Planned Build Order" eyebrow="Next steps">
                <div className="cardGrid">
                    <article className="card">
                        <h3>Auth.js</h3>
                        <p className="muted">Add login, registration, session checks, and protected routes.</p>
                    </article>
                    <article className="card">
                        <h3>Prisma + MariaDB</h3>
                        <p className="muted">Run the first migration and replace mock data with server queries.</p>
                    </article>
                    <article className="card">
                        <h3>Board actions</h3>
                        <p className="muted">Create projects, issues, features, comments, and membership management flows.</p>
                    </article>
                </div>
            </SectionCard>
        </SiteShell>
    );
}
