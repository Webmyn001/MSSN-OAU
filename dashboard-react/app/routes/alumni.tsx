import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import {
	loadAlumniData,
	saveAlumniData,
	fetchAlumniDataFromApi,
} from "~/lib/stores/alumniStore";
import type { AlumniData, Alumnus } from "~/lib/data/sampleAlumni";
import { GraduationCap, Plus, Edit, Trash2, Save, UserPlus, X } from "lucide-react";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Alumni() {
	const [alumniData, setAlumniData] = useState<AlumniData>({ sessions: [] });
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
	const [isFormModalOpen, setIsFormModalOpen] = useState(false);
	const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);

	const [formSession, setFormSession] = useState("");
	const [ameerName, setAmeerName] = useState("");
	const [ameerDepartment, setAmeerDepartment] = useState("");
	const [ameerPhone, setAmeerPhone] = useState("");
	const [ameerEmail, setAmeerEmail] = useState("");
	const [ameerCurrentRole, setAmeerCurrentRole] = useState("");
	const [ameerCompany, setAmeerCompany] = useState("");
	const [ameerBio, setAmeerBio] = useState("");
	const [ameerahName, setAmeerahName] = useState("");
	const [ameerahDepartment, setAmeerahDepartment] = useState("");
	const [ameerahPhone, setAmeerahPhone] = useState("");
	const [ameerahEmail, setAmeerahEmail] = useState("");
	const [ameerahCurrentRole, setAmeerahCurrentRole] = useState("");
	const [ameerahCompany, setAmeerahCompany] = useState("");
	const [ameerahBio, setAmeerahBio] = useState("");

	const currentYear = new Date().getFullYear();
	const sessionOptions: string[] = [];
	for (let y = currentYear + 1; y >= 2015; y--) {
		sessionOptions.push(`${y}/${y + 1}`);
	}

	useEffect(() => {
		setAlumniData(loadAlumniData());
		void fetchAlumniDataFromApi().then((remoteData) => {
			if (remoteData) {
				setAlumniData(remoteData);
			}
		});
	}, []);

	function getMemberPlaceholder(gender?: string) {
		if (gender === "female") return "/images/user/female.jpg";
		return "/images/user/male.jpg";
	}

	function getAmeer(session: { members: Alumnus[] }): Alumnus | undefined {
		return session.members.find((m) => m.position === "Ameer");
	}

	function getAmeerah(session: { members: Alumnus[] }): Alumnus | undefined {
		return session.members.find((m) => m.position === "Ameerah");
	}

	function openAddSession() {
		setEditingSessionIdx(null);
		setFormSession("");
		setAmeerName("");
		setAmeerDepartment("");
		setAmeerPhone("");
		setAmeerEmail("");
		setAmeerCurrentRole("");
		setAmeerCompany("");
		setAmeerBio("");
		setAmeerahName("");
		setAmeerahDepartment("");
		setAmeerahPhone("");
		setAmeerahEmail("");
		setAmeerahCurrentRole("");
		setAmeerahCompany("");
		setAmeerahBio("");
		setIsFormModalOpen(true);
	}

	function openEditSession(idx: number) {
		const s = alumniData.sessions[idx];
		if (!s) return;
		setEditingSessionIdx(idx);
		setFormSession(s.session);
		const ameer = getAmeer(s);
		const ameerah = getAmeerah(s);
		setAmeerName(ameer?.name || "");
		setAmeerDepartment(ameer?.department || "");
		setAmeerPhone(ameer?.phone || "");
		setAmeerEmail(ameer?.email || "");
		setAmeerCurrentRole(ameer?.currentRole || "");
		setAmeerCompany(ameer?.company || "");
		setAmeerBio(ameer?.bio || "");
		setAmeerahName(ameerah?.name || "");
		setAmeerahDepartment(ameerah?.department || "");
		setAmeerahPhone(ameerah?.phone || "");
		setAmeerahEmail(ameerah?.email || "");
		setAmeerahCurrentRole(ameerah?.currentRole || "");
		setAmeerahCompany(ameerah?.company || "");
		setAmeerahBio(ameerah?.bio || "");
		setIsFormModalOpen(true);
	}

	async function handleSave(e: React.FormEvent) {
		e.preventDefault();
		if (!formSession.trim()) {
			toast("error", "Session is required.");
			return;
		}
		if (!ameerName.trim() || !ameerahName.trim()) {
			toast("error", "Both Ameer and Ameerah names are required.");
			return;
		}

		const dataCopy: AlumniData = JSON.parse(JSON.stringify(alumniData));

		const ameer: Alumnus = {
			id: `alumni-ameer-${formSession.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}`,
			name: ameerName.trim(),
			position: "Ameer",
			gender: "male",
			session: formSession.trim(),
			department: ameerDepartment.trim() || undefined,
			phone: ameerPhone.trim() || undefined,
			email: ameerEmail.trim() || undefined,
			currentRole: ameerCurrentRole.trim() || undefined,
			company: ameerCompany.trim() || undefined,
			bio: ameerBio.trim() || undefined,
		};

		const ameerah: Alumnus = {
			id: `alumni-ameerah-${formSession.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}`,
			name: ameerahName.trim(),
			position: "Ameerah",
			gender: "female",
			session: formSession.trim(),
			department: ameerahDepartment.trim() || undefined,
			phone: ameerahPhone.trim() || undefined,
			email: ameerahEmail.trim() || undefined,
			currentRole: ameerahCurrentRole.trim() || undefined,
			company: ameerahCompany.trim() || undefined,
			bio: ameerahBio.trim() || undefined,
		};

		if (editingSessionIdx !== null) {
			dataCopy.sessions[editingSessionIdx] = {
				session: formSession.trim(),
				start_year: parseInt(formSession.split("/")[0]) || new Date().getFullYear(),
				end_year: (parseInt(formSession.split("/")[0]) || new Date().getFullYear()) + 1,
				members: [ameer, ameerah],
			};
		} else {
			dataCopy.sessions.unshift({
				session: formSession.trim(),
				start_year: parseInt(formSession.split("/")[0]) || new Date().getFullYear(),
				end_year: (parseInt(formSession.split("/")[0]) || new Date().getFullYear()) + 1,
				members: [ameer, ameerah],
			});
		}

		setAlumniData(dataCopy);
		setIsFormModalOpen(false);

		toast("success", "Saving…");
		await saveAlumniData(dataCopy);
		const label = editingSessionIdx !== null ? "Updated" : "Added";
		toast("success", `${label} ${formSession} session.`);
	}

	function handleDeleteSession(idx: number) {
		const s = alumniData.sessions[idx];
		if (!s) return;
		setConfirmState({
			open: true,
			title: "Delete Session?",
			message: `Delete the ${s.session} session and its Ameer/Ameerah? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: AlumniData = JSON.parse(JSON.stringify(alumniData));
				dataCopy.sessions.splice(idx, 1);
				setAlumniData(dataCopy);
				toast("success", "Deleting…");
				await saveAlumniData(dataCopy);
				toast("success", `Deleted ${s.session} session.`);
			},
		});
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<GraduationCap className="w-7 h-7 text-green-700" />
							Past Ameers & Ameerahs
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">
							Manage past Ameers and Ameerahs by academic session.
						</p>
					</div>

					<button
						onClick={openAddSession}
						className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]"
					>
						<Plus className="w-4 h-4" />
						<span>Add Session</span>
					</button>
				</div>

				{alumniData.sessions.length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<GraduationCap className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No Sessions Added Yet</h3>
						<p className="text-xs text-gray-500 max-w-sm mx-auto">
							Add an academic session with the Ameer and Ameerah details.
						</p>
						<button
							onClick={openAddSession}
							className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
						>
							<Plus className="w-4 h-4" />
							<span>Add First Session</span>
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{alumniData.sessions.map((session, idx) => (
							<div
								key={session.session}
								className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
							>
								<div className="px-5 py-3 bg-green-50/60 border-b border-green-100 flex items-center justify-between">
									<h3 className="text-sm font-bold text-green-900">{session.session} Session</h3>
									<div className="flex items-center space-x-1">
										<button
											onClick={() => openEditSession(idx)}
											className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
											title="Edit Session"
										>
											<Edit className="w-3.5 h-3.5" />
										</button>
										<button
											onClick={() => handleDeleteSession(idx)}
											className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
											title="Delete Session"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
									{(["Ameer", "Ameerah"] as const).map((position) => {
										const member = position === "Ameer" ? getAmeer(session) : getAmeerah(session);
										return (
											<div key={position} className="p-4 flex items-start space-x-4">
												<img
													src={getMemberPlaceholder(position === "Ameer" ? "male" : "female")}
													alt={member?.name || position}
													className="w-16 h-16 object-cover rounded-full shadow-sm border-2 border-white ring-2 ring-green-200 shrink-0"
												/>
												<div className="min-w-0 flex-1">
													{member?.name ? (
														<p className="text-sm font-bold text-green-950">{member.name}</p>
													) : (
														<p className="text-sm font-bold text-gray-400 italic">Not set</p>
													)}
													<p className="text-xs text-green-600 font-medium">{position}</p>
													{member?.department ? (
														<p className="text-[11px] text-gray-500 mt-0.5">{member.department}</p>
													) : null}
													<div className="flex flex-wrap gap-1.5 mt-1.5">
														{member?.phone ? (
															<a
																href={`https://wa.me/${member.phone.replace(/\D/g, "")}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 hover:bg-green-100"
															>
																Chat
															</a>
														) : null}
														{member?.email ? (
															<a
																href={`mailto:${member.email}`}
																className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 hover:bg-green-100"
															>
																Email
															</a>
														) : null}
														{member?.currentRole ? (
															<span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
																{member.currentRole}
																{member.company ? ` @ ${member.company}` : null}
															</span>
														) : null}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{isFormModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 text-xs max-h-[85vh] flex flex-col">
						<div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
							<h3 className="text-base font-bold text-green-950 flex items-center gap-2">
								<UserPlus className="w-5 h-5 text-green-700" />
								{editingSessionIdx !== null ? "Edit Session" : "Add Session"}
							</h3>
							<button
								onClick={() => setIsFormModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form id="alumni-form" onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
							<div>
								<label
									htmlFor="form-session"
									className="block font-semibold text-gray-700 mb-1"
								>
									Academic Session *
								</label>
								<input
									id="form-session"
									type="text"
									required
									placeholder="e.g. 2023/2024"
									value={formSession}
									onChange={(e) => setFormSession(e.target.value)}
									list="session-datalist"
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
								<datalist id="session-datalist">
									{sessionOptions.map((opt) => (
										<option key={opt} value={opt} />
									))}
								</datalist>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-3 p-4 bg-blue-50/40 rounded-xl border border-blue-100">
									<h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
										<img
											src="/images/user/male.jpg"
											alt=""
											className="w-5 h-5 rounded-full border border-blue-300"
										/>
										Ameer (Male)
									</h4>
									<input
										type="text"
										placeholder="Full Name *"
										value={ameerName}
										onChange={(e) => setAmeerName(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Department"
										value={ameerDepartment}
										onChange={(e) => setAmeerDepartment(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Phone"
										value={ameerPhone}
										onChange={(e) => setAmeerPhone(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="email"
										placeholder="Email"
										value={ameerEmail}
										onChange={(e) => setAmeerEmail(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Current Role"
										value={ameerCurrentRole}
										onChange={(e) => setAmeerCurrentRole(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Company"
										value={ameerCompany}
										onChange={(e) => setAmeerCompany(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<textarea
										rows={2}
										placeholder="Bio"
										value={ameerBio}
										onChange={(e) => setAmeerBio(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>

								<div className="space-y-3 p-4 bg-pink-50/40 rounded-xl border border-pink-100">
									<h4 className="text-xs font-bold text-pink-800 uppercase tracking-wide flex items-center gap-1.5">
										<img
											src="/images/user/female.jpg"
											alt=""
											className="w-5 h-5 rounded-full border border-pink-300"
										/>
										Ameerah (Female)
									</h4>
									<input
										type="text"
										placeholder="Full Name *"
										value={ameerahName}
										onChange={(e) => setAmeerahName(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Department"
										value={ameerahDepartment}
										onChange={(e) => setAmeerahDepartment(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Phone"
										value={ameerahPhone}
										onChange={(e) => setAmeerahPhone(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="email"
										placeholder="Email"
										value={ameerahEmail}
										onChange={(e) => setAmeerahEmail(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Current Role"
										value={ameerahCurrentRole}
										onChange={(e) => setAmeerahCurrentRole(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<input
										type="text"
										placeholder="Company"
										value={ameerahCompany}
										onChange={(e) => setAmeerahCompany(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<textarea
										rows={2}
										placeholder="Bio"
										value={ameerahBio}
										onChange={(e) => setAmeerahBio(e.target.value)}
										className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>

							<div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 sticky bottom-0 bg-white">
								<button
									type="button"
									onClick={() => setIsFormModalOpen(false)}
									className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-md inline-flex items-center space-x-1.5"
								>
									<Save className="w-4 h-4" />
									<span>Save Session</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			{/* Confirm Dialog */}
			<ConfirmDialog
				open={confirmState?.open ?? false}
				title={confirmState?.title ?? "Are you sure?"}
				message={confirmState?.message ?? ""}
				confirmLabel="Yes, Delete"
				cancelLabel="No, Cancel"
				onconfirm={() => {
					const action = confirmState?.action;
					setConfirmState(null);
					void action?.();
				}}
				oncancel={() => {
					setConfirmState(null);
				}}
			/>
		</>
	);
}
