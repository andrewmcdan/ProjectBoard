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

// Every page shares this header. The session decides whether app links or Sign in is shown.
export async function SiteShell({ children }) {
    const session = await auth();
    return (
        <div className="app-page">
            <header className="wrapper header-bar">
                <Link href="/" className="brand">
                    <span className="logo-box">PB</span>
                    <span>ProjectBoard</span>
                </Link>
                <nav className="nav-menu" aria-label="Primary">
                    {session?.user
                        ? navItems.map((item) => (
                              <Link key={item.href} href={item.href} className="nav-button">
                                  {item.label}
                              </Link>
                          ))
                        : null}
                    {session?.user ? (
                        <form action={logoutAction}>
                            <button className="nav-button" type="submit">
                                Sign out
                            </button>
                        </form>
                    ) : (
                        <Link className="nav-button" href="/login">
                            Sign in
                        </Link>
                    )}
                </nav>
            </header>
            <main className="wrapper">{children}</main>
        </div>
    );
}
