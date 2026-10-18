import { useMemo, useRef, useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import {
	Award,
	Building2,
	Users,
	Info,
	X,
	ChevronDown,
	Phone,
	MessageSquareText,
	Mail,
	Smartphone,
	ExternalLink,
	Copy,
	Check,
	Contact,
} from "lucide-react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { ResponsiveModal } from "~/components/layout/ResponsiveModal";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { API_BASE } from "~/lib/api/base";
import { loadSiteData } from "~/lib/api/site-data";
import { SITE_URL } from "~/lib/config";
import copyTextToClipboard from "~/lib/utils/copy";
import type { Route } from "./+types/our-excos";

export async function loader(): Promise<{ excos: { sessions: any[] } }> {
	const data = await loadSiteData(fetch, ["excos"]);
	return { excos: data.excos || { sessions: [] } };
}

function sortSessionsNewestFirst(list: any[]): any[] {
	return [...list].sort((a, b) => {
		const aYear = parseInt(String(a.session || "").split("/")[0]) || 0;
		const bYear = parseInt(String(b.session || "").split("/")[0]) || 0;
		return bYear - aYear;
	});
}

function getPlaceholder(member: any): string {
	return member?.gender === "female" ? "/images/user/female.jpg" : "/images/user/male.jpg";
}

function getCommitteeIcon(committee: string) {
	const name = committee.toLowerCase();
	if (name.includes("executive")) return Award;
	if (name.includes("faculty") || name.includes("co-ordinator")) return Building2;
	return Users;
}

export default function OurExcosPage() {
	const { excos } = useLoaderData<typeof loader>();
	const initialSessions = useMemo(() => sortSessionsNewestFirst(excos?.sessions || []), [excos]);

	const [sessions, setSessions] = useState<any[]>(initialSessions);
	const [selectedSession, setSelectedSession] = useState<string | undefined>(
		initialSessions[0]?.session
	);
	const [sessionSelectorOpen, setSessionSelectorOpen] = useState(false);
	const [sessionQuery, setSessionQuery] = useState("");
	const [isLoaded, setIsLoaded] = useState(false);
	const [activeMember, setActiveMember] = useState<any | null>(null);
	const [memberModalOpen, setMemberModalOpen] = useState(false);
	const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const selectorRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const t = setTimeout(() => setIsLoaded(true), 300);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch(`${API_BASE}/public/excos`);
				if (res.ok) {
					const body = await res.json();
					if (body?.success && body?.data?.excos?.sessions && active) {
						const fresh = sortSessionsNewestFirst(body.data.excos.sessions);
						setSessions((prev) => (JSON.stringify(fresh) !== JSON.stringify(prev) ? fresh : prev));
					}
				}
			} catch (err) {
				console.warn("Client fetch for excos failed, keeping loaded state:", err);
			}
		})();
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
				setSessionSelectorOpen(false);
			}
		}
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, []);

	useEffect(() => {
		setSelectedCommittee(null);
	}, [selectedSession]);

	useEffect(() => {
		if (!selectedSession && sessions.length > 0) {
			setSelectedSession(sessions[0]?.session);
		}
	}, [sessions, selectedSession]);

	const currentSession = selectedSession
		? sessions.find((s) => s.session === selectedSession)
		: undefined;

	const stats = useMemo(() => {
		if (!currentSession?.executives)
			return { totalMembers: 0, committees: 0, maleCount: 0, femaleCount: 0 };
		const allMembers = currentSession.executives.flatMap((c: any) => c.members);
		return {
			totalMembers: allMembers.length,
			committees: currentSession.executives.length,
			maleCount: allMembers.filter((m: any) => m.gender === "male").length,
			femaleCount: allMembers.filter((m: any) => m.gender === "female").length,
		};
	}, [currentSession]);

	const filteredCommittees: any[] = selectedCommittee
		? currentSession?.executives?.filter((c: any) => c.committee === selectedCommittee) || []
		: currentSession?.executives || [];

	const filteredSessions = sessions.filter((s) =>
		String(s.session || "").toLowerCase().includes(sessionQuery.trim().toLowerCase())
	);

	function openMemberDetail(member: any, committeeName: string) {
		setActiveMember({ ...member, committeeName });
		setMemberModalOpen(true);
	}

	function closeMemberDetail() {
		setMemberModalOpen(false);
		setTimeout(() => setActiveMember(null), 300);
	}

	async function copyContact(member: any) {
		if (!member) return;
		const committeeName = member.committeeName || "";
		const details = `${member.name}\n${member.position}, ${committeeName}, MSSNOAU${
			member.phone ? `\nPhone: ${member.phone}` : ""
		}${member.email ? `\nEmail: ${member.email}` : ""}`;
		try {
			await copyTextToClipboard(details);
			setCopiedId(member.id);
			toast.success(`${member.name}'s details copied.`);
			setTimeout(() => setCopiedId(null), 2000);
		} catch {
			toast.error("Failed to copy details.");
		}
	}

	const schema = currentSession?.executives
		? {
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: `Our Executives ${selectedSession ? `- ${selectedSession} Session` : ""} | MSSNOAU`,
				description: `Meet the executives of the Muslim Students Society of Nigeria, OAU Branch for the ${selectedSession || "current"} session.`,
				url: `${SITE_URL}/our-excos${
					selectedSession ? "?session=" + encodeURIComponent(selectedSession) : ""
				}`,
				mainEntity: {
					"@type": "Organization",
					name: `MSSN OAU Executives - ${selectedSession || "Current"} Session`,
					member: currentSession.executives.flatMap((committee: any) =>
						committee.members.map((member: any) => ({
							"@type": "Person",
							name: member.name,
							jobTitle: `${member.position}, ${committee.committee}`,
							image: member.photo,
							telephone: member.phone,
							email: member.email,
							worksFor: {
								"@type": "Organization",
								name: "Muslim Students Society of Nigeria, OAU Branch",
							},
						}))
					),
				},
			}
		: undefined;

	const ogImage =
		excos?.sessions?.find((s: any) => s.session === selectedSession)?.executives?.[0]?.members?.[0]
			?.photo || "/images/bg-1.webp";

	return (
		<>
			<Seo
				title="Our Executives"
				description="Meet the executives of the Muslim Students Society of Nigeria, OAU Branch. Find contact information and committee details for various sessions."
				path="/our-excos"
				type="WebPage"
				images={[
					{
						url: ogImage,
						width: 1200,
						height: 630,
						alt: `MSSN OAU Executives ${selectedSession || ""}`,
					},
				]}
				schema={schema}
				keywords={[
					"mssn oau executives",
					"mssnoau excos",
					"muslim students oau leaders",
					"mssn oau committees",
					"oau mssn leadership",
				]}
			/>

			<PageHeader
				allowOverflow
				subtitle="The student leaders steering MSSN OAU through this session — meet the hands on deck."
			>
				<div className="relative">
					<h1 className="relative z-10 animate-fade-in">
						Our Executives
						<span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-green-600 rounded-full" />
					</h1>
				</div>
				<br />
				{sessions.length > 0 ? (
					<div>
						<div ref={selectorRef} className="relative flex justify-center">
							<button
								type="button"
								onClick={() => setSessionSelectorOpen((v) => !v)}
								className="group inline-flex items-center bg-white/20 hover:bg-white/30 border border-white/20 p-1 ps-4 rounded-full shadow-lg transition-all duration-300 mx-auto mt-4"
							>
								<span className="me-2 text-white text-sm font-medium">
									{selectedSession || "Choose Session"}
								</span>
								<span className="group-hover:bg-white/30 py-1.5 px-2.5 flex justify-center items-center rounded-full bg-white/20 font-semibold text-white text-sm transition-all duration-300">
									<ChevronDown className="shrink-0 size-4 transition-transform duration-300 group-hover:rotate-180" />
								</span>
							</button>

							{sessionSelectorOpen ? (
								<div className="absolute top-full mt-2 w-[300px] z-50 rounded-xl border border-green-100 shadow-xl bg-white overflow-hidden text-left">
									<input
										type="search"
										value={sessionQuery}
										onChange={(e) => setSessionQuery(e.target.value)}
										placeholder="Search Session..."
										className="w-full px-4 py-2.5 text-sm border-b border-green-100 outline-none"
									/>
									<div className="max-h-[300px] overflow-y-auto p-1">
										{filteredSessions.length > 0 ? (
											filteredSessions.map((sessionItem) => (
												<button
													key={sessionItem.session}
													type="button"
													onClick={() => {
														setSelectedSession(sessionItem.session);
														setSessionSelectorOpen(false);
														setSessionQuery("");
													}}
													className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-green-900"
												>
													{sessionItem.session}
												</button>
											))
										) : (
											<p className="py-6 text-center text-sm text-gray-400">No results found.</p>
										)}
									</div>
								</div>
							) : null}
						</div>
						<p className="text-white text-sm sm:text-base font-bold text-center mt-3 px-4 flex items-center justify-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
							<ChevronDown className="shrink-0 size-4" strokeWidth={2.5} />
							<span className="leading-snug">
								{sessions.length > 1
									? "Switch session above to explore executives from previous years."
									: `Showing the ${selectedSession} executives.`}
							</span>
						</p>
					</div>
				) : null}
			</PageHeader>

			<section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/5 rounded-full blur-3xl -z-10" />

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					{!isLoaded && sessions.length === 0 ? (
						<>
							<div className="text-center text-gray-500 py-10">Loading executive details...</div>
							{[0, 1].map((k) => (
								<div key={k} className="mb-16">
									<div className="text-xl h-8 bg-gray-200 rounded w-1/3 mx-auto animate-pulse my-3" />
									<div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
										{[0, 1, 2, 3].map((j) => (
											<div key={j} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
												<div className="flex flex-col items-center">
													<div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
													<div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
													<div className="h-4 bg-gray-200 rounded w-1/2" />
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</>
					) : null}

					{selectedSession && currentSession?.executives && currentSession.executives.length > 0 ? (
						<>
							{stats.totalMembers > 0 ? (
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 animate-fade-in">
									<div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
										<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
											<Users className="w-5 h-5 text-green-600" />
										</div>
										<p className="text-2xl sm:text-3xl font-bold text-green-700">
											{stats.totalMembers}
										</p>
										<p className="text-xs sm:text-sm text-gray-500 mt-1">Total Members</p>
									</div>
									<div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
										<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
											<Building2 className="w-5 h-5 text-blue-600" />
										</div>
										<p className="text-2xl sm:text-3xl font-bold text-blue-700">
											{stats.committees}
										</p>
										<p className="text-xs sm:text-sm text-gray-500 mt-1">Committees</p>
									</div>
									<div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
										<div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
											<span className="text-lg">&#9794;</span>
										</div>
										<p className="text-2xl sm:text-3xl font-bold text-indigo-700">
											{stats.maleCount}
										</p>
										<p className="text-xs sm:text-sm text-gray-500 mt-1">Brothers</p>
									</div>
									<div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
										<div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
											<span className="text-lg">&#9792;</span>
										</div>
										<p className="text-2xl sm:text-3xl font-bold text-pink-700">
											{stats.femaleCount}
										</p>
										<p className="text-xs sm:text-sm text-gray-500 mt-1">Sisters</p>
									</div>
								</div>
							) : null}

							<div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in">
								<button
									type="button"
									className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
										selectedCommittee === null
											? "bg-green-600 text-white shadow-md"
											: "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700"
									}`}
									onClick={() => setSelectedCommittee(null)}
								>
									All Committees
								</button>
								{currentSession.executives.map((committee: any) => {
									const Icon = getCommitteeIcon(committee.committee);
									return (
										<button
											key={committee.committee}
											type="button"
											onClick={() =>
												setSelectedCommittee((prev) =>
													prev === committee.committee ? null : committee.committee
												)
											}
											className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
												selectedCommittee === committee.committee
													? "bg-green-600 text-white shadow-md"
													: "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700"
											}`}
										>
											<Icon className="w-3.5 h-3.5" />
											{committee.committee}
										</button>
									);
								})}
							</div>

							{filteredCommittees.map((committee: any) => {
								const Icon = getCommitteeIcon(committee.committee);
								return (
									<div key={committee.committee} className="mb-14">
										<div className="flex items-center justify-center gap-3 mb-8">
											<div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-green-300" />
											<div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2.5">
												<Icon className="w-5 h-5 text-green-600" />
												<h2 className="text-base sm:text-lg font-semibold text-green-800 font-secondary">
													{committee.committee}
												</h2>
												<span className="bg-green-200 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
													{committee.members.length}
												</span>
											</div>
											<div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-green-300" />
										</div>

										<div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
											{committee.members.map((memberData: any) => (
												<button
													key={memberData.id ?? memberData.name}
													type="button"
													onClick={() => openMemberDetail(memberData, committee.committee)}
													className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center"
												>
													<div className="relative mb-4">
														<Image
															src={memberData.photo || getPlaceholder(memberData)}
															alt={memberData.name}
															width={96}
															height={96}
															className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-105"
														/>
														<div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
															<Contact className="w-3.5 h-3.5 text-white" />
														</div>
													</div>
													<h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-tight mb-1">
														{memberData.name}
													</h3>
													<p className="text-xs text-green-600 font-medium leading-tight">
														{memberData.position}
													</p>
												</button>
											))}
										</div>
									</div>
								);
							})}
						</>
					) : isLoaded && sessions.length > 0 ? (
						<div className="text-center py-12 px-4">
							<div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 shadow-sm w-full max-w-md text-center mx-auto">
								<div className="mb-6 bg-gray-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
									<Info className="size-10 text-gray-400" />
								</div>
								<h3 className="text-xl font-medium text-gray-800 mb-3">No Executives Found</h3>
								<p className="text-gray-500 text-sm">
									No executive members are listed for the {selectedSession || "selected"} session.
									Please select another session or check back later.
								</p>
							</div>
						</div>
					) : isLoaded && sessions.length === 0 ? (
						<div className="text-center py-12 px-4">
							<div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
								<div className="flex items-center">
									<Info className="h-6 w-6 text-yellow-500" />
									<div className="ml-3 text-left">
										<p className="text-yellow-700 text-lg font-medium">No Sessions Available</p>
										<p className="text-yellow-600 mt-1 text-sm">
											Currently, there are no executive sessions available. Please check back later.
										</p>
									</div>
								</div>
							</div>
						</div>
					) : null}
				</div>
			</section>

			{memberModalOpen && activeMember ? (
				<ResponsiveModal
					open={memberModalOpen}
					onOpenChange={(isOpen) => {
						if (!isOpen) closeMemberDetail();
					}}
					contentClass="sm:max-w-lg"
					footer={
						<div className="flex flex-col sm:flex-row gap-3 w-full">
							<Button variant="outline" onClick={closeMemberDetail} className="flex-1">
								Close
							</Button>
							<Button
								onClick={() => activeMember && copyContact(activeMember)}
								className="flex-1 bg-green-600 hover:bg-green-700 text-white"
								disabled={!activeMember?.phone && !activeMember?.email}
							>
								{copiedId === activeMember?.id ? (
									<>
										<Check className="mr-2 h-4 w-4" /> Copied!
									</>
								) : (
									<>
										<Copy className="mr-2 h-4 w-4" /> Copy Details
									</>
								)}
							</Button>
						</div>
					}
				>
					<div className="space-y-6">
						<div className="flex flex-col items-center pt-2">
							<div className="relative mb-4">
								<Image
									src={activeMember.photo || getPlaceholder(activeMember)}
									alt={activeMember.name}
									width={128}
									height={128}
									className="w-32 h-32 object-cover rounded-full shadow-xl border-4 border-white ring-2 ring-green-100"
								/>
								<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
									<Check className="w-4 h-4 text-white" />
								</div>
							</div>

							<h2 className="text-xl font-bold text-gray-900 text-center">{activeMember.name}</h2>
							<p className="text-green-600 font-medium text-sm mt-1">{activeMember.position}</p>
							<p className="text-gray-400 text-xs mt-0.5">{activeMember.committeeName}</p>
						</div>

						{activeMember.bio ? (
							<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
								<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
									Department & Level
								</h4>
								<p className="text-sm text-gray-700">{activeMember.bio}</p>
							</div>
						) : null}

						<div className="space-y-3">
							<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
								Contact Information
							</h4>

							{activeMember.phone ? (
								<div className="space-y-2">
									<a
										href={`tel:${activeMember.phone}`}
										className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
									>
										<div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
											<Phone className="w-5 h-5 text-green-600" />
										</div>
										<div className="flex-1">
											<p className="text-xs text-gray-500">Phone</p>
											<p className="text-sm font-medium text-gray-900">{activeMember.phone}</p>
										</div>
									</a>

									<a
										href={`https://wa.me/${String(activeMember.phone).replace(/\D/g, "")}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
									>
										<div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
											<MessageSquareText className="w-5 h-5 text-green-600" />
										</div>
										<div className="flex-1">
											<p className="text-xs text-gray-500">WhatsApp</p>
											<p className="text-sm font-medium text-gray-900">Chat on WhatsApp</p>
										</div>
										<ExternalLink className="w-4 h-4 text-gray-400" />
									</a>

									<a
										href={`sms:${activeMember.phone}`}
										className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
									>
										<div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
											<Smartphone className="w-5 h-5 text-gray-600" />
										</div>
										<div className="flex-1">
											<p className="text-xs text-gray-500">SMS</p>
											<p className="text-sm font-medium text-gray-900">Send a text message</p>
										</div>
									</a>
								</div>
							) : null}

							{activeMember.email ? (
								<a
									href={`mailto:${activeMember.email}`}
									className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
								>
									<div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
										<Mail className="w-5 h-5 text-blue-600" />
									</div>
									<div className="flex-1">
										<p className="text-xs text-gray-500">Email</p>
										<p className="text-sm font-medium text-gray-900">{activeMember.email}</p>
									</div>
									<ExternalLink className="w-4 h-4 text-gray-400" />
								</a>
							) : null}

							{!activeMember.phone && !activeMember.email ? (
								<p className="text-center text-gray-400 text-sm py-4">
									No contact information available
								</p>
							) : null}
						</div>

						{activeMember.socials && activeMember.socials.length > 0 ? (
							<div>
								<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
									Social Links
								</h4>
								<div className="flex flex-wrap gap-2">
									{activeMember.socials.map((social: any) => (
										<Button
											key={social.platform}
											asChild
											variant="outline"
											size="sm"
											className="text-xs"
										>
											<a href={social.link} target="_blank" rel="noopener noreferrer">
												{social.platform} <ExternalLink className="h-3 w-3 ml-1" />
											</a>
										</Button>
									))}
								</div>
							</div>
						) : null}
					</div>
				</ResponsiveModal>
			) : null}
		</>
	);
}
