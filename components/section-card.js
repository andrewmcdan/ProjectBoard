export function SectionCard({ title, eyebrow, children, actions }) {
    return (
        <section className="section">
            <div className="sectionHeader">
                <div>
                    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                    <h2>{title}</h2>
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}
