import type { ReactNode } from "react";

interface PageHeaderProps {
	children?: ReactNode;
	subtitle?: string;
}

/**
 * Hero-style page header with a photo backdrop, gradient overlay, animated copy
 * and a decorative bottom curve.
 */
export function PageHeader({ children, subtitle }: PageHeaderProps) {
	return (
		<div className="relative h-[20dvh] w-full overflow-hidden bg-[url('/images/bg-1.webp')] bg-cover bg-center bg-no-repeat sm:h-[30dvh] lg:h-[40dvh]">
			{/* Enhanced gradient overlay with animation */}
			<div className="absolute inset-0 h-full w-full">
				<div
					className="animate-fade-in h-full w-full backdrop-blur-[2px]"
					style={{
						background:
							"linear-gradient(85.35deg, hsl(var(--primary-700) / 0.85) 2.89%, hsl(var(--primary-600) / 0.75) 96.95%)",
					}}
				>
					{/* Decorative elements */}
					<div className="absolute top-0 left-0 h-full w-full overflow-hidden">
						<div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
						<div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
					</div>
				</div>
			</div>

			{/* Content with animation */}
			<div className="relative z-[2] flex h-full w-full items-center justify-center">
				<div className="flex flex-col items-center justify-center px-4 text-center">
					<h2
						className="animate-fly-in font-secondary text-xl font-bold text-white drop-shadow-xl sm:text-2xl md:text-3xl lg:text-4xl"
						style={{ animationDelay: "300ms" }}
					>
						{children}
					</h2>
					{subtitle ? (
						<p
							className="animate-fade-in mx-auto mt-3 max-w-2xl font-primary text-xs leading-relaxed text-primary-50/90 drop-shadow-lg sm:mt-4 sm:text-sm md:text-base"
							style={{ animationDelay: "500ms" }}
						>
							{subtitle}
						</p>
					) : null}
				</div>
			</div>

			{/* Decorative bottom curve */}
			<div className="absolute right-0 bottom-0 left-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1440 40"
					className="h-auto w-full fill-white"
				>
					<path d="M0,32L80,26.7C160,21,320,11,480,10.7C640,11,800,21,960,26.7C1120,32,1280,32,1360,32L1440,32L1440,40L1360,40C1280,40,1120,40,960,40C800,40,640,40,480,40C320,40,160,40,80,40L0,40Z" />
				</svg>
			</div>
		</div>
	);
}
