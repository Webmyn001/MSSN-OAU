import { ExternalLink } from "lucide-react";

export default function BlogSlugPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin size-8 border-2 border-primary-700 border-t-transparent rounded-full mx-auto mb-4" />
				<p className="text-gray-500">Redirecting to An-Nuur Press...</p>
				<a
					href="https://annuurpress.org.ng"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 mt-4 transition-colors"
				>
					Visit An-Nuur Press
					<ExternalLink className="size-3.5" />
				</a>
			</div>
		</div>
	);
}
