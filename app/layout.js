export const metadata = {
    title: "AMcDan10 App",
    description: "A Next.js app for CS4720 Internet Programming.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            {/* App Router pages render inside this shared document shell. */}
            <body>{children}</body>
        </html>
    );
}
