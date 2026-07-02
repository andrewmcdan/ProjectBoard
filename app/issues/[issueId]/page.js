import { SiteShell } from "../../../components/site-shell";
import { comments } from "../../../lib/mock-data";

export default async function IssueDetailPage({ params }) {
    const { issueId } = await params;

    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Issue Detail</p>
                <h1>{issueId}</h1>
                <p className="muted">Server-rendered placeholder detail page for issue metadata, labels, and comments.</p>
                <div className="detailGrid">
                    <section className="detailPanel">
                        <h3>Overview</h3>
                        <div className="metaRow">
                            <span className="statusPill statusProgress">In Progress</span>
                            <span className="pill">High priority</span>
                            <span className="pill">Due Jul 15</span>
                            <span className="pill">Linked feature: Project Dashboard</span>
                        </div>
                        <p className="muted">
                            Replace this content with database-backed issue details, edit actions, assignee controls, and optional feature linkage.
                        </p>
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
