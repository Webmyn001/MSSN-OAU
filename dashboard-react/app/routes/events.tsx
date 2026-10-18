import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { API_BASE } from "~/lib/api/base";
import { uploadImage as cloudinaryUpload } from "~/lib/utils/cloudinary";
import {
	Calendar,
	MapPin,
	Plus,
	Edit2,
	Trash2,
	Users,
	Clock,
	XCircle,
	Upload,
	X,
	Search,
	ArrowLeft,
	UserCheck,
	RefreshCw,
} from "lucide-react";

type EventStatus = "upcoming" | "ongoing" | "past";
type TicketStatus = "PENDING" | "CONFIRMED" | "USED" | "CANCELLED";

interface AppEvent {
	id: string;
	title: string;
	description: string | null;
	startDate: string;
	endDate: string;
	venue: string | null;
	imageUrl: string | null;
	ticketPrice: string;
	maxTickets: number | null;
	ticketsSold: number;
	isPublic: boolean;
	createdAt: string;
	stats?: { totalRegistered: number; confirmed: number; checkedIn: number };
}

interface Attendee {
	id: string;
	ticketCode: string;
	attendeeName: string | null;
	attendeeEmail: string | null;
	attendeePhone: string | null;
	quantity: number;
	totalAmount: string;
	status: TicketStatus;
	purchasedAt: string | null;
	usedAt: string | null;
	createdAt: string;
}

interface EventForm {
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	venue: string;
	imageUrl: string;
	maxTickets: string;
	isPublic: boolean;
}

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void> | void;
}

const emptyForm: EventForm = {
	title: "",
	description: "",
	startDate: "",
	endDate: "",
	venue: "",
	imageUrl: "",
	maxTickets: "",
	isPublic: true,
};

export default function Events() {
	const [events, setEvents] = useState<AppEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	const [activeView, setActiveView] = useState<"list" | "create" | "edit" | "attendees">("list");
	const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
	const [attendees, setAttendees] = useState<Attendee[]>([]);
	const [attendeesLoading, setAttendeesLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [form, setForm] = useState<EventForm>(emptyForm);
	const [formLoading, setFormLoading] = useState(false);
	const [imageUploading, setImageUploading] = useState(false);
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");

	const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");

	// ── Computed ───────────────────────────────────────────────────────────────
	function filteredEvents() {
		const now = new Date();
		return events.filter((e) => {
			const matchSearch =
				!searchQuery ||
				e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(e.venue || "").toLowerCase().includes(searchQuery.toLowerCase());
			if (!matchSearch) return false;
			if (filterStatus === "all") return true;
			const start = new Date(e.startDate);
			if (filterStatus === "upcoming") return start >= now;
			if (filterStatus === "past") return start < now;
			return true;
		});
	}

	function totalStats() {
		return {
			total: events.length,
			upcoming: events.filter((e) => new Date(e.startDate) >= new Date()).length,
			totalRegistered: events.reduce((sum, e) => sum + (e.stats?.totalRegistered ?? 0), 0),
			totalCheckedIn: events.reduce((sum, e) => sum + (e.stats?.checkedIn ?? 0), 0),
		};
	}

	function filteredAttendees() {
		if (!searchQuery) return attendees;
		return attendees.filter(
			(a) =>
				a.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				a.attendeeEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				a.ticketCode.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}

	// ── Helpers ────────────────────────────────────────────────────────────────
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString("en-GB", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	}

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
	}

	function getEventStatus(event: AppEvent): EventStatus {
		const now = new Date();
		const start = new Date(event.startDate);
		const end = new Date(event.endDate);
		if (now < start) return "upcoming";
		if (now > end) return "past";
		return "ongoing";
	}

	function statusBadge(status: TicketStatus) {
		const map: Record<TicketStatus, { label: string; cls: string }> = {
			PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
			CONFIRMED: { label: "Confirmed", cls: "bg-blue-100 text-blue-800" },
			USED: { label: "Checked In", cls: "bg-green-100 text-green-800" },
			CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
		};
		return map[status];
	}

	function toDateTimeLocal(iso: string) {
		const d = new Date(iso);
		const pad = (n: number) => String(n).padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function nowDateTimeLocal() {
		const d = new Date();
		const pad = (n: number) => String(n).padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	// ── API Calls ──────────────────────────────────────────────────────────────
	async function loadEvents() {
		setIsLoading(true);
		try {
			const res = await fetch(`${API_BASE}/public/events/admin`);
			const json = await res.json();
			if (json.success) {
				setEvents(json.data.events);
			} else {
				toast("error", json.error || "Failed to load events");
			}
		} catch {
			toast("error", "Could not connect to the API server. Make sure it is running on port 3000.");
		} finally {
			setIsLoading(false);
		}
	}

	async function loadAttendees(eventId: string) {
		setAttendeesLoading(true);
		try {
			const res = await fetch(`${API_BASE}/public/events/${eventId}/attendees`);
			const json = await res.json();
			if (json.success) {
				setAttendees(json.data.attendees);
			}
		} catch {
			// ignore
		} finally {
			setAttendeesLoading(false);
		}
	}

	async function handleSubmit() {
		if (!form.title.trim()) {
			toast("error", "Event title is required");
			return;
		}
		if (!form.startDate) {
			toast("error", "Start date is required");
			return;
		}
		if (!form.endDate) {
			toast("error", "End date is required");
			return;
		}
		if (new Date(form.endDate) <= new Date(form.startDate)) {
			toast("error", "End date must be after start date");
			return;
		}

		setFormLoading(true);
		try {
			const payload = {
				title: form.title,
				description: form.description || null,
				startDate: new Date(form.startDate).toISOString(),
				endDate: new Date(form.endDate).toISOString(),
				venue: form.venue || null,
				imageUrl: form.imageUrl || null,
				ticketPrice: "0",
				maxTickets: form.maxTickets ? parseInt(form.maxTickets) : null,
				isPublic: form.isPublic,
			};

			const url =
				activeView === "edit" && selectedEvent
					? `${API_BASE}/public/events/${selectedEvent.id}`
					: `${API_BASE}/public/events`;
			const method = activeView === "edit" ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				await loadEvents();
				setActiveView("list");
				setSelectedEvent(null);
			} else {
				toast("error", json.error || "Failed to save event");
			}
		} catch {
			toast("error", "Network error. Please try again.");
		} finally {
			setFormLoading(false);
		}
	}

	function deleteEvent(event: AppEvent) {
		setConfirmState({
			open: true,
			title: "Delete Event?",
			message: `Delete "${event.title}"? This will also remove all registrations and cannot be undone.`,
			action: async () => {
				try {
					const res = await fetch(`${API_BASE}/public/events/${event.id}`, { method: "DELETE" });
					const json = await res.json();
					if (json.success) {
						await loadEvents();
					} else {
						toast("error", json.error || "Failed to delete event");
					}
				} catch {
					toast("error", "Network error");
				}
			},
		});
	}

	async function updateTicketStatus(eventId: string, ticketId: string, status: TicketStatus) {
		try {
			const res = await fetch(`${API_BASE}/public/events/${eventId}/attendees/${ticketId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const json = await res.json();
			if (json.success) {
				await loadAttendees(eventId);
				await loadEvents();
			} else {
				toast("error", json.error || "Failed to update status");
			}
		} catch {
			toast("error", "Network error");
		}
	}

	function deleteAttendee(eventId: string, ticketId: string) {
		setConfirmState({
			open: true,
			title: "Remove Registration?",
			message: "Remove this registration? This will also release the ticket slot and cannot be undone.",
			action: async () => {
				try {
					const res = await fetch(`${API_BASE}/public/events/${eventId}/attendees/${ticketId}`, {
						method: "DELETE",
					});
					const json = await res.json();
					if (json.success) {
						await loadAttendees(eventId);
						await loadEvents();
					}
				} catch {
					toast("error", "Network error");
				}
			},
		});
	}

	async function handleImageUpload(file: File) {
		if (!file) return;
		const preview = URL.createObjectURL(file);
		setImagePreviewUrl(preview);
		setImageUploading(true);
		try {
			const secureUrl = await cloudinaryUpload(file);
			URL.revokeObjectURL(preview);
			setImagePreviewUrl("");
			setForm((f) => ({ ...f, imageUrl: secureUrl }));
		} catch {
			toast("error", "Image upload failed. Check your Cloudinary cloud name and upload preset in .env.");
		} finally {
			setImageUploading(false);
		}
	}

	function startCreate() {
		setForm(emptyForm);
		setImagePreviewUrl("");
		setSearchQuery("");
		setActiveView("create");
	}

	function startEdit(event: AppEvent) {
		setForm({
			title: event.title,
			description: event.description || "",
			startDate: toDateTimeLocal(event.startDate),
			endDate: toDateTimeLocal(event.endDate),
			venue: event.venue || "",
			imageUrl: event.imageUrl || "",
			maxTickets: event.maxTickets ? String(event.maxTickets) : "",
			isPublic: event.isPublic,
		});
		setImagePreviewUrl("");
		setSelectedEvent(event);
		setActiveView("edit");
	}

	function viewAttendees(event: AppEvent) {
		setSelectedEvent(event);
		setAttendees([]);
		setSearchQuery("");
		setActiveView("attendees");
		loadAttendees(event.id);
	}

	useEffect(() => {
		loadEvents();
	}, []);

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<div className="space-y-6">
			{/* ─── List View ─── */}
			{activeView === "list" && (
				<>
					{/* Header */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-2xl font-extrabold text-green-950">Events Management</h2>
							<p className="text-sm text-gray-500 mt-0.5">Create, manage and track event registrations</p>
						</div>
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={loadEvents}
								className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all"
								title="Refresh"
							>
								<RefreshCw className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={startCreate}
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow transition-all hover:scale-[1.02]"
							>
								<Plus className="w-4 h-4" />
								New Event
							</button>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-green-900">Total Events</span>
								<div className="p-2 rounded-xl bg-green-100 text-green-800">
									<Calendar className="w-4 h-4" />
								</div>
							</div>
							<p className="text-2xl font-extrabold text-green-950 mt-2">{totalStats().total}</p>
						</div>
						<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-green-900">Upcoming</span>
								<div className="p-2 rounded-xl bg-amber-100 text-amber-800">
									<Clock className="w-4 h-4" />
								</div>
							</div>
							<p className="text-2xl font-extrabold text-green-950 mt-2">{totalStats().upcoming}</p>
						</div>
						<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-green-900">Registrations</span>
								<div className="p-2 rounded-xl bg-blue-100 text-blue-800">
									<Users className="w-4 h-4" />
								</div>
							</div>
							<p className="text-2xl font-extrabold text-green-950 mt-2">{totalStats().totalRegistered}</p>
						</div>
						<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-green-900">Checked In</span>
								<div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
									<UserCheck className="w-4 h-4" />
								</div>
							</div>
							<p className="text-2xl font-extrabold text-green-950 mt-2">{totalStats().totalCheckedIn}</p>
						</div>
					</div>

					{/* Filters & Search */}
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search events..."
								className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
							/>
						</div>
						<div className="flex gap-2">
							{(["all", "upcoming", "past"] as const).map((f) => (
								<button
									key={f}
									type="button"
									onClick={() => setFilterStatus(f)}
									className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
										filterStatus === f
											? "bg-green-700 text-white border-green-700"
											: "bg-white text-gray-600 border-gray-200 hover:border-green-400"
									}`}
								>
									{f.charAt(0).toUpperCase() + f.slice(1)}
								</button>
							))}
						</div>
					</div>

					{/* Events List */}
					{isLoading ? (
						<div className="flex items-center justify-center py-16">
							<div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
						</div>
					) : filteredEvents().length === 0 ? (
						<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
							<Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
							<p className="text-gray-500 font-medium">
								{events.length === 0 ? "No events yet. Create your first event!" : "No events match your search."}
							</p>
							{events.length === 0 && (
								<button
									type="button"
									onClick={startCreate}
									className="mt-4 px-5 py-2 rounded-xl bg-green-700 text-white text-sm font-bold"
								>
									Create Event
								</button>
							)}
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
							{filteredEvents().map((event) => {
								const status = getEventStatus(event);
								return (
									<div
										key={event.id}
										className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
									>
										{/* Image Banner */}
										{event.imageUrl ? (
											<div className="relative h-40 bg-gray-100 overflow-hidden">
												<img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
												<div className="absolute top-3 right-3 flex gap-2">
													<span
														className={`px-2 py-1 rounded-full text-xs font-bold ${
															status === "upcoming"
																? "bg-green-100 text-green-800"
																: status === "ongoing"
																	? "bg-blue-100 text-blue-800"
																	: "bg-gray-100 text-gray-600"
														}`}
													>
														{status.charAt(0).toUpperCase() + status.slice(1)}
													</span>
													{!event.isPublic && (
														<span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
															Draft
														</span>
													)}
												</div>
											</div>
										) : (
											<div className="relative h-24 bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
												<Calendar className="w-10 h-10 text-white/30" />
												<div className="absolute top-3 right-3 flex gap-2">
													<span
														className={`px-2 py-1 rounded-full text-xs font-bold ${
															status === "upcoming"
																? "bg-green-100 text-green-800"
																: status === "ongoing"
																	? "bg-blue-100 text-blue-800"
																	: "bg-gray-100 text-gray-600"
														}`}
													>
														{status.charAt(0).toUpperCase() + status.slice(1)}
													</span>
												</div>
											</div>
										)}

										<div className="p-5 flex flex-col flex-1">
											<div className="flex items-start justify-between gap-2 mb-2">
												<h3 className="font-bold text-green-950 text-base leading-tight">{event.title}</h3>
												<span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">
													Free
												</span>
											</div>

											<div className="space-y-1.5 mb-4 text-xs text-gray-500">
												<div className="flex items-center gap-1.5">
													<Calendar className="w-3.5 h-3.5 text-green-600 shrink-0" />
													<span>
														<span className="font-semibold text-gray-700">Start:</span> {formatDate(event.startDate)} at{" "}
														{formatTime(event.startDate)}
													</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
													<span>
														<span className="font-semibold text-gray-700">End:</span> {formatDate(event.endDate)} at{" "}
														{formatTime(event.endDate)}
													</span>
												</div>
												{event.venue && (
													<div className="flex items-center gap-1.5">
														<MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
														<span>{event.venue}</span>
													</div>
												)}
											</div>

											{/* Per-Event Registration Stats */}
											{event.stats && (
												<div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
													<div className="text-center">
														<p className="text-lg font-extrabold text-green-950">{event.stats.totalRegistered}</p>
														<p className="text-[10px] text-gray-500 font-medium">Registered</p>
													</div>
													<div className="text-center border-x border-green-200">
														<p className="text-lg font-extrabold text-blue-700">{event.stats.confirmed}</p>
														<p className="text-[10px] text-gray-500 font-medium">Confirmed</p>
													</div>
													<div className="text-center">
														<p className="text-lg font-extrabold text-emerald-700">{event.stats.checkedIn}</p>
														<p className="text-[10px] text-gray-500 font-medium">Checked In</p>
													</div>
												</div>
											)}

											{event.maxTickets ? (
												<div className="mb-4">
													<div className="flex justify-between text-xs text-gray-500 mb-1">
														<span>Capacity</span>
														<span>
															{event.ticketsSold}/{event.maxTickets}
														</span>
													</div>
													<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
														<div
															className="h-full bg-green-500 rounded-full transition-all"
															style={{
																width: `${Math.min(100, (event.ticketsSold / event.maxTickets) * 100)}%`,
															}}
														></div>
													</div>
												</div>
											) : null}

											{/* Actions */}
											<div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
												<button
													type="button"
													onClick={() => viewAttendees(event)}
													className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-xs font-semibold transition-all"
												>
													<Users className="w-3.5 h-3.5" />
													Attendees
												</button>
												<button
													type="button"
													onClick={() => startEdit(event)}
													className="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
													title="Edit"
												>
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													type="button"
													onClick={() => deleteEvent(event)}
													className="flex items-center justify-center p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-all"
													title="Delete"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}

			{/* ─── Create / Edit Form ─── */}
			{(activeView === "create" || activeView === "edit") && (
				<div>
					<button
						type="button"
						onClick={() => {
							setActiveView("list");
							setSelectedEvent(null);
						}}
						className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 mb-6"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Events
					</button>

					<div className="max-w-2xl">
						<h2 className="text-2xl font-extrabold text-green-950 mb-1">
							{activeView === "edit" ? `Edit: ${selectedEvent?.title}` : "Create New Event"}
						</h2>
						<p className="text-sm text-gray-500 mb-6">
							Fill in the details below. Upload a banner image or paste a direct URL.
						</p>

						<div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
							{/* Title */}
							<div>
								<label className="block text-xs font-bold text-green-900 mb-1.5">Event Title *</label>
								<input
									value={form.title}
									onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
									placeholder="e.g. Jihad Week 2025"
									className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							{/* Description */}
							<div>
								<label className="block text-xs font-bold text-green-900 mb-1.5">Description</label>
								<textarea
									value={form.description}
									onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
									placeholder="Brief description of the event..."
									rows={3}
									className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
								></textarea>
							</div>

							{/* Dates */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-bold text-green-900 mb-1.5">Start Date & Time *</label>
									<input
										type="datetime-local"
										value={form.startDate}
										onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
										min={nowDateTimeLocal()}
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold text-green-900 mb-1.5">End Date & Time *</label>
									<input
										type="datetime-local"
										value={form.endDate}
										onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
										min={form.startDate || nowDateTimeLocal()}
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
							</div>

							{/* Venue */}
							<div>
								<label className="block text-xs font-bold text-green-900 mb-1.5">Venue</label>
								<input
									value={form.venue}
									onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
									placeholder="e.g. MSSN Secretariat, Fajuyi Hall"
									className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							{/* Capacity */}
							<div>
								<label className="block text-xs font-bold text-green-900 mb-1.5">
									Max Capacity (leave blank = unlimited)
								</label>
								<input
									type="number"
									min={1}
									value={form.maxTickets}
									onChange={(e) => setForm((f) => ({ ...f, maxTickets: e.target.value }))}
									placeholder="e.g. 200"
									className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							{/* Image Upload */}
							<div>
								<label className="block text-xs font-bold text-green-900 mb-1.5">Event Image</label>
								<div className="space-y-2">
									{imagePreviewUrl || form.imageUrl ? (
										<div className="relative rounded-xl overflow-hidden border border-gray-200 h-32">
											<img
												src={imagePreviewUrl || form.imageUrl}
												alt="Preview"
												className="w-full h-full object-cover"
											/>
											{imageUploading ? (
												<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
													<div className="w-5 h-5 border-2 border-white border-t-green-400 rounded-full animate-spin"></div>
												</div>
											) : (
												<button
													type="button"
													onClick={() => {
														setImagePreviewUrl("");
														setForm((f) => ({ ...f, imageUrl: "" }));
													}}
													className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
												>
													<X className="w-3 h-3" />
												</button>
											)}
										</div>
									) : (
										<label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer bg-gray-50 hover:bg-green-50 transition-all">
											{imageUploading ? (
												<>
													<div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
													<span className="text-xs text-gray-400 mt-1">Uploading...</span>
												</>
											) : (
												<>
													<Upload className="w-5 h-5 text-gray-400" />
													<span className="text-xs text-gray-400 mt-1">
														Click to upload a banner image (max 3 MB, auto-compressed)
													</span>
												</>
											)}
											<input
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => {
													const f = e.target.files?.[0];
													if (f) handleImageUpload(f);
												}}
											/>
										</label>
									)}
									{!imagePreviewUrl && !form.imageUrl && (
										<input
											value={form.imageUrl}
											onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
											placeholder="Or paste a direct image URL"
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
										/>
									)}
								</div>
							</div>

							{/* Visibility */}
							<div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-gray-100">
								<div>
									<p className="text-sm font-bold text-green-950">Public Event</p>
									<p className="text-xs text-gray-500">Visible on the marketing website</p>
								</div>
								<button
									type="button"
									onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
										form.isPublic ? "bg-green-600" : "bg-gray-300"
									}`}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
											form.isPublic ? "translate-x-6" : "translate-x-1"
										}`}
									></span>
								</button>
							</div>

							{/* Submit */}
							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={() => {
										setActiveView("list");
										setSelectedEvent(null);
									}}
									className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSubmit}
									disabled={formLoading || imageUploading}
									className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{formLoading ? (
										<span className="flex items-center justify-center gap-2">
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
											Saving...
										</span>
									) : imageUploading ? (
										<span className="flex items-center justify-center gap-2">
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
											Uploading image...
										</span>
									) : activeView === "edit" ? (
										"Update Event"
									) : (
										"Create Event"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ─── Attendees View ─── */}
			{activeView === "attendees" && selectedEvent && (
				<div>
					<button
						type="button"
						onClick={() => {
							setActiveView("list");
							setSelectedEvent(null);
							setAttendees([]);
							setSearchQuery("");
						}}
						className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 mb-6"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Events
					</button>

					{/* Event Summary */}
					<div className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<p className="text-green-200 text-xs font-medium mb-1">Managing Attendees for</p>
							<h2 className="text-xl font-extrabold">{selectedEvent.title}</h2>
							<p className="text-green-200 text-xs mt-1">
								{formatDate(selectedEvent.startDate)} • {selectedEvent.venue || "No venue set"}
							</p>
						</div>
						<div className="flex gap-6">
							<div className="text-center">
								<p className="text-2xl font-extrabold">{selectedEvent.stats?.totalRegistered ?? attendees.length}</p>
								<p className="text-green-200 text-xs">Registered</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-extrabold text-amber-300">{selectedEvent.stats?.confirmed ?? 0}</p>
								<p className="text-green-200 text-xs">Confirmed</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-extrabold text-emerald-300">{selectedEvent.stats?.checkedIn ?? 0}</p>
								<p className="text-green-200 text-xs">Checked In</p>
							</div>
						</div>
					</div>

					{/* Search */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search attendees by name, email or ticket code..."
							className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
						/>
					</div>

					{attendeesLoading ? (
						<div className="flex items-center justify-center py-16">
							<div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
						</div>
					) : filteredAttendees().length === 0 ? (
						<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
							<Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
							<p className="text-gray-500">
								{attendees.length === 0 ? "No registrations yet." : "No attendees match your search."}
							</p>
						</div>
					) : (
						<>
							{/* Desktop Table */}
							<div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-slate-50 border-b border-gray-100">
											<th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
												Attendee
											</th>
											<th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
												Ticket Code
											</th>
											<th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
												Amount
											</th>
											<th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
												Status
											</th>
											<th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
												Registered
											</th>
											<th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-50">
										{filteredAttendees().map((attendee) => {
											const badge = statusBadge(attendee.status);
											return (
												<tr key={attendee.id} className="hover:bg-slate-50 transition-colors">
													<td className="px-4 py-3">
														<div>
															<p className="font-semibold text-gray-900">{attendee.attendeeName || "N/A"}</p>
															<p className="text-xs text-gray-400">{attendee.attendeeEmail || ""}</p>
															{attendee.attendeePhone && (
																<p className="text-xs text-gray-400">{attendee.attendeePhone}</p>
															)}
														</div>
													</td>
													<td className="px-4 py-3">
														<code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
															{attendee.ticketCode}
														</code>
													</td>
													<td className="px-4 py-3">
														<span className="font-semibold text-green-800">
															{parseFloat(attendee.totalAmount) === 0
																? "Free"
																: `₦${parseFloat(attendee.totalAmount).toLocaleString()}`}
														</span>
													</td>
													<td className="px-4 py-3">
														<span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
															{badge.label}
														</span>
													</td>
													<td className="px-4 py-3 text-xs text-gray-400">
														{attendee.createdAt
															? new Date(attendee.createdAt).toLocaleDateString("en-GB")
															: "N/A"}
													</td>
													<td className="px-4 py-3">
														<div className="flex items-center justify-end gap-1">
															{attendee.status === "PENDING" && (
																<button
																	type="button"
																	onClick={() =>
																		updateTicketStatus(selectedEvent.id, attendee.id, "CONFIRMED")
																	}
																	className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all"
																	title="Confirm Payment"
																>
																	Confirm
																</button>
															)}
															{attendee.status === "CONFIRMED" && (
																<button
																	type="button"
																	onClick={() =>
																		updateTicketStatus(selectedEvent.id, attendee.id, "USED")
																	}
																	className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all"
																	title="Check In"
																>
																	Check In
																</button>
															)}
															{attendee.status !== "CANCELLED" && attendee.status !== "USED" && (
																<button
																	type="button"
																	onClick={() =>
																		updateTicketStatus(selectedEvent.id, attendee.id, "CANCELLED")
																	}
																	className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
																	title="Cancel"
																>
																	<XCircle className="w-4 h-4" />
																</button>
															)}
															<button
																type="button"
																onClick={() => deleteAttendee(selectedEvent.id, attendee.id)}
																className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"
																title="Remove"
															>
																<Trash2 className="w-4 h-4" />
															</button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							{/* Mobile Cards */}
							<div className="md:hidden space-y-3">
								{filteredAttendees().map((attendee) => {
									const badge = statusBadge(attendee.status);
									return (
										<div key={attendee.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
											<div className="flex items-start justify-between mb-3">
												<div>
													<p className="font-bold text-gray-900">{attendee.attendeeName || "N/A"}</p>
													<p className="text-xs text-gray-400">{attendee.attendeeEmail || ""}</p>
												</div>
												<span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
											</div>
											<div className="flex items-center justify-between text-xs text-gray-500 mb-3">
												<code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{attendee.ticketCode}</code>
												<span className="font-semibold text-green-800">
													{parseFloat(attendee.totalAmount) === 0
														? "Free"
														: `₦${parseFloat(attendee.totalAmount).toLocaleString()}`}
												</span>
											</div>
											<div className="flex gap-2 pt-2 border-t border-gray-50">
												{attendee.status === "PENDING" && (
													<button
														type="button"
														onClick={() => updateTicketStatus(selectedEvent.id, attendee.id, "CONFIRMED")}
														className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"
													>
														Confirm Payment
													</button>
												)}
												{attendee.status === "CONFIRMED" && (
													<button
														type="button"
														onClick={() => updateTicketStatus(selectedEvent.id, attendee.id, "USED")}
														className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold"
													>
														✓ Check In
													</button>
												)}
												<button
													type="button"
													onClick={() => deleteAttendee(selectedEvent.id, attendee.id)}
													className="py-1.5 px-3 rounded-lg bg-red-50 text-red-500 text-xs font-bold"
												>
													Remove
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</>
					)}
				</div>
			)}

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
					action?.();
				}}
				oncancel={() => {
					setConfirmState(null);
				}}
			/>
		</div>
	);
}
