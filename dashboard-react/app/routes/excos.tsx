import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import {
	loadExcosData,
	saveExcosData,
	resetExcosDataToEmpty,
	fetchExcosDataFromApi,
} from "~/lib/stores/excoStore";
import type {
	ExcosData,
	ExecutiveMember,
	ExecutiveSession,
} from "~/lib/data/sampleExcos";
import {
	Users,
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
} from "lucide-react";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	action: () => Promise<void> | void;
}

const currentYear = new Date().getFullYear();
const sessionOptions: string[] = [];
for (let y = currentYear + 1; y >= 2015; y--) {
	sessionOptions.push(`${y}/${y + 1}`);
}

function sortSessionsNewestFirst(data: ExcosData): ExcosData {
	return {
		sessions: [...data.sessions].sort((a, b) => {
			const aYear = parseInt(String(a.session || "").split("/")[0]) || 0;
			const bYear = parseInt(String(b.session || "").split("/")[0]) || 0;
			return bYear - aYear;
		}),
	};
}

export default function Excos() {
	const [searchParams] = useSearchParams();

	const [excosData, setExcosData] = useState<ExcosData>({ sessions: [] });
	const [selectedSession, setSelectedSession] = useState<string>("");
	const [selectedCommittee, setSelectedCommittee] = useState<string>("All");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [activeTab, setActiveTab] = useState<"cards" | "json">("cards");

	const [, setIsSaving] = useState(false);

	// JSON Editor State
	const [jsonText, setJsonText] = useState<string>("");
	const [jsonError, setJsonError] = useState<string | null>(null);
	// When false (default), JSON applies MERGE into current sessions (nothing is removed).
	// When true, JSON replaces ALL sessions (advanced).
	const [jsonReplaceMode, setJsonReplaceMode] = useState(false);

	// Member Add/Edit Form Modal State
	const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
	const [formModalMode, setFormModalMode] = useState<"add" | "edit">("add");
	const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

	// Add New Session Modal State
	const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
	const [newSessionValue, setNewSessionValue] = useState<string>("");

	// Form fields
	const [formSession, setFormSession] = useState<string>("");
	const [formCommittee, setFormCommittee] = useState<string>("Executive Council");
	const [formName, setFormName] = useState<string>("");
	const [formPosition, setFormPosition] = useState<string>("");
	const [formGender, setFormGender] = useState<"male" | "female">("male");
	const [formPhone, setFormPhone] = useState<string>("");
	const [formEmail, setFormEmail] = useState<string>("");
	const [formPhoto, setFormPhoto] = useState<string>("");
	const [formBio, setFormBio] = useState<string>("");

	// Details View Modal State (Matching User Page)
	const [activeMemberDetails, setActiveMemberDetails] = useState<{
		member: ExecutiveMember;
		committee: string;
	} | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

	// Confirm dialog state for destructive actions
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const data = sortSessionsNewestFirst(loadExcosData());
			if (cancelled) return;
			setExcosData(data);
			if (data.sessions.length > 0) {
				setSelectedSession(data.sessions[0].session);
			}
			setJsonText(JSON.stringify(data, null, 2));

			const remoteData = await fetchExcosDataFromApi();
			if (cancelled) return;
			if (remoteData && remoteData.sessions && remoteData.sessions.length > 0) {
				const sortedRemote = sortSessionsNewestFirst(remoteData);
				setExcosData(sortedRemote);
				setSelectedSession((prev) =>
					sortedRemote.sessions.some((s) => s.session === prev) ? prev : sortedRemote.sessions[0].session
				);
				setJsonText(JSON.stringify(sortedRemote, null, 2));
			}

			// Check query params for tab
			if (searchParams.get("tab") === "json") {
				setActiveTab("json");
			}
		})();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Derived current session data
	const currentSessionObj = excosData.sessions.find((s) => s.session === selectedSession);

	// Available committees in selected session
	function availableCommittees(): string[] {
		if (!currentSessionObj) return [];
		return currentSessionObj.executives.map((c) => c.committee);
	}

	// Grouped committees & members for rendering (user page layout format)
	function displayedCommittees(): { committee: string; members: ExecutiveMember[] }[] {
		if (!currentSessionObj) return [];
		const list: { committee: string; members: ExecutiveMember[] }[] = [];

		for (const comm of currentSessionObj.executives) {
			if (selectedCommittee !== "All" && comm.committee !== selectedCommittee) {
				continue;
			}
			let matchingMembers = comm.members;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				matchingMembers = comm.members.filter(
					(m) =>
						m.name.toLowerCase().includes(q) ||
						m.position.toLowerCase().includes(q) ||
						comm.committee.toLowerCase().includes(q)
				);
			}

			if (matchingMembers.length > 0) {
				list.push({ committee: comm.committee, members: matchingMembers });
			}
		}

		return list;
	}

	// Total count of displayed members
	function totalDisplayedMembersCount(): number {
		return displayedCommittees().reduce((sum, c) => sum + c.members.length, 0);
	}

	// Helper for gender placeholder images matching user page
	function getMemberPlaceholder(gender?: string) {
		if (gender === "female") return "/images/user/female.jpg";
		return "/images/user/male.jpg";
	}

	// --- Actions & Handlers ---

	// Accept either { "sessions": [...] }, a single session object, or a bare array of sessions
	function toSessionArray(parsed: unknown): any[] {
		if (!parsed) return [];
		const p = parsed as Record<string, unknown>;
		if (Array.isArray(p.sessions)) return p.sessions as any[];
		if (Array.isArray(parsed)) return parsed as any[];
		if (p.session && Array.isArray(p.executives)) return [p as any];
		return [];
	}

	// Apply & Save JSON - validates first, then confirms the plan before saving.
	// Default mode merges: existing sessions are always kept, pasted sessions are added/updated.
	function requestApplyJson() {
		setJsonError(null);
		let parsed: any;
		try {
			parsed = JSON.parse(jsonText);
		} catch (err: any) {
			const msg = err.message || "Invalid JSON format";
			setJsonError(msg);
			toast("error", `JSON Error: ${msg}`);
			return;
		}

		const incoming = toSessionArray(parsed).filter((s) => s?.session?.trim());
		if (incoming.length === 0) {
			const msg =
				'No sessions found in the JSON. Paste a session block like { "session": "2025/2026", "executives": [...] } or { "sessions": [ ... ] }.';
			setJsonError(msg);
			toast("error", `JSON Error: ${msg}`);
			return;
		}

		const newNames: string[] = incoming.map((s) => String(s.session).trim());
		const existingNames: string[] = excosData.sessions.map((s) => s.session);
		const added = newNames.filter((s) => !existingNames.includes(s));
		const updated = newNames.filter((s) => existingNames.includes(s));
		const removed = jsonReplaceMode ? existingNames.filter((s) => !newNames.includes(s)) : [];

		if (!jsonReplaceMode && updated.length === 0 && added.length === 0) {
			toast("success", "The JSON matches the current data — nothing to change.");
			return;
		}

		const message = jsonReplaceMode
			? `${removed.length > 0 ? `⚠ ${removed.length} current session(s) will be REMOVED: ${removed.join(", ")}. ` : ""}${
					added.length > 0 ? `New session(s) added: ${added.join(", ")}. ` : ""
				}${updated.length > 0 ? `Updated: ${updated.join(", ")}.` : ""}Only sessions in the JSON box will remain.`
			: `Existing sessions are kept. Added: ${added.length > 0 ? added.join(", ") : "none"}. ${
					updated.length > 0 ? `Updated (roster replaced): ${updated.join(", ")}.` : ""
				} Continue?`;

		setConfirmState({
			open: true,
			title: jsonReplaceMode && removed.length > 0 ? "This will REMOVE sessions!" : "Apply JSON?",
			message,
			confirmLabel: jsonReplaceMode ? "Yes, Apply & Save" : "Yes, Merge & Save",
			cancelLabel: "No, Cancel",
			action: () => handleApplyJsonSave(parsed),
		});
	}

	// Merge/replace parsed sessions into the current data, then sync to the marketing site
	async function handleApplyJsonSave(parsed: any) {
		const incoming = toSessionArray(parsed).filter((s) => s?.session?.trim());
		if (incoming.length === 0) return;
		setIsSaving(true);
		toast("success", "Saving & syncing to marketing site…");
		try {
			// Start from the CURRENT live data so other sessions are never lost
			const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));

			const keep = new Set<string>();
			for (const s of incoming) {
				const session = String(s.session).trim();
				const startYear =
					parseInt(String(s.start_year)) || parseInt(session.split("/")[0]) || new Date().getFullYear();
				const sessionObj: ExecutiveSession = {
					session,
					start_year: startYear,
					end_year: parseInt(String(s.end_year)) || startYear + 1,
					executives: Array.isArray(s.executives) ? s.executives : [],
				};
				const idx = dataCopy.sessions.findIndex((x) => x.session === session);
				if (idx === -1) dataCopy.sessions.push(sessionObj);
				else dataCopy.sessions[idx] = sessionObj;
				keep.add(session);
			}

			// Advanced replace mode: drop anyone not mentioned in the JSON
			if (jsonReplaceMode) {
				dataCopy.sessions = dataCopy.sessions.filter((s) => keep.has(s.session));
			}

			const sorted = sortSessionsNewestFirst(dataCopy);
			setExcosData(sorted);
			if (sorted.sessions.length > 0 && !sorted.sessions.some((s) => s.session === selectedSession)) {
				setSelectedSession(sorted.sessions[0].session);
			}
			setSelectedCommittee("All");
			setJsonText(JSON.stringify(sorted, null, 2));
			await saveExcosData(sorted);
			toast("success", "✅ JSON applied & synced! Existing sessions were kept.");
		} catch (err: any) {
			const msg = err.message || "Failed to apply JSON";
			setJsonError(msg);
			toast("error", `JSON Error: ${msg}`);
		}
		setIsSaving(false);
	}

	// Reset the JSON editor back to the current live data (discards any stale paste)
	function resetJsonToCurrent() {
		setJsonText(JSON.stringify(excosData, null, 2));
		setJsonError(null);
		toast("success", "JSON editor reset to the current live data.");
	}

	// Reset dataset to empty
	async function handleResetToEmpty() {
		if (window.confirm("Clear all Exco data? This removes every session from the site.")) {
			setIsSaving(true);
			toast("success", "Clearing & syncing…");
			const cleared = await resetExcosDataToEmpty();
			setExcosData(cleared);
			setSelectedSession("");
			setJsonText(JSON.stringify(cleared, null, 2));
			setIsSaving(false);
			toast("success", "✅ All Exco data cleared & synced to marketing site.");
		}
	}

	// Open Details Modal
	function openMemberDetails(member: ExecutiveMember, committee: string) {
		setActiveMemberDetails({ member, committee });
		setIsDetailsModalOpen(true);
	}

	// Copy Details string matching user page format
	function copyMemberContactDetails(member: ExecutiveMember, committee: string) {
		const details = `${member.name}\n${member.position}, ${committee}, MSSNOAU${
			member.phone ? `\nPhone: ${member.phone}` : ""
		}${member.email ? `\nEmail: ${member.email}` : ""}`;

		if (navigator.clipboard) {
			navigator.clipboard.writeText(details);
			toast("success", `Copied details for ${member.name}.`);
		}
	}

	// Open Modal for Add
	function openAddModal() {
		setFormModalMode("add");
		setEditingMemberId(null);
		setFormSession(selectedSession || excosData.sessions[0]?.session || "2024/2025");
		setFormCommittee(availableCommittees()[0] || "Executive Council");
		setFormName("");
		setFormPosition("");
		setFormGender("male");
		setFormPhone("");
		setFormEmail("");
		setFormPhoto("");
		setFormBio("");
		setIsFormModalOpen(true);
	}

	// Open Modal for Edit
	function openEditModal(committee: string, member: ExecutiveMember) {
		setFormModalMode("edit");
		setEditingMemberId(member.id);
		setFormSession(selectedSession);
		setFormCommittee(committee);
		setFormName(member.name);
		setFormPosition(member.position);
		setFormGender(member.gender || "male");
		setFormPhone(member.phone || "");
		setFormEmail(member.email || "");
		setFormPhoto(member.photo || "");
		setFormBio(member.bio || "");
		setIsFormModalOpen(true);
	}

	// Save Member Form
	async function handleSaveMember(e: React.FormEvent) {
		e.preventDefault();
		if (!formName.trim() || !formPosition.trim()) {
			toast("error", "Name and Position are required fields.");
			return;
		}

		const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));

		// Target session
		let sessionObj = dataCopy.sessions.find((s) => s.session === formSession);
		if (!sessionObj) {
			const startYear = parseInt(formSession.split("/")[0]) || new Date().getFullYear();
			sessionObj = {
				session: formSession,
				start_year: startYear,
				end_year: startYear + 1,
				executives: [],
			};
			dataCopy.sessions.unshift(sessionObj);
		}

		// Target committee
		let committeeObj = sessionObj.executives.find((c) => c.committee === formCommittee);
		if (!committeeObj) {
			committeeObj = { committee: formCommittee, members: [] };
			sessionObj.executives.push(committeeObj);
		}

		let successMsg = "";
		if (formModalMode === "add") {
			const newMember: ExecutiveMember = {
				id: `exco-${Date.now()}`,
				name: formName.trim(),
				position: formPosition.trim(),
				gender: formGender,
				phone: formPhone.trim() || undefined,
				email: formEmail.trim() || undefined,
				photo: formPhoto.trim() || undefined,
				bio: formBio.trim() || undefined,
			};
			committeeObj.members.push(newMember);
			successMsg = `✅ Added "${newMember.name}" — synced to marketing site!`;
		} else if (formModalMode === "edit" && editingMemberId) {
			// Remove from current place
			for (const s of dataCopy.sessions) {
				for (const c of s.executives) {
					c.members = c.members.filter((m) => m.id !== editingMemberId);
				}
			}
			const updatedMember: ExecutiveMember = {
				id: editingMemberId,
				name: formName.trim(),
				position: formPosition.trim(),
				gender: formGender,
				phone: formPhone.trim() || undefined,
				email: formEmail.trim() || undefined,
				photo: formPhoto.trim() || undefined,
				bio: formBio.trim() || undefined,
			};
			committeeObj.members.push(updatedMember);
			successMsg = `✅ Updated "${updatedMember.name}" — synced to marketing site!`;
		}

		setExcosData(dataCopy);
		setSelectedSession(formSession);
		setJsonText(JSON.stringify(dataCopy, null, 2));
		setIsFormModalOpen(false);

		setIsSaving(true);
		toast("success", "Saving & syncing to marketing site…");
		await saveExcosData(dataCopy);
		setIsSaving(false);
		if (successMsg) toast("success", successMsg);
	}

	// Open Modal to create a brand-new empty session (previous sessions stay untouched)
	function openAddSession() {
		const nextYear = new Date().getFullYear();
		setNewSessionValue(`${nextYear}/${nextYear + 1}`);
		setIsSessionModalOpen(true);
	}

	// Save new empty session
	async function handleSaveSession(e: React.FormEvent) {
		e.preventDefault();
		const session = newSessionValue.trim();
		if (!session) {
			toast("error", "Session is required.");
			return;
		}
		if (excosData.sessions.some((s) => s.session === session)) {
			toast("error", `The ${session} session already exists.`);
			return;
		}
		const startYear = parseInt(session.split("/")[0]) || new Date().getFullYear();
		const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));
		dataCopy.sessions.unshift({
			session,
			start_year: startYear,
			end_year: startYear + 1,
			executives: [],
		});
		const sorted = sortSessionsNewestFirst(dataCopy);
		setExcosData(sorted);
		setSelectedSession(session);
		setSelectedCommittee("All");
		setJsonText(JSON.stringify(sorted, null, 2));
		setIsSessionModalOpen(false);

		setIsSaving(true);
		toast("success", "Saving & syncing to marketing site…");
		await saveExcosData(sorted);
		setIsSaving(false);
		toast("success", `✅ New ${session} session created — previous sessions unchanged. Add executives to it now.`);
	}

	// Delete Member
	function requestDeleteMember(committee: string, memberId: string, memberName: string) {
		setConfirmState({
			open: true,
			title: "Delete Executive Member?",
			message: `Remove "${memberName}" from ${committee}? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));
				const sessionObj = dataCopy.sessions.find((s) => s.session === selectedSession);
				if (sessionObj) {
					const commObj = sessionObj.executives.find((c) => c.committee === committee);
					if (commObj) {
						commObj.members = commObj.members.filter((m) => m.id !== memberId);
					}
				}
				setExcosData(dataCopy);
				setJsonText(JSON.stringify(dataCopy, null, 2));
				setIsSaving(true);
				toast("success", "Deleting & syncing…");
				await saveExcosData(dataCopy);
				setIsSaving(false);
				toast("success", `✅ Removed "${memberName}" — synced to marketing site!`);
			},
		});
	}

	// Delete Entire Session
	function requestDeleteSession() {
		const session = selectedSession;
		if (!session) return;
		if (excosData.sessions.length <= 1) {
			toast("error", "You cannot delete the last remaining session.");
			return;
		}
		const memberCount =
			currentSessionObj?.executives.reduce((sum, c) => sum + c.members.length, 0) ?? 0;
		setConfirmState({
			open: true,
			title: "Delete Entire Session?",
			message: `Delete the ${session} session? This will remove ALL ${memberCount} executive members across ${currentSessionObj?.executives.length ?? 0} committees and sync the change to the marketing site.`,
			action: async () => {
				const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));
				const index = dataCopy.sessions.findIndex((s) => s.session === session);
				if (index === -1) return;
				dataCopy.sessions.splice(index, 1);
				const sorted = sortSessionsNewestFirst(dataCopy);
				setExcosData(sorted);
				setSelectedSession(sorted.sessions[0]?.session || "");
				setSelectedCommittee("All");
				setJsonText(JSON.stringify(sorted, null, 2));
				setIsSaving(true);
				toast("success", "Deleting session & syncing…");
				await saveExcosData(sorted);
				setIsSaving(false);
				toast("success", `✅ ${session} session deleted — synced to marketing site!`);
			},
		});
	}

	return (
		<div className="space-y-6">
			{/* Page Title & Top Actions */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
				<div>
					<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
						<Users className="w-7 h-7 text-green-700" />
						Our Executives (Admin Portal)
					</h2>
					<p className="text-xs sm:text-sm text-gray-600 mt-1">
						Manage, edit, or add executive members for all sessions. Uses the exact design format & colors as
						the main user page.
					</p>
				</div>

				<div className="flex items-center space-x-2">
					<button
						type="button"
						onClick={handleResetToEmpty}
						className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
						title="Clear all exco data"
					>
						<RotateCcw className="w-4 h-4 text-gray-500" />
						<span className="hidden sm:inline">Clear All Data</span>
					</button>
					<button
						type="button"
						onClick={openAddModal}
						className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]"
					>
						<UserPlus className="w-4 h-4" />
						<span>Add Exco Member</span>
					</button>
				</div>
			</div>

			{/* Tab Switcher */}
			<div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
				<button
					type="button"
					onClick={() => setActiveTab("cards")}
					className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
						activeTab === "cards" ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
					}`}
				>
					<Users className="w-4 h-4" />
					<span>Cards & Edit View ({totalDisplayedMembersCount()})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("json")}
					className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
						activeTab === "json" ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
					}`}
				>
					<Code className="w-4 h-4" />
					<span>JSON Bulk Input & Template</span>
				</button>
			</div>

			{/* TAB 1: CARDS & EDIT VIEW (USER PAGE STYLING) */}
			{activeTab === "cards" && (
				<div className="space-y-8">
					{/* Filters & Controls Bar */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
						{/* Session Selector */}
						<div>
							<label htmlFor="session-select" className="block text-xs font-semibold text-green-900 mb-1.5">
								Academic Session
							</label>
							<div className="flex items-center gap-2">
								<select
									id="session-select"
									value={selectedSession}
									onChange={(e) => setSelectedSession(e.target.value)}
									className="flex-1 bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs font-medium text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								>
									{excosData.sessions.map((sessionObj) => (
										<option key={sessionObj.session} value={sessionObj.session}>
											{sessionObj.session} Session
										</option>
									))}
								</select>
								<button
									type="button"
									onClick={openAddSession}
									title="Create a new academic session (previous sessions stay untouched)"
									className="flex items-center gap-1.5 shrink-0 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
								>
									<Plus className="w-3.5 h-3.5" />
									<span className="hidden sm:inline">Add Session</span>
								</button>
								<button
									type="button"
									onClick={requestDeleteSession}
									disabled={excosData.sessions.length <= 1 || !selectedSession}
									title="Delete this whole session (all committees & members)"
									className="flex items-center gap-1.5 shrink-0 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
								>
									<Trash2 className="w-3.5 h-3.5" />
									<span className="hidden sm:inline">Delete Session</span>
								</button>
							</div>
							<p className="text-[11px] text-gray-500 mt-1.5">
								Add a new session to start a new exco year, or switch between sessions above to manage
								executives from previous years.
							</p>
						</div>

						{/* Committee Filter */}
						<div>
							<label htmlFor="committee-select" className="block text-xs font-semibold text-green-900 mb-1.5">
								Filter by Committee
							</label>
							<select
								id="committee-select"
								value={selectedCommittee}
								onChange={(e) => setSelectedCommittee(e.target.value)}
								className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs font-medium text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
							>
								<option value="All">All Committees ({availableCommittees().length})</option>
								{availableCommittees().map((comm) => (
									<option key={comm} value={comm}>
										{comm}
									</option>
								))}
							</select>
						</div>

						{/* Search Input */}
						<div>
							<label htmlFor="search-input" className="block text-xs font-semibold text-green-900 mb-1.5">
								Search Excos
							</label>
							<div className="relative">
								<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
								<input
									id="search-input"
									type="text"
									placeholder="Search name, position..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
						</div>
					</div>

					{/* Exco Members grouped by Committee (User Page Header Divider & Layout Format) */}
					{displayedCommittees().length === 0 ? (
						<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
							<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
								<Users className="w-6 h-6" />
							</div>
							<h3 className="text-base font-semibold text-green-950">No Executives Found</h3>
							<p className="text-xs text-gray-500 max-w-sm mx-auto">
								No members matched your selection. Click below to add a member to this session.
							</p>
							<button
								type="button"
								onClick={openAddModal}
								className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
							>
								<Plus className="w-4 h-4" />
								<span>Add Executive Member</span>
							</button>
						</div>
					) : (
						displayedCommittees().map(({ committee, members }) => (
							<div key={committee} className="mb-12">
								{/* User Page Styled Committee Divider */}
								<div className="text-lg text-green-800 font-semibold text-center py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-4 after:flex-1 after:border-t after:border-green-300 after:ms-4">
									<span className="relative px-4 py-1.5 bg-green-50 rounded-lg border border-green-200/60 shadow-xs">
										{committee} ({members.length})
									</span>
								</div>

								{/* Grid of Member Profile Cards (Matching User Page Format) */}
								<div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-6">
									{members.map((member) => (
										<div
											key={member.id}
											className="group text-center relative flex flex-col justify-between p-3 bg-white hover:bg-green-50/40 rounded-2xl border border-transparent hover:border-green-200/80 transition-all duration-300 shadow-xs hover:shadow-md"
										>
											<div>
												{/* Avatar Image with Green Ring */}
												<div className="relative mb-3 mx-auto w-24 h-24">
													<img
														src={member.photo || getMemberPlaceholder(member.gender)}
														alt={`${member.name} - ${member.position}`}
														className="w-24 h-24 object-cover rounded-full shadow-md border-2 border-white ring-2 ring-green-300 group-hover:ring-4 group-hover:ring-green-500/70 transition-all duration-300 mx-auto"
														onError={(e) => {
															(e.currentTarget as HTMLImageElement).src = getMemberPlaceholder(
																member.gender
															);
														}}
													/>
												</div>

												<h3 className="text-sm font-bold text-green-950 group-hover:text-green-700 transition-colors line-clamp-1">
													{member.name}
												</h3>
												<p className="text-xs text-gray-600 group-hover:text-green-600 font-medium transition-colors line-clamp-2 mt-0.5">
													{member.position}
												</p>

												{member.bio && (
													<p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1 italic">{member.bio}</p>
												)}
											</div>

											{/* Action Buttons for Admin */}
											<div className="flex items-center justify-center space-x-1 pt-3 mt-2 border-t border-gray-100">
												<button
													type="button"
													onClick={() => openMemberDetails(member, committee)}
													className="px-2 py-1 text-[11px] font-semibold text-green-800 bg-green-100/80 hover:bg-green-200 rounded-md transition-colors"
													title="View Details"
												>
													View
												</button>
												<button
													type="button"
													onClick={() => openEditModal(committee, member)}
													className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
													title="Edit Member"
												>
													<Edit className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													onClick={() => requestDeleteMember(committee, member.id, member.name)}
													className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
													title="Delete Member"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						))
					)}
				</div>
			)}

			{/* TAB 2: JSON RAW EDIT & TEMPLATE (MATCHING ALL EXCOS) */}
			{activeTab === "json" && (
				<div className="space-y-4">
					<div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm space-y-3">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div>
								<h3 className="text-sm font-bold text-green-950 flex items-center gap-2">
									<FileCode className="w-4 h-4 text-green-700" />
									JSON Bulk Input (adds, never removes)
								</h3>
								<p className="text-xs text-gray-500">
									Paste one session block (e.g.{" "}
									<code className="bg-gray-100 px-1 rounded">
										&#123; "session": "2025/2026", "executives": [...] &#125;
									</code>
									) or{" "}
									<code className="bg-gray-100 px-1 rounded">&#123; "sessions": [...] &#125;</code>, then
									Apply. It is added to or updates the current sessions — everything else is kept.
								</p>
							</div>

							<div className="flex items-center space-x-2">
								<button
									type="button"
									onClick={resetJsonToCurrent}
									className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
									title="Reload the editor with the current live data (discards any stale paste)"
								>
									<RotateCcw className="w-4 h-4" />
									<span>Reset to Current</span>
								</button>
								<button
									type="button"
									onClick={requestApplyJson}
									className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
									title="Validates the JSON, then asks for confirmation before replacing the session list"
								>
									<Save className="w-4 h-4" />
									<span>Apply & Save JSON</span>
								</button>
							</div>
						</div>

						<div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-start space-x-2">
							<AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Default = merge:</strong> sessions already on the site are always kept. A pasted
								session is added (or replaces that same session's roster). Tick the box below only if you
								intentionally want to replace ALL sessions.
							</span>
						</div>

						<label className="flex items-center gap-2 text-[11px] font-semibold text-amber-900 cursor-pointer select-none">
							<input
								type="checkbox"
								checked={jsonReplaceMode}
								onChange={(e) => setJsonReplaceMode(e.target.checked)}
								className="accent-amber-600"
							/>
							Replace ALL sessions with the JSON above (advanced — removes anything not listed)
						</label>

						{jsonError && (
							<div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
								<AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
								<span>{jsonError}</span>
							</div>
						)}

						<textarea
							value={jsonText}
							onChange={(e) => setJsonText(e.target.value)}
							rows={18}
							className="w-full font-mono text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-600 leading-relaxed"
							placeholder="Paste Exco JSON payload here..."
						></textarea>
					</div>
				</div>
			)}

			{/* MODAL 1: MEMBER DETAILS VIEW (MATCHING USER PAGE RESPONSIVE MODAL) */}
			{isDetailsModalOpen && activeMemberDetails && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">{activeMemberDetails.member.name}</h3>
								<p className="text-xs text-gray-500">
									{activeMemberDetails.member.position}, {activeMemberDetails.committee}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsDetailsModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-4">
							<div className="flex justify-center">
								<img
									src={
										activeMemberDetails.member.photo ||
										getMemberPlaceholder(activeMemberDetails.member.gender)
									}
									alt={activeMemberDetails.member.name}
									className="w-28 h-28 object-cover rounded-full shadow-md border-4 border-white ring-2 ring-green-200"
								/>
							</div>

							{activeMemberDetails.member.bio && (
								<p className="text-xs text-gray-600 text-center bg-green-50/50 p-3 rounded-xl border border-green-100 italic">
									{activeMemberDetails.member.bio}
								</p>
							)}

							<div className="space-y-2 text-xs border-t pt-3">
								{activeMemberDetails.member.phone && (
									<>
										<a
											href={`tel:${activeMemberDetails.member.phone}`}
											className="flex items-center text-green-700 hover:underline justify-start font-medium"
										>
											<Phone className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Call:{" "}
											{activeMemberDetails.member.phone}
										</a>
										<a
											href={`https://wa.me/${activeMemberDetails.member.phone.replace(/\D/g, "")}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center text-green-700 hover:underline justify-start font-medium"
										>
											<MessageSquareText className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Chat on
											WhatsApp
										</a>
										<a
											href={`sms:${activeMemberDetails.member.phone}`}
											className="flex items-center text-green-700 hover:underline justify-start font-medium"
										>
											<Smartphone className="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Send SMS
										</a>
									</>
								)}
								{activeMemberDetails.member.email && (
									<a
										href={`mailto:${activeMemberDetails.member.email}`}
										className="flex items-center text-green-700 hover:underline justify-start font-medium"
									>
										<Mail className="h-4 w-4 mr-2.5 shrink-0 text-green-600" />{" "}
										{activeMemberDetails.member.email}
									</a>
								)}
							</div>
						</div>

						<div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
							<button
								type="button"
								onClick={() => setIsDetailsModalOpen(false)}
								className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
							<button
								type="button"
								onClick={() => {
									if (activeMemberDetails) {
										copyMemberContactDetails(activeMemberDetails.member, activeMemberDetails.committee);
									}
								}}
								className="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
							>
								<Copy className="w-3.5 h-3.5" />
								<span>Copy Details</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* MODAL 2: ADD / EDIT MEMBER FORM */}
			{isFormModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 text-xs">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<h3 className="text-base font-bold text-green-950 flex items-center gap-2">
								<UserPlus className="w-5 h-5 text-green-700" />
								{formModalMode === "add" ? "Add Executive Member" : "Edit Executive Member"}
							</h3>
							<button
								type="button"
								onClick={() => setIsFormModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleSaveMember} className="space-y-3">
							{/* Session & Committee */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-session" className="block font-semibold text-gray-700 mb-1">
										Academic Session *
									</label>
									<input
										id="form-session"
										type="text"
										required
										placeholder="2024/2025"
										value={formSession}
										onChange={(e) => setFormSession(e.target.value)}
										list="exco-session-datalist"
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<datalist id="exco-session-datalist">
										{sessionOptions.map((opt) => (
											<option key={opt} value={opt}></option>
										))}
									</datalist>
								</div>

								<div>
									<label htmlFor="form-committee" className="block font-semibold text-gray-700 mb-1">
										Committee Name *
									</label>
									<input
										id="form-committee"
										type="text"
										required
										placeholder="Executive Council"
										value={formCommittee}
										onChange={(e) => setFormCommittee(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>

							{/* Name & Position */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-name" className="block font-semibold text-gray-700 mb-1">
										Full Name *
									</label>
									<input
										id="form-name"
										type="text"
										required
										placeholder="Amoo Fareed"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>

								<div>
									<label htmlFor="form-position" className="block font-semibold text-gray-700 mb-1">
										Position *
									</label>
									<input
										id="form-position"
										type="text"
										required
										placeholder="Ameer"
										value={formPosition}
										onChange={(e) => setFormPosition(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>

							{/* Gender & Phone */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

								<div>
									<label htmlFor="form-phone" className="block font-semibold text-gray-700 mb-1">
										Phone Number
									</label>
									<input
										id="form-phone"
										type="text"
										placeholder="+2347035427158"
										value={formPhone}
										onChange={(e) => setFormPhone(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
							</div>

							{/* Email & Photo */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label htmlFor="form-email" className="block font-semibold text-gray-700 mb-1">
										Email Address
									</label>
									<input
										id="form-email"
										type="email"
										placeholder="ameer@mssnoau.org"
										value={formEmail}
										onChange={(e) => setFormEmail(e.target.value)}
										className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>

								<div>
									<label htmlFor="form-photo" className="block font-semibold text-gray-700 mb-1">
										Photo URL (Optional)
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

							{/* Bio / Department */}
							<div>
								<label htmlFor="form-bio" className="block font-semibold text-gray-700 mb-1">
									Bio / Department & Level
								</label>
								<textarea
									id="form-bio"
									rows={2}
									placeholder="Department: Mechanical Engineering • Level: 400"
									value={formBio}
									onChange={(e) => setFormBio(e.target.value)}
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								></textarea>
							</div>

							{/* Form Actions */}
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
									Save Member
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* MODAL 3: ADD NEW SESSION (KEEPS PREVIOUS SESSIONS INTACT) */}
			{isSessionModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<h3 className="text-base font-bold text-green-950 flex items-center gap-2">
								<Plus className="w-5 h-5 text-green-700" />
								Add New Session
							</h3>
							<button
								type="button"
								onClick={() => setIsSessionModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleSaveSession} className="space-y-3">
							<div>
								<label htmlFor="new-session" className="block font-semibold text-gray-700 mb-1">
									Academic Session *
								</label>
								<input
									id="new-session"
									type="text"
									required
									placeholder="e.g. 2025/2026"
									value={newSessionValue}
									onChange={(e) => setNewSessionValue(e.target.value)}
									list="exco-session-datalist"
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
								<datalist id="exco-session-datalist">
									{sessionOptions.map((opt) => (
										<option key={opt} value={opt}></option>
									))}
								</datalist>
								<p className="text-[11px] text-gray-500 mt-1.5">
									Creates a new empty session for its own exco year. All previous sessions remain
									untouched.
								</p>
							</div>

							<div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
								<button
									type="button"
									onClick={() => setIsSessionModalOpen(false)}
									className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-md"
								>
									Create Session
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* CONFIRM DIALOG */}
			<ConfirmDialog
				open={confirmState?.open ?? false}
				title={confirmState?.title ?? "Are you sure?"}
				message={confirmState?.message ?? ""}
				confirmLabel={confirmState?.confirmLabel ?? "Yes, Delete"}
				cancelLabel={confirmState?.cancelLabel ?? "No, Cancel"}
				onconfirm={() => {
					const action = confirmState?.action;
					setConfirmState(null);
					action?.();
				}}
				oncancel={() => {
					setConfirmState(null);
				}}
			/>
		</div>
	);
}
