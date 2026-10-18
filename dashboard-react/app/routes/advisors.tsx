import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import {
	loadAdvisorData,
	saveAdvisorData,
	clearAdvisorData,
	fetchAdvisorsDataFromApi,
} from "~/lib/stores/advisorStore";
import type { AdvisorData, Advisor } from "~/lib/data/sampleAdvisors";
import {
	BookUser,
	Plus,
	Edit,
	Trash2,
	Code,
	RotateCcw,
	Save,
	AlertCircle,
	Search,
	UserPlus,
	X,
	FileCode,
	Phone,
	Mail,
	MessageSquareText,
	Smartphone,
	Copy,
	Link as LinkIcon,
} from "lucide-react";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Advisors() {
	const location = useLocation();

	const [advisorData, setAdvisorData] = useState<AdvisorData>({ advisors: [] });
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"cards" | "json">("cards");

	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	const [jsonText, setJsonText] = useState("");
	const [jsonError, setJsonError] = useState<string | null>(null);

	const [isFormModalOpen, setIsFormModalOpen] = useState(false);
	const [formModalMode, setFormModalMode] = useState<"add" | "edit">("add");
	const [editingAdvisorId, setEditingAdvisorId] = useState<string | null>(null);

	const [formName, setFormName] = useState("");
	const [formTitle, setFormTitle] = useState("");
	const [formPosition, setFormPosition] = useState("");
	const [formGender, setFormGender] = useState<"male" | "female">("male");
	const [formDepartment, setFormDepartment] = useState("");
	const [formPhone, setFormPhone] = useState("");
	const [formEmail, setFormEmail] = useState("");
	const [formPhoto, setFormPhoto] = useState("");
	const [formSummary, setFormSummary] = useState("");
	const [formWhatsapp, setFormWhatsapp] = useState("");
	const [formLinkedin, setFormLinkedin] = useState("");

	const [activeAdvisorDetails, setActiveAdvisorDetails] = useState<{ advisor: Advisor } | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

	useEffect(() => {
		const local = loadAdvisorData();
		setAdvisorData(local);
		fetchAdvisorsDataFromApi().then((remote) => {
			const next = remote ?? local;
			setAdvisorData(next);
			setJsonText(JSON.stringify(next, null, 2));
		});
	}, []);

	useEffect(() => {
		const urlTab = new URLSearchParams(location.search).get("tab");
		if (urlTab === "json") setActiveTab("json");
	}, [location.search]);

	let displayedList = advisorData.advisors;
	if (searchQuery.trim()) {
		const q = searchQuery.toLowerCase();
		displayedList = displayedList.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				(a.position && a.position.toLowerCase().includes(q)) ||
				(a.department && a.department.toLowerCase().includes(q))
		);
	}
	const displayedAdvisors = displayedList;
	const totalDisplayedCount = displayedAdvisors.length;

	function getPlaceholder(gender?: string) {
		return gender === "female" ? "/images/user/female.jpg" : "/images/user/male.jpg";
	}

	async function handleApplyJson() {
		setJsonError(null);
		try {
			const parsed = JSON.parse(jsonText) as AdvisorData;
			if (!parsed || !Array.isArray(parsed.advisors)) {
				throw new Error('Invalid JSON: Must contain an "advisors" array.');
			}
			setAdvisorData(parsed);
			toast("success", "Saving…");
			await saveAdvisorData(parsed);
			toast("success", "JSON saved!");
		} catch (err) {
			const message = err instanceof Error && err.message ? err.message : "Invalid JSON";
			setJsonError(message);
			toast("error", `JSON Error: ${message}`);
		}
	}

	async function handleReset() {
		if (confirm("Clear all advisor data?")) {
			const data = await clearAdvisorData();
			setAdvisorData(data);
			setJsonText(JSON.stringify(data, null, 2));
			toast("success", "Advisor data cleared.");
		}
	}

	function openDetails(advisor: Advisor) {
		setActiveAdvisorDetails({ advisor });
		setIsDetailsModalOpen(true);
	}

	function copyDetails(advisor: Advisor) {
		const details = `${advisor.title || ""} ${advisor.name}\n${advisor.position || ""}, MSSN-OAU${
			advisor.department ? `\nDept: ${advisor.department}` : ""
		}${advisor.phone ? `\nPhone: ${advisor.phone}` : ""}${advisor.email ? `\nEmail: ${advisor.email}` : ""}`;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(details);
			toast("success", `Copied details for ${advisor.name}.`);
		}
	}

	function openAddModal() {
		setFormModalMode("add");
		setEditingAdvisorId(null);
		setFormName("");
		setFormTitle("");
		setFormPosition("");
		setFormGender("male");
		setFormDepartment("");
		setFormPhone("");
		setFormEmail("");
		setFormPhoto("");
		setFormSummary("");
		setFormWhatsapp("");
		setFormLinkedin("");
		setIsFormModalOpen(true);
	}

	function openEditModal(advisor: Advisor) {
		setFormModalMode("edit");
		setEditingAdvisorId(advisor.id);
		setFormName(advisor.name);
		setFormTitle(advisor.title || "");
		setFormPosition(advisor.position || "");
		setFormGender(advisor.gender || "male");
		setFormDepartment(advisor.department || "");
		setFormPhone(advisor.phone || "");
		setFormEmail(advisor.email || "");
		setFormPhoto(advisor.photo || "");
		setFormSummary(advisor.summary || "");
		setFormWhatsapp(advisor.socials?.whatsapp || "");
		setFormLinkedin(advisor.socials?.linkedin || "");
		setIsFormModalOpen(true);
	}

	async function handleSaveAdvisor(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!formName.trim()) {
			toast("error", "Name is required.");
			return;
		}

		const dataCopy: AdvisorData = JSON.parse(JSON.stringify(advisorData));

		let successMsg = "";
		const newAdvisor: Advisor = {
			id: editingAdvisorId || `advisor-${Date.now()}`,
			name: formName.trim(),
			title: formTitle.trim() || undefined,
			gender: formGender,
			position: formPosition.trim() || undefined,
			department: formDepartment.trim() || undefined,
			phone: formPhone.trim() || undefined,
			email: formEmail.trim() || undefined,
			photo: formPhoto.trim() || undefined,
			summary: formSummary.trim() || undefined,
			socials: {
				whatsapp: formWhatsapp.trim() || undefined,
				linkedin: formLinkedin.trim() || undefined,
			},
		};

		if (formModalMode === "add") {
			dataCopy.advisors.push(newAdvisor);
			successMsg = `Added "${newAdvisor.name}"`;
		} else if (formModalMode === "edit" && editingAdvisorId) {
			dataCopy.advisors = dataCopy.advisors.map((a) => (a.id === editingAdvisorId ? newAdvisor : a));
			successMsg = `Updated "${newAdvisor.name}"`;
		}

		setAdvisorData(dataCopy);
		setJsonText(JSON.stringify(dataCopy, null, 2));
		setIsFormModalOpen(false);
		await saveAdvisorData(dataCopy);
		if (successMsg) toast("success", successMsg);
	}

	function handleDeleteAdvisor(advisorId: string, advisorName: string) {
		setConfirmState({
			open: true,
			title: "Delete Advisor?",
			message: `Remove advisor "${advisorName}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: AdvisorData = JSON.parse(JSON.stringify(advisorData));
				dataCopy.advisors = dataCopy.advisors.filter((a) => a.id !== advisorId);
				setAdvisorData(dataCopy);
				setJsonText(JSON.stringify(dataCopy, null, 2));
				await saveAdvisorData(dataCopy);
				toast("success", `Removed "${advisorName}"`);
			},
		});
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<BookUser className="w-7 h-7 text-green-700" />
							Advisors Management
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">Manage advisory board members.</p>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleReset}
							className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
						>
							<RotateCcw className="w-4 h-4 text-gray-500" />
							<span className="hidden sm:inline">Reset</span>
						</button>
						<button
							onClick={openAddModal}
							className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]"
						>
							<UserPlus className="w-4 h-4" />
							<span>Add Advisor</span>
						</button>
					</div>
				</div>

				<div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
					<button
						onClick={() => setActiveTab("cards")}
						className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
							activeTab === "cards" ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<BookUser className="w-4 h-4" />
						<span>Cards ({totalDisplayedCount})</span>
					</button>
					<button
						onClick={() => setActiveTab("json")}
						className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
							activeTab === "json" ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
						}`}
					>
						<Code className="w-4 h-4" />
						<span>JSON Bulk Input</span>
					</button>
				</div>

				{activeTab === "cards" ? (
					<div className="space-y-8">
						<div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
							<div className="relative">
								<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
								<input
									type="text"
									placeholder="Search name, position, dept…"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
						</div>

						{displayedAdvisors.length === 0 ? (
							<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
								<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
									<BookUser className="w-6 h-6" />
								</div>
								<h3 className="text-base font-semibold text-green-950">No Advisors Found</h3>
								<p className="text-xs text-gray-500 max-w-sm mx-auto">No advisors matched your search.</p>
								<button
									onClick={openAddModal}
									className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
								>
									<Plus className="w-4 h-4" />
									<span>Add Advisor</span>
								</button>
							</div>
						) : (
							<div>
								<div className="text-lg text-green-800 font-semibold text-center py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-4 after:flex-1 after:border-t after:border-green-300 after:ms-4">
									<span className="relative px-4 py-1.5 bg-green-50 rounded-lg border border-green-200/60 shadow-xs">
										All Advisors ({displayedAdvisors.length})
									</span>
								</div>
								<div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-6">
									{displayedAdvisors.map((advisor) => (
										<div
											key={advisor.id}
											className="group text-center relative flex flex-col justify-between p-3 bg-white hover:bg-green-50/40 rounded-2xl border border-transparent hover:border-green-200/80 transition-all duration-300 shadow-xs hover:shadow-md"
										>
											<div>
												<div className="relative mb-3 mx-auto w-24 h-24">
													<img
														src={advisor.photo || getPlaceholder(advisor.gender)}
														alt={advisor.name}
														className="w-24 h-24 object-cover rounded-full shadow-md border-2 border-white ring-2 ring-green-300 group-hover:ring-4 group-hover:ring-green-500/70 transition-all duration-300 mx-auto"
														onError={(e) => {
															e.currentTarget.src = getPlaceholder(advisor.gender);
														}}
													/>
												</div>
												<h3 className="text-sm font-bold text-green-950 group-hover:text-green-700 transition-colors line-clamp-1">
													{[advisor.title, advisor.name].filter(Boolean).join(" ")}
												</h3>
												<p className="text-xs text-gray-600 group-hover:text-green-600 font-medium transition-colors line-clamp-2 mt-0.5">
													{advisor.position || "Advisor"}
												</p>
												{advisor.department ? (
													<p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{advisor.department}</p>
												) : null}
											</div>
											<div className="flex items-center justify-center space-x-1 pt-3 mt-2 border-t border-gray-100">
												<button
													onClick={() => openDetails(advisor)}
													className="px-2 py-1 text-[11px] font-semibold text-green-800 bg-green-100/80 hover:bg-green-200 rounded-md transition-colors"
													title="View Details"
												>
													View
												</button>
												<button
													onClick={() => openEditModal(advisor)}
													className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
													title="Edit"
												>
													<Edit className="w-3.5 h-3.5" />
												</button>
												<button
													onClick={() => handleDeleteAdvisor(advisor.id, advisor.name)}
													className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
													title="Delete"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				) : null}

				{activeTab === "json" ? (
					<div className="space-y-4">
						<div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm space-y-3">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div>
									<h3 className="text-sm font-bold text-green-950 flex items-center gap-2">
										<FileCode className="w-4 h-4 text-green-700" />
										JSON Raw Data Editor
									</h3>
									<p className="text-xs text-gray-500">Paste or edit complete JSON payload.</p>
								</div>
								<div className="flex items-center space-x-2">
									<button
										onClick={handleApplyJson}
										className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
									>
										<Save className="w-4 h-4" />
										<span>Apply &amp; Save</span>
									</button>
								</div>
							</div>
							{jsonError ? (
								<div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
									<AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
									<span>{jsonError}</span>
								</div>
							) : null}
							<textarea
								value={jsonText}
								rows={18}
								onChange={(e) => setJsonText(e.target.value)}
								className="w-full font-mono text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-600 leading-relaxed"
								placeholder="Paste Advisor JSON here..."
							/>
						</div>
					</div>
				) : null}
			</div>

			{isDetailsModalOpen && activeAdvisorDetails ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">
									{[activeAdvisorDetails.advisor.title, activeAdvisorDetails.advisor.name]
										.filter(Boolean)
										.join(" ")}
								</h3>
								<p className="text-xs text-gray-500">{activeAdvisorDetails.advisor.position || "Advisor"}</p>
							</div>
							<button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="space-y-4">
							<div className="flex justify-center">
								<img
									src={activeAdvisorDetails.advisor.photo || getPlaceholder(activeAdvisorDetails.advisor.gender)}
									alt={activeAdvisorDetails.advisor.name}
									className="w-28 h-28 object-cover rounded-full shadow-md border-4 border-white ring-2 ring-green-200"
								/>
							</div>
							{activeAdvisorDetails.advisor.department ? (
								<div className="text-center">
									<p className="text-[11px] text-gray-500 uppercase tracking-wide">Department</p>
									<p className="text-sm font-semibold text-green-950">{activeAdvisorDetails.advisor.department}</p>
								</div>
							) : null}
							{activeAdvisorDetails.advisor.summary ? (
								<p className="text-xs text-gray-600 text-center bg-green-50/50 p-3 rounded-xl border border-green-100 italic">
									{activeAdvisorDetails.advisor.summary}
								</p>
							) : null}
							<div className="space-y-2 text-xs border-t pt-3">
								{activeAdvisorDetails.advisor.phone ? (
									<>
										<a
											href={`tel:${activeAdvisorDetails.advisor.phone}`}
											className="flex items-center text-green-700 hover:underline justify-start font-medium"
										>
											<Phone className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Call:{" "}
											{activeAdvisorDetails.advisor.phone}
										</a>
										<a
											href={`https://wa.me/${activeAdvisorDetails.advisor.phone.replace(/\D/g, "")}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center text-green-700 hover:underline justify-start font-medium"
										>
											<MessageSquareText className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> WhatsApp
										</a>
										<a
											href={`sms:${activeAdvisorDetails.advisor.phone}`}
											className="flex items-center text-green-700 hover:underline justify-start font-medium"
										>
											<Smartphone className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> SMS
										</a>
									</>
								) : null}
								{activeAdvisorDetails.advisor.email ? (
									<a
										href={`mailto:${activeAdvisorDetails.advisor.email}`}
										className="flex items-center text-green-700 hover:underline justify-start font-medium"
									>
										<Mail className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> {activeAdvisorDetails.advisor.email}
									</a>
								) : null}
								{activeAdvisorDetails.advisor.socials?.linkedin ? (
									<a
										href={activeAdvisorDetails.advisor.socials.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center text-green-700 hover:underline justify-start font-medium"
									>
										<LinkIcon className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> LinkedIn Profile
									</a>
								) : null}
							</div>
						</div>
						<div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
							<button
								onClick={() => setIsDetailsModalOpen(false)}
								className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
							<button
								onClick={() => {
									if (activeAdvisorDetails) copyDetails(activeAdvisorDetails.advisor);
								}}
								className="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
							>
								<Copy className="w-3.5 h-3.5" />
								<span>Copy Details</span>
							</button>
						</div>
					</div>
				</div>
			) : null}

			{isFormModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 text-xs">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<h3 className="text-base font-bold text-green-950 flex items-center gap-2">
								<UserPlus className="w-5 h-5 text-green-700" />
								{formModalMode === "add" ? "Add Advisor" : "Edit Advisor"}
							</h3>
							<button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-700">
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleSaveAdvisor} className="space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-title" className="block font-semibold text-gray-700 mb-1">
										Title
									</label>
									<input
										id="form-title"
										type="text"
										placeholder="Dr."
										value={formTitle}
										onChange={(e) => setFormTitle(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label htmlFor="form-name" className="block font-semibold text-gray-700 mb-1">
										Full Name *
									</label>
									<input
										id="form-name"
										type="text"
										required
										placeholder="Dr. Amina Bello"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-position" className="block font-semibold text-gray-700 mb-1">
										Position
									</label>
									<input
										id="form-position"
										type="text"
										placeholder="Chief Adviser"
										value={formPosition}
										onChange={(e) => setFormPosition(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label htmlFor="form-gender" className="block font-semibold text-gray-700 mb-1">
										Gender
									</label>
									<select
										id="form-gender"
										value={formGender}
										onChange={(e) => setFormGender(e.target.value as "male" | "female")}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									>
										<option value="male">Male</option>
										<option value="female">Female</option>
									</select>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-department" className="block font-semibold text-gray-700 mb-1">
										Department
									</label>
									<input
										id="form-department"
										type="text"
										placeholder="Dept of Islamic Studies"
										value={formDepartment}
										onChange={(e) => setFormDepartment(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label htmlFor="form-phone" className="block font-semibold text-gray-700 mb-1">
										Phone
									</label>
									<input
										id="form-phone"
										type="text"
										placeholder="+2348031234567"
										value={formPhone}
										onChange={(e) => setFormPhone(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-email" className="block font-semibold text-gray-700 mb-1">
										Email
									</label>
									<input
										id="form-email"
										type="email"
										placeholder="name@oauife.edu.ng"
										value={formEmail}
										onChange={(e) => setFormEmail(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label htmlFor="form-whatsapp" className="block font-semibold text-gray-700 mb-1">
										WhatsApp
									</label>
									<input
										id="form-whatsapp"
										type="text"
										placeholder="2348031234567"
										value={formWhatsapp}
										onChange={(e) => setFormWhatsapp(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-linkedin" className="block font-semibold text-gray-700 mb-1">
										LinkedIn URL
									</label>
									<input
										id="form-linkedin"
										type="text"
										placeholder="https://linkedin.com/in/..."
										value={formLinkedin}
										onChange={(e) => setFormLinkedin(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label htmlFor="form-photo" className="block font-semibold text-gray-700 mb-1">
										Photo URL
									</label>
									<input
										id="form-photo"
										type="text"
										placeholder="/images/user/male.jpg"
										value={formPhoto}
										onChange={(e) => setFormPhoto(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>
							<div>
								<label htmlFor="form-summary" className="block font-semibold text-gray-700 mb-1">
									Summary / Bio
								</label>
								<textarea
									id="form-summary"
									rows={2}
									placeholder="Brief bio…"
									value={formSummary}
									onChange={(e) => setFormSummary(e.target.value)}
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
								<button
									type="button"
									onClick={() => setIsFormModalOpen(false)}
									className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-md"
								>
									Save Advisor
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			<ConfirmDialog
				open={confirmState?.open ?? false}
				title={confirmState?.title ?? "Are you sure?"}
				message={confirmState?.message ?? ""}
				confirmLabel="Yes, Delete"
				cancelLabel="No, Cancel"
				onconfirm={() => {
					const action = confirmState?.action;
					setConfirmState(null);
					action?.();
				}}
				oncancel={() => {
					setConfirmState(null);
				}}
			/>
		</>
	);
}
