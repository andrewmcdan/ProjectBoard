import { SiteShell } from "../../../components/site-shell";

export default function NewIssuePage() {
    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Issues</p>
                <h1>Create an issue</h1>
                <p className="muted">Placeholder issue form with optional feature linkage.</p>
                <div className="formGrid">
                    <label className="field">
                        <span>Title</span>
                        <input type="text" placeholder="Implement dashboard query" />
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
                    <label className="field">
                        <span>Linked feature</span>
                        <select defaultValue="">
                            <option value="">No linked feature</option>
                            <option value="FEATURE-01">Project Dashboard</option>
                            <option value="FEATURE-03">Authentication Flow</option>
                        </select>
                    </label>
                </div>
                <label className="field">
                    <span>Description</span>
                    <textarea placeholder="Explain the work, acceptance criteria, and any dependencies." />
                </label>
                <div className="actions">
                    <button type="button" className="buttonLink">Create issue</button>
                </div>
            </section>
        </SiteShell>
    );
}
