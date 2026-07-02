import Link from "next/link";
import { SiteShell } from "../../components/site-shell";

export default function RegisterPage() {
    return (
        <SiteShell>
            <section className="authCard">
                <p className="eyebrow">Authentication</p>
                <h1>Create an account</h1>
                <p className="muted">Placeholder registration screen to be replaced with future Auth.js integration.</p>
                <div className="formGrid">
                    <label className="field">
                        <span>Name</span>
                        <input type="text" placeholder="Andrew McDaniel" />
                    </label>
                    <label className="field">
                        <span>Email</span>
                        <input type="email" placeholder="student@example.edu" />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <input type="password" placeholder="Choose a password" />
                    </label>
                </div>
                <div className="actions">
                    <button type="button" className="buttonLink">Register</button>
                    <Link href="/login" className="ghostLink">Already have an account?</Link>
                </div>
            </section>
        </SiteShell>
    );
}
