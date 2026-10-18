import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, GraduationCap, Mail, MessageSquareText, X } from "lucide-react";
import { API_BASE } from "~/lib/api/base";

const API_URL = `${API_BASE}/public/alumni`;

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

interface AlumniSectionProps {
	sessions?: AlumniSession[];
}

function sortSessionsNewestFirst(list: AlumniSession[]): AlumniSession[] {
	return [...list].sort((a, b) => {
		const aYear = parseInt(String(a?.session || "").split("/")[0]) || 0;
		const bYear = parseInt(String(b?.session || "").split("/")[0]) || 0;
		return bYear - aYear;
	});
}

function getPlaceholder(gender?: string) {
	return gender === "female" ? "/images/user/female.jpg" : "/images/user/male.jpg";
}

export function AlumniSection({ sessions: initialSessions = [] }: AlumniSectionProps) {
	const [sessions, setSessions] = useState<AlumniSession[]>(sortSessionsNewestFirst(initialSessions));
	const [loading, setLoading] = useState(false);
	const [selectedMember, setSelectedMember] = useState<any | null>(null);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		let active = true;
		if (!sessions || sessions.length === 0) {
			setLoading(true);
			(async () => {
				try {
					const res = await fetch(API_URL, { signal: AbortSignal.timeout(10000) });
					if (res.ok) {
						const body = await res.json();
						if (active && body?.success && body?.data?.alumni?.sessions) {
							setSessions(sortSessionsNewestFirst(body.data.alumni.sessions));
						}
					}
				} catch (e) {
					console.warn("Failed to fetch alumni data:", e);
				} finally {
					if (active) setLoading(false);
				}
			})();
		}
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pastLeaders = sessions.slice(0, 3).map((s) => {
		const members = s.members || [];
		const ameer = members.find(
			(m) => m.position?.toLowerCase().includes("ameer") && m.gender === "male"
		);
		const ameerah = members.find(
			(m) => m.position?.toLowerCase().includes("ameer") && m.gender === "female"
		);
		return { session: s.session, ameer, ameerah };
	});

	function openMember(member: any) {
		setSelectedMember(member);
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
		setSelectedMember(null);
	}

	return (
		<section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
				<div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-700/5 rounded-full blur-3xl" />
			</div>

			<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="text-center mb-12 animate-fade-in">
					<div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
						<GraduationCap className="w-4 h-4" />
						Legacy of Leadership
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
						Past <span className="text-green-700">Ameers &amp; Ameerahs</span>
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
						The leaders who shaped MSSN OAU across the years.
					</p>
				</div>

				{loading ? (
					<div className="flex justify-center py-12">
						<div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
					</div>
				) : pastLeaders.length === 0 ? (
					<div className="text-center py-12 text-gray-400 text-sm">
						No alumni data available yet.
					</div>
				) : (
					<div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
						{pastLeaders.map((leader) => (
							<div
								key={leader.session}
								className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex items-center gap-3 p-4 border-b border-gray-100">
									<h3 className="font-bold text-gray-900">{leader.session} Session</h3>
									<div className="flex-1 h-px bg-gray-200" />
								</div>
								<div className="grid grid-cols-2 divide-x divide-gray-100">
									{leader.ameer ? (
										<button
											type="button"
											onClick={() => openMember(leader.ameer)}
											className="p-5 text-center group"
										>
											<img
												src={getPlaceholder(leader.ameer.gender)}
												alt={leader.ameer.name}
												loading="lazy"
												className="w-20 h-20 object-cover rounded-full mx-auto mb-3 ring-2 ring-green-200 group-hover:ring-green-400 transition-all"
											/>
											<p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">
												{leader.ameer.name}
											</p>
											<p className="text-xs text-gray-500">{leader.ameer.position}</p>
										</button>
									) : (
										<div className="p-5 text-center text-gray-300 text-xs flex items-center justify-center">
											No Ameer recorded
										</div>
									)}
									{leader.ameerah ? (
										<button
											type="button"
											onClick={() => openMember(leader.ameerah)}
											className="p-5 text-center group"
										>
											<img
												src={getPlaceholder(leader.ameerah.gender)}
												alt={leader.ameerah.name}
												loading="lazy"
												className="w-20 h-20 object-cover rounded-full mx-auto ring-2 ring-green-100 group-hover:ring-green-300 transition-all"
											/>
											<p className="mt-2 font-semibold text-gray-900 group-hover:text-green-700">
												{leader.ameerah.name}
											</p>
											<p className="text-xs text-green-600 font-medium mt-0.5">Ameerah</p>
											{leader.ameerah.department ? (
												<p className="text-[11px] text-gray-400 mt-1">
													{leader.ameerah.department}
												</p>
											) : null}
											{leader.ameerah.currentRole ? (
												<p className="text-[11px] text-amber-600 font-medium mt-1">
													{leader.ameerah.currentRole}
												</p>
											) : null}
										</button>
									) : (
										<div className="p-5 text-center flex items-center justify-center">
											<p className="text-xs text-gray-400 italic">Ameerah not listed</p>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				<div className="text-center mt-12">
					<Link
						to="/alumni"
						className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-8 py-3 text-sm font-semibold font-secondary text-white shadow-sm transition-all duration-300 hover:bg-green-800 hover:-translate-y-1 hover:shadow-lg"
					>
						View All Alumni
						<ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>

			{showModal && selectedMember ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100 animate-fade-in">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-gray-900">{selectedMember.name}</h3>
							<button type="button" onClick={closeModal} aria-label="Close">
								<X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
							</button>
						</div>

						<div className="text-center">
							<img
								src={getPlaceholder(selectedMember.gender)}
								alt={selectedMember.name}
								className="w-24 h-24 object-cover rounded-full mx-auto ring-2 ring-green-200"
							/>
							<p className="mt-3 text-sm font-medium text-green-600">{selectedMember.position}</p>
							{selectedMember.session ? (
								<p className="text-xs text-gray-500">{selectedMember.session} Session</p>
							) : null}
						</div>

						{selectedMember.currentRole ? (
							<div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
								<p className="text-[11px] text-amber-600 uppercase tracking-wide font-medium">
									Current Role
								</p>
								<p className="text-sm font-bold text-amber-800">
									{selectedMember.currentRole}
									{selectedMember.company ? ` @ ${selectedMember.company}` : ""}
								</p>
							</div>
						) : null}

						<div className="space-y-2 text-xs border-t pt-3">
							{selectedMember.phone ? (
								<a
									href={`https://wa.me/${String(selectedMember.phone).replace(/\D/g, "")}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-start font-medium text-green-700 hover:underline"
								>
									<MessageSquareText className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Chat on
									WhatsApp
								</a>
							) : null}
							{selectedMember.email ? (
								<a
									href={`mailto:${selectedMember.email}`}
									className="flex items-center justify-start font-medium text-green-700 hover:underline"
								>
									<Mail className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> {selectedMember.email}
								</a>
							) : null}
						</div>

						<div className="pt-3 border-t border-gray-100">
							<button
								type="button"
								onClick={closeModal}
								className="w-full py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}
