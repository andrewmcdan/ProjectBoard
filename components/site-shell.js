import Link from "next/link";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects/new", label: "New Project" },
    { href: "/issues/new", label: "New Issue" },
    { href: "/features/new", label: "New Feature" },
    { href: "/settings", label: "Settings" },
];

export function SiteShell({ children }) {
    return (
        <div className="page">
            <header className="shell topbar">
                <Link href="/" className="brand">
                    <span className="brandMark">PB</span>
                    <span>ProjectBoard</span>
                </Link>
                <nav className="nav" aria-label="Primary">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="navLink">
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>
            <main className="shell">{children}</main>
        </div>
    );
}
