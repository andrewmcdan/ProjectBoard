import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { registerAction } from "../actions";
import { SiteShell } from "../../components/site-shell";

// Registration signs the new user in, so existing sessions go straight to the dashboard.
export default async function RegisterPage({ searchParams }) {
    if ((await auth())?.user) redirect("/dashboard");
    const { error } = await searchParams;
    return (
        <SiteShell>
            <section className="login-box">
                <p className="small-heading">Authentication</p>
                <h1>Create an account</h1>
                <p className="subtext">Passwords must contain at least eight characters.</p>
                {error ? <p className="error-box">{error}</p> : null}
                <form action={registerAction}>
                    <div className="form-fields">
                        <label className="form-field">
                            <span>Name</span>
                            <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
                        </label>
                        <label className="form-field">
                            <span>Email</span>
                            <input name="email" type="email" required autoComplete="email" />
                        </label>
                        <label className="form-field">
                            <span>Password</span>
                            <input name="password" type="password" required minLength={8} autoComplete="new-password" />
                        </label>
                    </div>
                    <div className="button-row">
                        <button type="submit" className="main-button">
                            Register
                        </button>
                        <Link href="/login" className="plain-button">
                            Already have an account?
                        </Link>
                    </div>
                </form>
            </section>
        </SiteShell>
    );
}
