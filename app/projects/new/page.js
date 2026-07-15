import { SiteShell } from "../../../components/site-shell";
import { createProjectAction } from "../../actions";
import { requireUser } from "../../../lib/auth-helpers";

export default async function NewProjectPage({ searchParams }) {
    const user = await requireUser();
    const { error } = await searchParams;
    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Projects</p>
                <h1>Create a project</h1>
                <p className="muted">Create a workspace. You will be added as its owner.</p>
                {error ? <p className="errorMessage">{error}</p> : null}
                <form action={createProjectAction}>
                <div className="formGrid">
                    <label className="field">
                        <span>Project name</span>
                        <input name="name" type="text" placeholder="ClassBoard" required maxLength={100} />
                    </label>
                    <label className="field">
                        <span>Owner</span>
                        <input type="text" value={user.name} disabled />
                    </label>
                </div>
                <label className="field">
                    <span>Description</span>
                    <textarea name="description" placeholder="Describe the purpose of this project and who belongs to it." maxLength={5000} />
                </label>
                <div className="actions">
                    <button type="submit" className="buttonLink">Save project</button>
                </div>
                </form>
            </section>
        </SiteShell>
    );
}
