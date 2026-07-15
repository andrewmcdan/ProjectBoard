import "./globals.css";

// Next.js uses this metadata for the browser tab and search-engine description.
export const metadata = {
    title: "ProjectBoard",
    description: "A server-rendered project board for class projects and issue tracking.",
};

// SiteShell stays in each page because it needs to check the current auth session.
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
