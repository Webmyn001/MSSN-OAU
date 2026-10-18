import type { ImgHTMLAttributes, SyntheticEvent } from "react";

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "className" | "decoding" | "loading" | "sizes"> {
	src?: string;
	alt?: string;
	width?: number | string;
	height?: number | string;
	loading?: "lazy" | "eager" | undefined;
	decoding?: "async" | "sync" | "auto" | undefined;
	fetchpriority?: "auto" | "high" | "low" | undefined;
	className?: string;
	sizes?: string;
	onload?: (event: SyntheticEvent<HTMLImageElement>) => void;
	onerror?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

export function Image({
	src = "",
	alt = "",
	width,
	height,
	loading = "lazy",
	decoding = "async",
	fetchpriority = "auto",
	className = "",
	sizes,
	onload,
	onerror,
	...rest
}: ImageProps) {
	let srcSet: string | undefined;

	if (src && src.startsWith("/")) {
		const parts = src.split(".");
		const extension = parts.pop();
		const basePath = parts.join(".");
		if (extension !== "svg") {
			srcSet = `${basePath}.${extension} 1x`;
		}
	}

	return (
		<img
			src={src}
			alt={alt}
			className={className}
			width={width}
			height={height}
			loading={loading}
			decoding={decoding}
			fetchPriority={fetchpriority}
			srcSet={srcSet}
			sizes={sizes}
			onLoad={onload}
			onError={onerror}
			{...rest}
		/>
	);
}
