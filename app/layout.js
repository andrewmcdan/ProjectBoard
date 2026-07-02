import "./globals.css";

export const metadata = {
    title: "ProjectBoard",
    description: "A server-rendered project board for class projects and issue tracking.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
