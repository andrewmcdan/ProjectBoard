import { SiteShell } from "../../components/site-shell";
import { requireUser } from "../../lib/auth-helpers";

export default async function SettingsPage() {
    const user = await requireUser();
    return <SiteShell><section className="section"><p className="eyebrow">Account</p><h1>Settings</h1><div className="cardGrid"><article className="card"><h2>{user.name}</h2><p className="muted">{user.email}</p><p>Your account details are managed securely through the registration and Auth.js session flow.</p></article></div></section></SiteShell>;
}
