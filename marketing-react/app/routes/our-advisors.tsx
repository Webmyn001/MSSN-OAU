import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { API_BASE } from "~/lib/api/base";
import { loadSiteData } from "~/lib/api/site-data";
import type { Route } from "./+types/our-advisors";

interface Advisor {
	id?: string;
	name: string;
	title?: string;
	gender?: string;
	position?: string;
	department?: string;
	phone?: string;
	email?: string;
	photo?: string;
	summary?: string;
	socials?: { whatsapp?: string; linkedin?: string };
}

export async function loader(): Promise<{ advisors: Advisor[] }> {
	const data = await loadSiteData(fetch, ["advisors"]);
	return { advisors: (data.advisors as Advisor[]) || [] };
}

function getAdvisorPlaceholder(advisor: Advisor): string {
	const gender = String(advisor?.gender || "").toLowerCase();
	if (gender === "female") return "/images/user/female.jpg";
	if (gender === "male") return "/images/user/male.jpg";

	const title = String(advisor?.title || "").toLowerCase();
	const name = String(advisor?.name || "").toLowerCase();
	const isLikelyFemale =
		title.includes("mrs") || title.includes("miss") || name.startsWith("mrs ") || name.startsWith("sister ");
	return isLikelyFemale ? "/images/user/female.jpg" : "/images/user/male.jpg";
}

export default function OurAdvisorsPage() {
	const { advisors: initial } = useLoaderData<typeof loader>();
	const [advisors, setAdvisors] = useState<Advisor[]>(initial);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch(`${API_BASE}/public/advisors`, {
					signal: AbortSignal.timeout(10000),
				});
				if (res.ok) {
					const body = await res.json();
					if (body?.success && Array.isArray(body?.data?.advisors) && active) {
						setAdvisors(body.data.advisors);
					}
				}
			} catch (e) {
				console.warn("Failed to fetch advisors data:", e);
			}
		})();
		return () => {
			active = false;
		};
	}, []);

	const schema = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "Our Advisors | MSSNOAU",
		description:
			"Profiles of the advisors for the Muslim Students Society of Nigeria, Obafemi Awolowo University Branch.",
		url: "https://mssnoau.org/our-advisors",
		publisher: {
			"@type": "Organization",
			name: "MSSN Obafemi Awolowo University Branch",
			logo: {
				"@type": "ImageObject",
				url: "https://mssnoau.org/mssn-logo.png",
			},
		},
		hasPart:
			advisors && advisors.length > 0
				? {
						"@type": "ItemList",
						itemListElement: advisors.map((advisor) => ({
							"@type": "Person",
							name: `${advisor.title ? advisor.title + " " : ""}${advisor.name}`,
							jobTitle: advisor.position,
							worksFor: {
								"@type": "Organization",
								name: "Obafemi Awolowo University",
							},
							...(advisor.department ? { department: advisor.department } : {}),
							...(advisor.email ? { email: advisor.email } : {}),
							...(advisor.photo ? { image: advisor.photo } : {}),
						})),
					}
				: undefined,
	};

	return (
		<>
			<Seo
				title="Our Advisors"
				description="Meet the esteemed advisors of the Muslim Students Society of Nigeria, OAU Branch. Find their profiles, departments, and contact information."
				path="/our-advisors"
				type="CollectionPage"
				images={[
					{
						url: "https://i.ibb.co/HqK7S8Z/our-advisors.webp",
						width: 1200,
						height: 640,
						alt: "MSSN OAU Advisors Page",
					},
				]}
				schema={schema}
				keywords={[
					"mssn oau advisors",
					"mssnoau advisors",
					"oau muslim advisors",
					"mssn oau patrons",
					"islamic guidance oau",
				]}
			/>

			<PageHeader subtitle="Trusted voices guiding the MSSN OAU family — meet the scholars, patrons and mentors shaping our journey.">
				<div className="relative">
					<h1 className="relative z-10 animate-fade-in">
						Our Advisors
						<span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-primary-600 rounded-full" />
					</h1>
				</div>
				<br />
			</PageHeader>

			<div className="py-12 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					{advisors.length > 0 ? (
						<div className="grid grid-cols-1 gap-8">
							{advisors.map((advisor) => (
								<div key={advisor.id ?? advisor.name} className="mx-auto w-full max-w-3xl animate-fade-in">
									<div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
										<div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

										<div className="relative z-10 p-6 sm:p-8">
											<div className="flex flex-col md:flex-row gap-6 items-start">
												<div className="relative mx-auto md:mx-0 mb-4 md:mb-0">
													<div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 backdrop-blur-sm -z-10 transform scale-110" />
													<img
														src={advisor.photo || getAdvisorPlaceholder(advisor)}
														alt={`Photo of ${[advisor.title, advisor.name].filter(Boolean).join(" ")}`}
														className="w-32 h-32 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-105"
													/>
												</div>

												<div className="flex-grow">
													<div className="flex justify-between items-start">
														<div>
															<h2 className="font-secondary font-bold text-primary-800 text-xl sm:text-2xl group-hover:text-primary-700 transition-colors duration-300">
																{[advisor.title, advisor.name].filter(Boolean).join(" ")}
															</h2>
															<p className="text-gray-700 font-semibold font-secondary text-lg mt-1">
																{advisor.position}
															</p>
															<p className="text-gray-600 text-sm mt-1">{advisor.department}</p>
														</div>
													</div>

													<div className="mt-4">
														<p className="font-tertiary tracking-wide text-gray-700 leading-relaxed">
															{advisor.summary}
														</p>
													</div>

													<div className="mt-4 flex flex-wrap gap-2">
														{advisor.phone ? (
															<>
																<a
																	href={`tel:${advisor.phone}`}
																	className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors duration-300"
																>
																	<Phone className="w-3 h-3" />
																	Call
																</a>
																<a
																	href={`sms:${advisor.phone}`}
																	className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors duration-300"
																>
																	<MessageCircle className="w-3 h-3" />
																	SMS
																</a>
																{advisor.socials?.whatsapp ? (
																	<a
																		href={`https://wa.me/${advisor.socials.whatsapp.replace(/\+/g, "")}`}
																		className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		WhatsApp
																	</a>
																) : null}
															</>
														) : null}

														{advisor.email ? (
															<a
																href={`mailto:${advisor.email}`}
																className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-300"
															>
																<Mail className="w-3 h-3" />
																Email
															</a>
														) : null}

														{advisor.socials?.linkedin ? (
															<a
																href={advisor.socials.linkedin}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors duration-300"
															>
																LinkedIn
															</a>
														) : null}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="max-w-lg mx-auto bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-md text-center">
							<div className="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="size-10 text-primary-400"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="8" x2="12" y2="12" />
									<line x1="12" y1="16" x2="12.01" y2="16" />
								</svg>
							</div>
							<h3 className="text-xl font-medium text-gray-800 mb-2">No Advisors Available</h3>
							<p className="text-gray-500 mb-6">
								We couldn't find any advisor information. Please check back later as we update our
								records.
							</p>

							<button
								type="button"
								onClick={() => window.location.reload()}
								className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
							>
								Refresh Page
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
