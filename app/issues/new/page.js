import { redirect } from "next/navigation";

// Keep old issue links working while creation now lives on the combined page.
export default async function OldNewIssuePage({ searchParams }) {
    const { projectId, featureId } = await searchParams;
    // URLSearchParams handles the question marks, ampersands, and escaping for this redirect.
    const query = new URLSearchParams({ type: "issue" });
    if (projectId) query.set("projectId", projectId);
    if (featureId) query.set("featureId", featureId);
    redirect(`/work/new?${query}`);
}
