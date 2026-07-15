import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { registerAction } from "../actions";
import { SiteShell } from "../../components/site-shell";

export default async function RegisterPage({ searchParams }) {
    if ((await auth())?.user) redirect("/dashboard");
    const { error } = await searchParams;
    return <SiteShell><section className="authCard"><p className="eyebrow">Authentication</p><h1>Create an account</h1><p className="muted">Passwords must contain at least eight characters.</p>{error ? <p className="errorMessage">{error}</p> : null}<form action={registerAction}><div className="formGrid"><label className="field"><span>Name</span><input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label><label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label><label className="field"><span>Password</span><input name="password" type="password" required minLength={8} autoComplete="new-password" /></label></div><div className="actions"><button type="submit" className="buttonLink">Register</button><Link href="/login" className="ghostLink">Already have an account?</Link></div></form></section></SiteShell>;
}
