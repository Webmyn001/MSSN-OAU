import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import {
	loadContactData,
	saveContactData,
	type ContactData,
	type ContactEntry,
} from "~/lib/stores/contactStore";
import {
	Mail,
	Search,
	X,
	Phone,
	MessageSquareText,
	Eye,
	Trash2,
	StickyNote,
	Check,
	Clock,
} from "lucide-react";

const contactFilterOptions = ["all", "new", "read", "replied"] as const;
type FilterStatus = (typeof contactFilterOptions)[number];

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Contacts() {
	const [contactData, setContactData] = useState<ContactData>({ entries: [] });
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [activeEntry, setActiveEntry] = useState<ContactEntry | null>(null);
	const [noteText, setNoteText] = useState("");
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	useEffect(() => {
		void loadContactData().then(setContactData);
	}, []);

	let list = contactData.entries;
	if (filterStatus !== "all") {
		list = list.filter((e) => e.status === filterStatus);
	}
	if (searchQuery.trim()) {
		const q = searchQuery.toLowerCase();
		list = list.filter(
			(e) =>
				e.fname.toLowerCase().includes(q) ||
				e.lname.toLowerCase().includes(q) ||
				e.message.toLowerCase().includes(q) ||
				(e.email && e.email.toLowerCase().includes(q))
		);
	}
	const displayedEntries = [...list].sort(
		(a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
	);

	const stats = {
		total: contactData.entries.length,
		new: contactData.entries.filter((e) => e.status === "new").length,
		read: contactData.entries.filter((e) => e.status === "read").length,
		replied: contactData.entries.filter((e) => e.status === "replied").length,
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString("en-NG", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function openDetail(entry: ContactEntry) {
		setActiveEntry(entry);
		setNoteText(entry.notes || "");
		if (entry.status === "new") {
			const updated: ContactData = {
				...contactData,
				entries: contactData.entries.map((e) =>
					e.id === entry.id ? { ...e, status: "read" as const } : e
				),
			};
			setContactData(updated);
			setActiveEntry({ ...entry, status: "read" });
			void saveContactData(updated);
		}
		setIsDetailModalOpen(true);
	}

	async function markReplied() {
		if (!activeEntry) return;
		const entry = contactData.entries.find((e) => e.id === activeEntry.id);
		if (entry) {
			const updated: ContactData = {
				...contactData,
				entries: contactData.entries.map((e) =>
					e.id === activeEntry.id
						? { ...e, status: "replied" as const, notes: noteText.trim() || e.notes }
						: e
				),
			};
			setContactData(updated);
			await saveContactData(updated);
			toast("success", `Marked as replied for ${entry.fname} ${entry.lname}`);
		}
		setIsDetailModalOpen(false);
	}

	async function saveNote() {
		if (!activeEntry) return;
		const entry = contactData.entries.find((e) => e.id === activeEntry.id);
		if (entry) {
			const updated: ContactData = {
				...contactData,
				entries: contactData.entries.map((e) =>
					e.id === activeEntry.id ? { ...e, notes: noteText.trim() || undefined } : e
				),
			};
			setContactData(updated);
			await saveContactData(updated);
			toast("success", "Note saved");
		}
	}

	function deleteEntry(id: string, name: string) {
		setConfirmState({
			open: true,
			title: "Delete Contact Message?",
			message: `Delete the message from "${name}"? This cannot be undone.`,
			action: async () => {
				const updated: ContactData = {
					...contactData,
					entries: contactData.entries.filter((e) => e.id !== id),
				};
				setContactData(updated);
				await saveContactData(updated);
				setIsDetailModalOpen(false);
				toast("success", `Deleted message from ${name}`);
			},
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case "new":
				return "bg-blue-100 text-blue-800";
			case "read":
				return "bg-amber-100 text-amber-800";
			case "replied":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<Mail className="w-7 h-7 text-green-700" />
							Contact Messages
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">
							View and manage messages submitted through the Contact Us form.
						</p>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-green-950">{stats.total}</p>
						<p className="text-[11px] text-gray-500 font-medium">Total Messages</p>
					</div>
					<div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-blue-700">{stats.new}</p>
						<p className="text-[11px] text-gray-500 font-medium">New</p>
					</div>
					<div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-amber-700">{stats.read}</p>
						<p className="text-[11px] text-gray-500 font-medium">Read</p>
					</div>
					<div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-green-700">{stats.replied}</p>
						<p className="text-[11px] text-gray-500 font-medium">Replied</p>
					</div>
				</div>

				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
					<div className="flex items-center gap-2 flex-wrap">
						{contactFilterOptions.map((status) => (
							<button
								key={status}
								onClick={() => setFilterStatus(status)}
								className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
									filterStatus === status
										? "bg-green-700 text-white shadow-sm"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								{status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)} (
								{status === "all" ? stats.total : stats[status]})
							</button>
						))}
					</div>
					<div className="relative flex-1">
						<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
						<input
							type="text"
							placeholder="Search name, email, message…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>

				{/* Messages List */}
				{displayedEntries.length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<Mail className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No Messages Found</h3>
						<p className="text-xs text-gray-500">No messages match your current filters.</p>
					</div>
				) : (
					<div className="space-y-3">
						{displayedEntries.map((entry) => (
							<div
								key={entry.id}
								role="button"
								tabIndex={0}
								onClick={() => openDetail(entry)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										openDetail(entry);
									}
								}}
								className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="text-sm font-bold text-green-950">
												{entry.fname} {entry.lname}
											</h4>
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(entry.status)}`}
											>
												{entry.status}
											</span>
										</div>
										<p className="text-xs text-gray-600 line-clamp-2">{entry.message}</p>
										<div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
											<span className="flex items-center gap-1">
												<Clock className="w-3 h-3" />
												{formatDate(entry.submittedAt)}
											</span>
											{entry.email ? <span>{entry.email}</span> : null}
											{entry.phone ? (
												<span className="flex items-center gap-1">
													<Phone className="w-3 h-3" />
													{entry.phone}
												</span>
											) : null}
										</div>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										{entry.status === "new" ? (
											<span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
										) : null}
										<button
											onClick={(e) => {
												e.stopPropagation();
												deleteEntry(entry.id, `${entry.fname} ${entry.lname}`);
											}}
											className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
											title="Delete"
											aria-label={`Delete message from ${entry.fname} ${entry.lname}`}
										>
											<Trash2 className="w-4 h-4" />
										</button>
										<Eye className="w-4 h-4 text-gray-400" />
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{isDetailModalOpen && activeEntry ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">
									{activeEntry.fname} {activeEntry.lname}
								</h3>
								<p className="text-[11px] text-gray-500">{formatDate(activeEntry.submittedAt)}</p>
							</div>
							<button
								onClick={() => setIsDetailModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-3">
							<div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
								<p className="text-xs text-gray-600 leading-relaxed">{activeEntry.message}</p>
							</div>

							<div className="grid grid-cols-2 gap-2 text-xs">
								{activeEntry.phone ? (
									<a
										href={`tel:${activeEntry.phone}`}
										className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-green-700 hover:bg-green-50 transition-colors font-medium"
									>
										<Phone className="w-3.5 h-3.5" /> Call {activeEntry.phone}
									</a>
								) : null}
								{activeEntry.phone ? (
									<a
										href={`https://wa.me/${activeEntry.phone.replace(/\D/g, "")}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-green-700 hover:bg-green-50 transition-colors font-medium"
									>
										<MessageSquareText className="w-3.5 h-3.5" /> WhatsApp
									</a>
								) : null}
								{activeEntry.email ? (
									<a
										href={`mailto:${activeEntry.email}`}
										className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-green-700 hover:bg-green-50 transition-colors font-medium col-span-2"
									>
										<Mail className="w-3.5 h-3.5" /> {activeEntry.email}
									</a>
								) : null}
							</div>

							<div>
								<label
									htmlFor="note-input"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Internal Notes
								</label>
								<div className="flex gap-2">
									<textarea
										id="note-input"
										rows={2}
										value={noteText}
										onChange={(e) => setNoteText(e.target.value)}
										placeholder="Add a note…"
										className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
									<button
										onClick={() => void saveNote()}
										className="self-end px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
									>
										<StickyNote className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								onClick={() =>
									deleteEntry(activeEntry.id, `${activeEntry.fname} ${activeEntry.lname}`)
								}
								className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
								title="Delete"
							>
								<Trash2 className="w-4 h-4" />
							</button>
							<div className="flex-1"></div>
							<button
								onClick={() => setIsDetailModalOpen(false)}
								className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
							<button
								onClick={() => void markReplied()}
								className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<Check className="w-3.5 h-3.5" /> Mark Replied
							</button>
						</div>
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
