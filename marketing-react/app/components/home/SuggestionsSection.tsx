import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Image } from "~/components/ui/image";

export function SuggestionsSection() {
	return (
		<div className="bg-white py-6 sm:py-8 lg:py-12 relative overflow-hidden">
			<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
			<div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

			<div className="mx-auto max-w-screen-2xl px-4 md:px-8 relative z-10">
				<div className="relative overflow-hidden rounded-xl shadow-lg border border-primary-100 animate-fade-in">
					<div className="absolute inset-0 bg-gradient-to-r from-primary-50/80 to-white/80 backdrop-blur-sm -z-10" />

					<div className="flex flex-col overflow-hidden sm:flex-row md:h-80">
						<div className="flex w-full flex-col p-6 sm:w-1/2 sm:p-8 lg:w-3/5">
							<h2 className="mb-4 text-xl font-bold text-primary-800 md:text-2xl lg:text-4xl font-secondary relative inline-block">
								Complaints? Suggestions
								<span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-700 rounded-full" />
							</h2>

							<p className="mb-8 max-w-md text-gray-700 font-tertiary leading-relaxed">
								We&apos;re committed to improving through thoughtful planning and constructive
								feedback, and we&apos;d love to hear anything you think could make us better. Your
								perspective matters to us!
							</p>

							<div className="mt-auto">
								<Link
									to="/contact"
									className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-8 py-3 text-center text-sm font-semibold font-secondary text-white outline-none shadow-sm transition-all duration-300 hover:bg-primary-800 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 active:bg-primary-800"
								>
									Leave us a message
									<ArrowRight className="size-4" />
								</Link>
							</div>
						</div>

						<div className="order-first h-48 w-full bg-gray-100 sm:order-none sm:h-auto sm:w-1/2 lg:w-2/5 relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
							<Image
								src="https://images.unsplash.com/photo-1612955625275-08aebd897b3a?w=600&auto=format&fit=crop&q=60&fm=webp&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN1Z2dlc3Rpb24lMjBib3h8ZW58MHx8MHx8fDA%3D"
								loading="lazy"
								alt="Suggestion Box"
								width={600}
								height={400}
								fetchpriority="low"
								className="h-full w-full object-cover object-center shadow-inner transition-transform duration-700 hover:scale-110"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
