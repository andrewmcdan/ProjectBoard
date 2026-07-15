"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function NewWorkPicker({ projects, projectId, workType }) {
    const router = useRouter();
    // useTransition keeps the old form visible and gives us a loading flag during navigation.
    const [isSwitching, startTransition] = useTransition();

    function updatePage(type, nextProjectId) {
        // Both dropdowns live in the URL so the server can load the matching form and project data.
        // encodeURIComponent makes both values safe to place inside a query string.
        startTransition(() => router.push(`/work/new?type=${encodeURIComponent(type)}&projectId=${encodeURIComponent(nextProjectId)}`));
    }

    return (
        <div className="new-work-picker">
            {/* Each dropdown keeps the other dropdown's value when it changes the URL. */}
            <label className="form-field">
                <span>What are you creating?</span>
                <select value={workType} onChange={(event) => updatePage(event.target.value, projectId)} disabled={isSwitching}>
                    <option value="issue">Issue</option>
                    <option value="feature">Feature</option>
                </select>
            </label>
            <label className="form-field">
                <span>Project</span>
                <select value={projectId} onChange={(event) => updatePage(workType, event.target.value)} disabled={isSwitching}>
                    {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </label>
            {isSwitching ? <span className="subtext">Loading form...</span> : null}
        </div>
    );
}
