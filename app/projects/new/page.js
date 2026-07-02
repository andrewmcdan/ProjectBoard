import { SiteShell } from "../../../components/site-shell";

export default function NewProjectPage() {
    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Projects</p>
                <h1>Create a project</h1>
                <p className="muted">Placeholder form for the first project creation flow.</p>
                <div className="formGrid">
                    <label className="field">
                        <span>Project name</span>
                        <input type="text" placeholder="ClassBoard" />
                    </label>
                    <label className="field">
                        <span>Owner</span>
                        <input type="text" placeholder="Current user" />
                    </label>
                </div>
                <label className="field">
                    <span>Description</span>
                    <textarea placeholder="Describe the purpose of this project and who belongs to it." />
                </label>
                <div className="actions">
                    <button type="button" className="buttonLink">Save project</button>
                </div>
            </section>
        </SiteShell>
    );
}
