import { useState } from "react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { ResponsiveModal } from "~/components/layout/ResponsiveModal";
import { Button } from "~/components/ui/button";
import { Loader2, ChevronRight, Info } from "lucide-react";
import { useSiteData } from "~/lib/hooks/useSiteData";

interface ProgrammeScheduleItem {
	day: string;
	time: string;
	location?: string;
}

interface ProgrammeCoordinator {
	name: string;
	role?: string;
	contact?: string;
}

export interface Programme {
	id: string | number;
	title: string;
	summary?: string;
	description?: string;
	image?: string;
	text?: string;
	schedule?: ProgrammeScheduleItem[];
	coordinators?: ProgrammeCoordinator[];
	benefits?: string[];
}

export default function ProgrammesPage() {
	const [programmes] = useSiteData<Programme[]>("programmes", []);

	const [hoveredProgramme, setHoveredProgramme] = useState<Programme | null>(null);
	const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [programmeDetails, setProgrammeDetails] = useState<Programme | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	function openProgrammeDetails(programme: Programme) {
		setSelectedProgramme(programme);
		setModalOpen(true);
		setIsLoading(true);

		setTimeout(() => {
			setProgrammeDetails({
				...programme,
				description: programme.description || programme.text,
				schedule: programme.schedule || [],
				coordinators: programme.coordinators || [],
				benefits: programme.benefits || [],
			});
			setIsLoading(false);
		}, 500);
	}

	function closeProgrammeDetails() {
		setModalOpen(false);
		setTimeout(() => {
			setSelectedProgramme(null);
			setProgrammeDetails(null);
		}, 300);
	}

	const hasAnyDetail =
		Boolean(programmeDetails?.description) ||
		(programmeDetails?.schedule?.length ?? 0) > 0 ||
		(programmeDetails?.coordinators?.length ?? 0) > 0 ||
		(programmeDetails?.benefits?.length ?? 0) > 0;

	return (
		<>
			<Seo
				title="Our Programmes"
				description="Muslim Students' Society of Nigeria at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus."
				path="/programmes"
				type="WebPage"
				images={[
					{
						url: "https://i.ibb.co/zbWfh5B/home.webp",
						width: 1200,
						height: 640,
						alt: "MSSNOAU Programmes",
					},
				]}
				keywords={[
					"mssnoau programmes",
					"mssn oau events",
					"islamic activities oau",
					"muslim student programmes oau",
					"oau mssn activities",
				]}
			/>

			<PageHeader subtitle="From Qur'an circles to community drives — the programmes and initiatives that keep the MSSN OAU family thriving.">
				Our Programmes
			</PageHeader>

			<section className="py-6 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

				<div className="mx-auto max-w-5xl space-y-16 px-6 relative z-10">
					{programmes.length > 0 ? (
						<div className="relative mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
							{programmes.map((programme) => (
								<div
									key={programme.title}
									role="button"
									tabIndex={0}
									className="flex flex-col rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-[360px] cursor-pointer"
									onMouseEnter={() => setHoveredProgramme(programme)}
									onMouseLeave={() => setHoveredProgramme(null)}
									onClick={() => openProgrammeDetails(programme)}
									onKeyDown={(e) => {
										if (e.key === "Enter") openProgrammeDetails(programme);
									}}
								>
									<div className="relative w-full h-1/2 overflow-hidden">
										<img
											className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
											alt={programme.title}
											src={programme.image || "/images/placeholder.webp"}
										/>
										<div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/30 p-3">
											<h3 className="text-white font-medium font-secondary text-lg">
												{programme.title}
											</h3>
										</div>
									</div>

									<div className="flex-1 p-4 bg-white flex flex-col">
										<p className="text-gray-700 text-sm flex-1">{programme.summary || ""}</p>
										<div className="pt-3 flex justify-end">
											<div className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors group-hover:underline">
												View Details
												<ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-16 px-4">
							<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-sm w-full max-w-lg text-center">
								<div className="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
									<Info className="size-10 text-primary-400" />
								</div>
								<h3 className="text-xl font-medium text-primary-800 mb-3">
									No Programmes Available
								</h3>
								<p className="text-gray-600 mb-6">
									Our programmes are currently being updated. Please check back soon for a list
									of our exciting activities and initiatives.
								</p>
								<div className="border-t border-gray-100 pt-4 mt-2">
									<p className="text-sm text-gray-500">If you have any questions, please contact our team.</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{selectedProgramme ? (
					<ResponsiveModal
						open={modalOpen}
						onOpenChange={(isOpen) => {
							if (!isOpen) closeProgrammeDetails();
						}}
						title={selectedProgramme.title}
						description={`Detailed information about the ${selectedProgramme.title} programme.`}
						contentClass="sm:max-w-[600px]"
						footer={
							<Button variant="outline" onClick={closeProgrammeDetails}>
								Close
							</Button>
						}
					>
						<div className="py-6 px-1">
							{isLoading ? (
								<div className="flex flex-col items-center justify-center py-12">
									<Loader2 className="size-12 text-primary-700 animate-spin mb-4" />
									<p className="text-gray-600">Loading programme details...</p>
								</div>
							) : programmeDetails ? (
								<div className="space-y-6">
									<div className="flex justify-center my-4">
										<div className="p-2 rounded-lg bg-primary-50 border border-primary-100 shadow-sm">
											<img
												src={programmeDetails.image || "/images/placeholder.webp"}
												alt={programmeDetails.title}
												className="h-28 w-28 object-contain rounded-md"
											/>
										</div>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
										{programmeDetails.description ? (
											<div
												className="prose prose-sm max-w-none text-gray-700 [&_p]:my-2 [&_ul]:my-2"
												dangerouslySetInnerHTML={{ __html: programmeDetails.description }}
											/>
										) : (
											<p className="prose prose-sm max-w-none text-gray-700">No description available.</p>
										)}
									</div>

									{programmeDetails.schedule && programmeDetails.schedule.length > 0 ? (
										<div>
											<h3 className="text-lg font-medium text-gray-900 mb-2">Schedule</h3>
											<div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
												{programmeDetails.schedule.map((item) => (
													<div
														key={item.day + item.time}
														className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
													>
														<div>
															<p className="font-medium text-gray-800">{item.day}</p>
															<p className="text-xs text-gray-500">{item.time}</p>
														</div>
														<p className="text-sm text-gray-600 sm:text-right">
															{item.location || "Online"}
														</p>
													</div>
												))}
											</div>
										</div>
									) : null}

									{programmeDetails.coordinators && programmeDetails.coordinators.length > 0 ? (
										<div>
											<h3 className="text-lg font-medium text-gray-900 mb-2">Coordinators</h3>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												{programmeDetails.coordinators.map((coordinator) => (
													<div key={coordinator.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
														<p className="font-medium text-gray-800">{coordinator.name}</p>
														{coordinator.role ? (
															<p className="text-xs text-gray-500">{coordinator.role}</p>
														) : null}
														{coordinator.contact ? (
															<p className="text-xs text-primary-600 hover:underline">
																<a href={`tel:${coordinator.contact}`}>{coordinator.contact}</a>
															</p>
														) : null}
													</div>
												))}
											</div>
										</div>
									) : null}

									{programmeDetails.benefits && programmeDetails.benefits.length > 0 ? (
										<div>
											<h3 className="text-lg font-medium text-gray-900 mb-2">Benefits/Objectives</h3>
											<ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
												{programmeDetails.benefits.map((benefit) => (
													<li key={benefit}>{benefit}</li>
												))}
											</ul>
										</div>
									) : null}

									{!hasAnyDetail ? (
										<p className="text-center text-gray-500 py-8">
											More details coming soon for this programme.
										</p>
									) : null}
								</div>
							) : null}
						</div>
					</ResponsiveModal>
				) : null}

				{hoveredProgramme ? null : null}
			</section>
		</>
	);
}
