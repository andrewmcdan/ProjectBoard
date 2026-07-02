import Link from "next/link";
import { SiteShell } from "../../components/site-shell";

export default function LoginPage() {
    return (
        <SiteShell>
            <section className="authCard">
                <p className="eyebrow">Authentication</p>
                <h1>Sign in</h1>
                <p className="muted">Placeholder form until Auth.js is wired up.</p>
                <div className="formGrid">
                    <label className="field">
                        <span>Email</span>
                        <input type="email" placeholder="student@example.edu" />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <input type="password" placeholder="••••••••" />
                    </label>
                </div>
                <div className="actions">
                    <button type="button" className="buttonLink">Sign in</button>
                    <Link href="/register" className="ghostLink">Need an account?</Link>
                </div>
            </section>
        </SiteShell>
    );
}
