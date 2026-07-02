import { SiteShell } from "../../components/site-shell";

export default function SettingsPage() {
    return (
        <SiteShell>
            <section className="section">
                <p className="eyebrow">Account</p>
                <h1>Settings</h1>
                <p className="muted">Reserved for profile settings, password changes, and membership preferences.</p>
                <div className="cardGrid">
                    <article className="card">
                        <h3>Profile</h3>
                        <p className="muted">Name, email, and avatar controls will live here.</p>
                    </article>
                    <article className="card">
                        <h3>Security</h3>
                        <p className="muted">Password updates and session management will live here.</p>
                    </article>
                </div>
            </section>
        </SiteShell>
    );
}
