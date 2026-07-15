import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, empty = "No description provided." }) {
    if (!children?.trim()) return <p className="subtext">{empty}</p>;

    // Raw HTML stays escaped; the GFM plugin adds tables, task lists, and strikethrough.
    return (
        <div className="markdown-content">
            {/* This plugin adds GitHub-style tables, checklists, and strikethrough. */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
        </div>
    );
}
