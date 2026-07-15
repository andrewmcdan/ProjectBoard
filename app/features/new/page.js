import { redirect } from "next/navigation";

// Keep old feature links working while creation now lives on the combined page.
export default async function OldNewFeaturePage({ searchParams }) {
    const { projectId } = await searchParams;
    // URLSearchParams builds a valid query string without joining URL pieces by hand.
    const query = new URLSearchParams({ type: "feature" });
    if (projectId) query.set("projectId", projectId);
    redirect(`/work/new?${query}`);
}
