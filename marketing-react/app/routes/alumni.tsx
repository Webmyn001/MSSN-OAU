import { useEffect, useState } from "react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { GraduationCap, Mail, MessageSquareText, X } from "lucide-react";
import { API_BASE } from "~/lib/api/base";
import { useSiteData } from "~/lib/hooks/useSiteData";

interface AlumniMember {
	name?: string;
	position?: string;
	session?: string;
	department?: string;
	phone?: string;
	email?: string;
	currentRole?: string;
	company?: string;
	bio?: string;
	gender?: string;
}

interface AlumniSession {
	session: string;
	members?: AlumniMember[];
}

const API_URL = `${API_BASE}/public/alumni`;

function getPlaceholder(gender?: string) {
	return gender === "female" ? "/images/user/female.jpg" : "/images/user/male.jpg";
}

function sortSessionsNewestFirst(list: any[]): any[] {
	return [...list].sort((a, b) => {
		const aYear = parseInt(String(a?.session || "").split("/")[0]) || 0;
		const bYear = parseInt(String(b?.session || "").split("/")[0]) || 0;
		return bYear - aYear;
	});
}

export default function AlumniPage() {
	const [alumniData] = useSiteData<{ sessions: any[] }>("alumni", { sessions: [] });
	const initial = alumniData?.sessions ?? [];

	const [sessions, setSessions] = useState<any[]>(() => sortSessionsNewestFirst(initial));
	const [loading, setLoading] = useState(true);
	const [selectedMember, setSelectedMember] = useState<any | null>(null);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		let active = true;
		(async () => {
			if (!sessions || sessions.length === 0) {
				setLoading(true);
				try {
					const res = await fetch(API_URL, { signal: AbortSignal.timeout(10000) });
					if (res.ok) {
						const body = await res.json();
						if (body?.success && body?.data?.alumni?.sessions && active) {
							setSessions(sortSessionsNewestFirst(body.data.alumni.sessions));
						}
					}
				} catch (e) {
					console.warn("Failed to fetch alumni data:", e);
				} finally {
					if (active) setLoading(false);
				}
			} else {
				setLoading(false);
			}
		})();
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function openMember(member: any) {
		setSelectedMember(member);
		setShowModal(true);
	}
	function closeModal() {
		setShowModal(false);
		setSelectedMember(null);
	}

	return (
		<>
			<Seo
				title="Our Alumni"
				description="Meet the past Ameers, Ameerahs, and leaders of MSSN OAU who now serve communities, industries, and nations across the globe."
				path="/alumni"
				type="WebPage"
				images={[
					{
						url: "https://i.ibb.co/4sznVXp/alumnae.webp",
						width: 1200,
						height: 640,
						alt: "MSSNOAU Alumni",
					},
				]}
				keywords={["mssnoau alumni", "oau muslim alumni", "mssn oau past leaders", "mssn oau ameer"]}
			/>

			<PageHeader subtitle="The legacy lives on — the past Ameers and Ameerah who built and carried the MSSN OAU spirit forward.">
				Our Alumni
			</PageHeader>

			<section className="pt-6 pb-16 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/10 rounded-full blur-3xl" />

				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center mb-10">
						<div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium">
							<GraduationCap className="w-4 h-4" />
							Alumni Network
						</div>
						<h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 font-secondary">
							Our Proud Alumni
						</h2>
						<p className="mt-3 text-gray-600 max-w-2xl mx-auto">
							A legacy of leadership, scholarship and service. Meet the brothers and sisters who
							have passed through the MSSN OAU family.
						</p>
					</div>

					{loading ? (
						<div className="flex justify-center py-20">
							<div className="animate-spin size-8 border-2 border-green-700 border-t-transparent rounded-full" />
						</div>
					) : sessions.length > 0 ? (
						<div className="space-y-10">
							{sessions.map((session: any) =>
								session.members && session.members.length > 0 ? (
									<div key={session.session}>
										<div className="flex items-center gap-3 mb-5">
											<h3 className="text-lg font-bold text-gray-900">{session.session} Session</h3>
											<div className="flex-1 h-px bg-gray-200" />
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
											{session.members.map((member: any, i: number) => (
												<button
													key={`${member.name}-${i}`}
													type="button"
													onClick={() => openMember(member)}
													className="text-center group"
												>
													<div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
														<img
															src={getPlaceholder(member.gender)}
															alt={member.name}
															className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
														/>
													</div>
													<p className="mt-2 text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
														{member.name}
													</p>
													<p className="text-xs text-gray-500">{member.position}</p>
												</button>
											))}
										</div>
									</div>
								) : null
							)}
						</div>
					) : (
						<div className="text-center py-20">
							<p className="text-gray-400 text-sm">No alumni data available yet.</p>
						</div>
					)}
				</div>
			</section>

			{showModal && selectedMember ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
					onClick={() => setShowModal(false)}
				>
					<div
						className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={() => setShowModal(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
						>
							<X className="w-5 h-5" />
						</button>

						<div className="text-center">
							<img
								src={getPlaceholder(selectedMember.gender)}
								alt={selectedMember.name}
								className="w-24 h-24 object-cover rounded-full mx-auto mb-4 ring-2 ring-green-200"
							/>
							<h3 className="text-lg font-bold text-gray-900">{selectedMember.name}</h3>
							<p className="text-sm text-green-600 font-medium">{selectedMember.position}</p>
							{selectedMember.session ? (
								<p className="text-xs text-gray-500 mt-1">{selectedMember.session} Session</p>
							) : null}

							{selectedMember.currentRole ? (
								<div className="mt-4 bg-amber-50 p-3 rounded-xl border border-amber-100">
									<p className="text-[11px] text-amber-600 uppercase tracking-wide font-medium">
										Current Role
									</p>
									<p className="text-sm font-bold text-amber-800">
										{selectedMember.currentRole}
										{selectedMember.company ? ` @ ${selectedMember.company}` : ""}
									</p>
								</div>
							) : null}

							{selectedMember.bio ? (
								<p className="mt-4 text-xs text-gray-600 bg-green-50/50 p-3 rounded-xl border border-green-100 italic">
									{selectedMember.bio}
								</p>
							) : null}

							{selectedMember.department ? (
								<p className="mt-4 text-sm text-gray-600">
									<span className="text-[11px] text-gray-400 uppercase tracking-wide block">
										Department
									</span>
									{selectedMember.department}
								</p>
							) : null}
						</div>

						<div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
							{selectedMember.phone ? (
								<a
									href={`https://wa.me/${String(selectedMember.phone).replace(/\D/g, "")}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-green-700 text-white text-xs font-semibold hover:bg-green-800"
								>
									<MessageSquareText className="w-4 h-4" /> Chat on WhatsApp
								</a>
							) : null}
							{selectedMember.email ? (
								<a
									href={`mailto:${selectedMember.email}`}
									className="flex items-center justify-center gap-2 w-full py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
								>
									<Mail className="w-4 h-4" /> Email
								</a>
							) : null}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
