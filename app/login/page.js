import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { loginAction } from "../actions";
import { SiteShell } from "../../components/site-shell";

// Signed-in users do not need to see the login form again.
export default async function LoginPage({ searchParams }) {
    if ((await auth())?.user) redirect("/dashboard");
    const { error } = await searchParams;
    return <SiteShell><section className="login-box"><p className="small-heading">Authentication</p><h1>Sign in</h1><p className="subtext">Access projects you own or belong to.</p>{error ? <p className="error-box">{error}</p> : null}<form action={loginAction}><div className="form-fields"><label className="form-field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label><label className="form-field"><span>Password</span><input name="password" type="password" required autoComplete="current-password" /></label></div><div className="button-row"><button type="submit" className="main-button">Sign in</button><Link href="/register" className="plain-button">Need an account?</Link></div></form></section></SiteShell>;
}
