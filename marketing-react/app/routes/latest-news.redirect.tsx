import { redirect } from "react-router";

// * Legacy /latest-news URLs redirect to the new /latest-updates paths so links
// * already shared on social media keep working (including their previews).
export function loader({ params }: { params: Record<string, string | undefined> }) {
	const slug = params["*"];
	return redirect(slug ? `/latest-updates/${slug}` : "/latest-updates", 301);
}

export default function LatestNewsRedirect() {
	return null;
}
