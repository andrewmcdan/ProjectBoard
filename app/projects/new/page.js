import { SiteShell } from "../../../components/site-shell";
import { createProjectAction } from "../../actions";
import { requireUser } from "../../../lib/auth-helpers";

// Creating a project automatically makes the current user its owner.
export default async function NewProjectPage({ searchParams }) {
    const user = await requireUser();
    const { error } = await searchParams;
    return (
        <SiteShell>
            <section className="page-card">
                <p className="small-heading">Projects</p>
                <h1>Create a project</h1>
                <p className="subtext">Create a workspace. You will be added as its owner.</p>
                {error ? <p className="error-box">{error}</p> : null}
                <form action={createProjectAction}>
                <div className="form-fields">
                    <label className="form-field">
                        <span>Project name</span>
                        <input name="name" type="text" placeholder="ClassBoard" required maxLength={100} />
                    </label>
                    <label className="form-field">
                        <span>Owner</span>
                        <input type="text" value={user.name} disabled />
                    </label>
                </div>
                <label className="form-field">
                    <span>Description</span>
                    <textarea name="description" placeholder="Describe the purpose of this project and who belongs to it." maxLength={5000} />
                </label>
                <label className="form-field">
                    <span>Team member emails</span>
                    <textarea name="memberEmails" placeholder="maya@example.com&#10;student@example.com" />
                </label>
                <p className="subtext">Enter one registered email per line. You will automatically be added as the project owner.</p>
                <div className="button-row">
                    <button type="submit" className="main-button">Save project</button>
                </div>
                </form>
            </section>
        </SiteShell>
    );
}
