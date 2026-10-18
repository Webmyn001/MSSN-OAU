import { useEffect } from "react";

interface ImagePreloaderProps {
	images?: (string | undefined | null)[];
}

export function ImagePreloader({ images = [] }: ImagePreloaderProps) {
	useEffect(() => {
		const all = (Array.isArray(images) ? images : [images]).flat().filter(Boolean) as string[];
		const seen = new Set<string>();
		const warmCache = () => {
			for (const url of all) {
				if (!url || seen.has(url)) continue;
				seen.add(url);
				const img = new Image();
				img.src = url;
			}
		};

		const w = window as any;
		if (typeof w.requestIdleCallback === "function") {
			const id = w.requestIdleCallback(warmCache, { timeout: 4000 });
			return () => w.cancelIdleCallback?.(id);
		}
		const id = setTimeout(warmCache, 2000);
		return () => clearTimeout(id);
	}, [images]);

	return null;
}
