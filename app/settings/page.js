import { SiteShell } from "../../components/site-shell";
import { requireUser } from "../../lib/auth-helpers";
import { changePasswordAction } from "../actions";

// Password validation happens in the server action; this page only displays its result.
export default async function SettingsPage({ searchParams }) {
    const user = await requireUser();
    const { error, success } = await searchParams;

    return (
        <SiteShell>
            <section className="page-card">
                <p className="small-heading">Account</p>
                <h1>Settings</h1>
                {error ? <p className="error-box">{error}</p> : null}
                {success ? <p className="success-box">{success}</p> : null}
                <div className="details-layout">
                    <article className="info-card">
                        <h2>{user.name}</h2>
                        <p className="subtext">{user.email}</p>
                        <p>Your account is protected by an Auth.js credentials session.</p>
                    </article>
                    <article className="info-card">
                        <h2>Change password</h2>
                        <p className="subtext">Choose a new password with at least eight characters.</p>
                        <form action={changePasswordAction}>
                            <div className="form-fields">
                                <label className="form-field">
                                    <span>Current password</span>
                                    <input name="currentPassword" type="password" required autoComplete="current-password" />
                                </label>
                                <label className="form-field">
                                    <span>New password</span>
                                    <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
                                </label>
                                <label className="form-field">
                                    <span>Confirm new password</span>
                                    <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
                                </label>
                            </div>
                            <div className="button-row">
                                <button type="submit" className="main-button">
                                    Update password
                                </button>
                            </div>
                        </form>
                    </article>
                </div>
            </section>
        </SiteShell>
    );
}
