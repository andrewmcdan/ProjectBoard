import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { loginAction } from "../actions";
import { SiteShell } from "../../components/site-shell";

export default async function LoginPage({ searchParams }) {
    if ((await auth())?.user) redirect("/dashboard");
    const { error } = await searchParams;
    return <SiteShell><section className="authCard"><p className="eyebrow">Authentication</p><h1>Sign in</h1><p className="muted">Access projects you own or belong to.</p>{error ? <p className="errorMessage">{error}</p> : null}<form action={loginAction}><div className="formGrid"><label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label><label className="field"><span>Password</span><input name="password" type="password" required autoComplete="current-password" /></label></div><div className="actions"><button type="submit" className="buttonLink">Sign in</button><Link href="/register" className="ghostLink">Need an account?</Link></div></form></section></SiteShell>;
}
