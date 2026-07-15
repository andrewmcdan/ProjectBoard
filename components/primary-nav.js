"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects/new", label: "New Project" },
    { href: "/work/new", label: "New Issue or Feature" },
    { href: "/settings", label: "Settings" },
];

export function PrimaryNav() {
    const pathname = usePathname();

    return navItems.map((item) => {
        // Home only matches exactly; the other links also stay active on their nested routes.
        const isCurrent = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return <Link key={item.href} href={item.href} className={`nav-button${isCurrent ? " current-page" : ""}`} aria-current={isCurrent ? "page" : undefined}>{item.label}</Link>;
    });
}
