export function HomeSkeleton() {
	return (
		<div className="py-16 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
				<div className="flex flex-col items-center gap-4">
					<div className="bg-muted animate-pulse h-8 w-48 rounded-full" />
					<div className="bg-muted animate-pulse h-10 w-72 sm:w-96" />
					<div className="bg-muted animate-pulse h-5 w-80 sm:w-[28rem] max-w-full" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[0, 1, 2].map((i) => (
						<div key={i} className="bg-muted animate-pulse h-72 w-full rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}
