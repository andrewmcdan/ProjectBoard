import Link from "next/link";
import { auth } from "../auth";
import { logoutAction } from "../app/actions";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects/new", label: "New Project" },
    { href: "/issues/new", label: "New Issue" },
    { href: "/features/new", label: "New Feature" },
    { href: "/settings", label: "Settings" },
];

export async function SiteShell({ children }) {
    const session = await auth();
    return (
        <div className="page">
            <header className="shell topbar">
                <Link href="/" className="brand">
                    <span className="brandMark">PB</span>
                    <span>ProjectBoard</span>
                </Link>
                <nav className="nav" aria-label="Primary">
                    {session?.user ? navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="navLink">
                            {item.label}
                        </Link>
                    )) : null}
                    {session?.user ? <form action={logoutAction}><button className="navLink" type="submit">Sign out</button></form> : <Link className="navLink" href="/login">Sign in</Link>}
                </nav>
            </header>
            <main className="shell">{children}</main>
        </div>
    );
}
