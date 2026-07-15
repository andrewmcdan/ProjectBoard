import Link from "next/link";
import { SectionCard } from "../components/section-card";
import { SiteShell } from "../components/site-shell";

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
                        A server-rendered project board for small teams. Organize projects, issues, features,
                        assignments, labels, due dates, and team discussions in one place.
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

            <SectionCard title="Everything your team needs" eyebrow="Included workflows">
                <div className="cardGrid">
                    <article className="card"><h3>Visual boards</h3><p className="muted">See issues and features grouped into Todo, In Progress, and Done.</p></article>
                    <article className="card"><h3>Detailed work</h3><p className="muted">Track priority, assignee, due date, labels, descriptions, and linked issues.</p></article>
                    <article className="card"><h3>Team discussion</h3><p className="muted">Keep context attached to work with server-rendered comment threads.</p></article>
                </div>
            </SectionCard>

            <SectionCard title="Built for trustworthy collaboration" eyebrow="Under the hood">
                <div className="cardGrid">
                    <article className="card">
                        <h3>Auth.js</h3>
                        <p className="muted">Secure credentials sessions and protected application routes.</p>
                    </article>
                    <article className="card">
                        <h3>Prisma + MariaDB</h3>
                        <p className="muted">Relational, server-rendered project data with consistent relationships.</p>
                    </article>
                    <article className="card">
                        <h3>Authorization</h3>
                        <p className="muted">Membership checks protect every project read and mutation.</p>
                    </article>
                </div>
            </SectionCard>
        </SiteShell>
    );
}
