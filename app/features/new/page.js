import { SiteShell } from "../../../components/site-shell";

export default function NewFeaturePage() {
    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Features</p>
                <h1>Create a feature</h1>
                <p className="muted">Placeholder feature form that mirrors the issue flow.</p>
                <div className="formGrid">
                    <label className="field">
                        <span>Title</span>
                        <input type="text" placeholder="Project dashboard" />
                    </label>
                    <label className="field">
                        <span>Status</span>
                        <select defaultValue="TODO">
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>
                    </label>
                    <label className="field">
                        <span>Assignee</span>
                        <input type="text" placeholder="Select a project member" />
                    </label>
                    <label className="field">
                        <span>Due date</span>
                        <input type="date" />
                    </label>
                </div>
                <label className="field">
                    <span>Description</span>
                    <textarea placeholder="Describe the capability this feature should deliver." />
                </label>
                <div className="actions">
                    <button type="button" className="buttonLink">Create feature</button>
                </div>
            </section>
        </SiteShell>
    );
}
