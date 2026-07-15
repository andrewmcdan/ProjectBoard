// This helper keeps section headings and optional action buttons consistent across pages.
export function SectionCard({ title, eyebrow, children, actions }) {
    return (
        <section className="page-card">
            <div className="card-heading">
                <div>
                    {eyebrow ? <p className="small-heading">{eyebrow}</p> : null}
                    <h2>{title}</h2>
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}
