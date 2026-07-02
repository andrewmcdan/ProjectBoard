import Link from "next/link";
import { SiteShell } from "../../../components/site-shell";
import { comments, features } from "../../../lib/mock-data";

export default async function FeatureDetailPage({ params }) {
    const { featureId } = await params;
    const feature = features.find((item) => item.id === featureId) ?? features[0];

    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Feature Detail</p>
                <h1>{featureId}</h1>
                <p className="muted">Server-rendered placeholder detail page for feature metadata, linked issues, labels, and comments.</p>
                <div className="detailGrid">
                    <section className="detailPanel">
                        <h3>Overview</h3>
                        <div className="metaRow">
                            <span className="statusPill statusProgress">{feature.status}</span>
                            <span className="pill">{feature.priority} priority</span>
                            <span className="pill">{feature.linkedIssues} linked issues</span>
                        </div>
                        <p className="muted">
                            Replace this content with database-backed feature details, edit actions, and lists of linked issues.
                        </p>
                        <div className="actions">
                            <Link href="/issues/new" className="ghostLink">Create linked issue</Link>
                        </div>
                    </section>
                    <section className="detailPanel">
                        <h3>Discussion</h3>
                        <ul className="list">
                            {comments.map((comment) => (
                                <li key={comment.id} className="listItem">
                                    <strong>{comment.author}</strong>
                                    <p className="muted">{comment.body}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </section>
        </SiteShell>
    );
}
