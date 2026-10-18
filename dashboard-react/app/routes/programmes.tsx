import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import {
	loadProgrammeData,
	saveProgrammeData,
	resetProgrammeDataToSample,
} from "~/lib/stores/programmeStore";
import type { ProgrammeData, Programme, ProgrammeScheduleItem } from "~/lib/data/sampleProgrammes";
import { uploadImage, MAX_IMAGE_SIZE } from "~/lib/utils/cloudinary";
import {
	BookOpen,
	Plus,
	Edit,
	Trash2,
	RotateCcw,
	Save,
	Search,
	X,
	MessageSquareText,
	Clock,
	MapPin,
	Upload,
} from "lucide-react";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Programmes() {
	const [programmeData, setProgrammeData] = useState<ProgrammeData>({ programmes: [] });
	const [searchQuery, setSearchQuery] = useState("");

	const [isFormModalOpen, setIsFormModalOpen] = useState(false);
	const [formModalMode, setFormModalMode] = useState<"add" | "edit">("add");
	const [editingProgrammeId, setEditingProgrammeId] = useState<string | number | null>(null);

	const [formTitle, setFormTitle] = useState("");
	const [formText, setFormText] = useState("");
	const [formSummary, setFormSummary] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formImage, setFormImage] = useState("");
	const [imageUploading, setImageUploading] = useState(false);
	const [imageError, setImageError] = useState("");
	const [formSchedule, setFormSchedule] = useState<ProgrammeScheduleItem[]>([]);

	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);

	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	useEffect(() => {
		loadProgrammeData().then(setProgrammeData);
	}, []);

	let displayedList = programmeData.programmes;
	if (searchQuery.trim()) {
		const q = searchQuery.toLowerCase();
		displayedList = displayedList.filter(
			(p) =>
				p.title.toLowerCase().includes(q) ||
				(p.summary && p.summary.toLowerCase().includes(q))
		);
	}
	const displayedProgrammes = displayedList;

	async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) return;

		if (file.size > MAX_IMAGE_SIZE) {
			setImageError(
				`Image must be less than 3MB (this file is ${(file.size / (1024 * 1024)).toFixed(1)}MB)`
			);
			return;
		}

		setImageError("");
		setImageUploading(true);
		try {
			const url = await uploadImage(file);
			setFormImage(url);
		} catch (err) {
			setImageError(err instanceof Error && err.message ? err.message : "Upload failed");
		} finally {
			setImageUploading(false);
			input.value = "";
		}
	}

	function removeImage() {
		setFormImage("");
	}

	function addScheduleItem() {
		setFormSchedule((prev) => [...prev, { day: "", time: "", location: "" }]);
	}

	function removeScheduleItem(index: number) {
		setFormSchedule((prev) => prev.filter((_, i) => i !== index));
	}

	function updateScheduleItem(index: number, field: keyof ProgrammeScheduleItem, value: string) {
		setFormSchedule((prev) =>
			prev.map((item, i) => {
				if (i !== index) return item;
				const updated: ProgrammeScheduleItem = { ...item };
				if (field === "day") updated.day = value;
				else if (field === "time") updated.time = value;
				else updated.location = value;
				return updated;
			})
		);
	}

	function openDetails(programme: Programme) {
		setActiveProgramme(programme);
		setIsDetailsModalOpen(true);
	}

	function openAddModal() {
		setFormModalMode("add");
		setEditingProgrammeId(null);
		setFormTitle("");
		setFormText("");
		setFormSummary("");
		setFormDescription("");
		setFormImage("");
		setFormSchedule([]);
		setImageError("");
		setIsFormModalOpen(true);
	}

	function openEditModal(programme: Programme) {
		setFormModalMode("edit");
		setEditingProgrammeId(programme.id);
		setFormTitle(programme.title);
		setFormText(programme.text || "");
		setFormSummary(programme.summary || "");
		setFormDescription(programme.description || "");
		setFormImage(programme.image || "");
		setFormSchedule((programme.schedule || []).map((s) => ({ ...s })));
		setImageError("");
		setIsFormModalOpen(true);
	}

	async function handleSaveProgramme(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (imageUploading) {
			toast("error", "Please wait for the image to finish uploading.");
			return;
		}
		if (!formTitle.trim()) {
			toast("error", "Title is required.");
			return;
		}

		const dataCopy: ProgrammeData = JSON.parse(JSON.stringify(programmeData));

		const programme: Programme = {
			id: editingProgrammeId || `programme-${Date.now()}`,
			title: formTitle.trim(),
			text: formText.trim() || undefined,
			summary: formSummary.trim() || undefined,
			description: formDescription.trim() || undefined,
			image: formImage || undefined,
			schedule: formSchedule.filter((s) => s.day.trim() || s.time.trim()),
		};

		let successMsg = "";
		if (formModalMode === "add") {
			dataCopy.programmes.push(programme);
			successMsg = `Added "${programme.title}"`;
		} else if (formModalMode === "edit" && editingProgrammeId !== null) {
			const idx = dataCopy.programmes.findIndex((p) => p.id === editingProgrammeId);
			if (idx !== -1) dataCopy.programmes[idx] = programme;
			successMsg = `Updated "${programme.title}"`;
		}

		setProgrammeData(dataCopy);
		setIsFormModalOpen(false);
		await saveProgrammeData(dataCopy);
		if (successMsg) toast("success", successMsg);
	}

	function handleDeleteProgramme(programmeId: string | number, title: string) {
		setConfirmState({
			open: true,
			title: "Delete Programme?",
			message: `Remove programme "${title}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: ProgrammeData = JSON.parse(JSON.stringify(programmeData));
				dataCopy.programmes = dataCopy.programmes.filter((p) => p.id !== programmeId);
				setProgrammeData(dataCopy);
				await saveProgrammeData(dataCopy);
				toast("success", `Removed "${title}"`);
			},
		});
	}

	async function handleResetToSample() {
		if (confirm("Reset all programme data to default?")) {
			const data = await resetProgrammeDataToSample();
			setProgrammeData(data);
			toast("success", "Reset to sample data.");
		}
	}

	return (
		<>
			<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
				<div>
					<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
						<BookOpen className="w-7 h-7 text-green-700" />
						Programmes Management
					</h2>
					<p className="text-xs sm:text-sm text-gray-600 mt-1">
						Manage MSSN programmes, schedules, and descriptions.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={handleResetToSample}
						className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
					>
						<RotateCcw className="w-4 h-4 text-gray-500" />
						<span className="hidden sm:inline">Reset</span>
					</button>
					<button
						onClick={openAddModal}
						className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]"
					>
						<Plus className="w-4 h-4" />
						<span>Add Programme</span>
					</button>
				</div>
			</div>

			<div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
				<div className="relative max-w-sm">
					<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
					<input
						type="text"
						placeholder="Search programmes…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
				</div>
			</div>

			{displayedProgrammes.length === 0 ? (
				<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
					<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
						<BookOpen className="w-6 h-6" />
					</div>
					<h3 className="text-base font-semibold text-green-950">No Programmes Found</h3>
					<button
						onClick={openAddModal}
						className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
					>
						<Plus className="w-4 h-4" />
						<span>Add Programme</span>
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{displayedProgrammes.map((programme) => (
						<div
							key={programme.id}
							className="bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
						>
							{programme.image ? (
								<div className="relative h-40 overflow-hidden">
									<img
										src={programme.image}
										alt={programme.title}
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
									<h3 className="absolute bottom-3 left-4 text-lg font-bold text-white">
										{programme.title}
									</h3>
								</div>
							) : (
								<div className="px-5 py-4 bg-green-50/60 border-b border-green-100">
									<h3 className="text-lg font-bold text-green-950">{programme.title}</h3>
								</div>
							)}

							<div className="p-5 space-y-4">
								{programme.summary ? (
									<p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
										{programme.summary}
									</p>
								) : null}

								{programme.schedule && programme.schedule.length > 0 ? (
									<div className="space-y-1.5">
										<p className="text-[11px] font-semibold text-green-900 uppercase tracking-wide">
											Schedule
										</p>
										{programme.schedule.map((item, i) => (
											<div key={`${item.day}-${i}`} className="flex items-center gap-2 text-xs text-gray-600">
												<Clock className="w-3.5 h-3.5 text-green-600 shrink-0" />
												<span className="font-medium">{item.day}</span>
												<span>•</span>
												<span>{item.time}</span>
												{item.location ? (
													<>
														<span>•</span>
														<MapPin className="w-3 h-3 text-gray-400 shrink-0" />
														<span className="text-gray-500">{item.location}</span>
													</>
												) : null}
											</div>
										))}
									</div>
								) : null}

								<div className="flex items-center justify-between pt-3 border-t border-gray-100">
									<div className="flex items-center space-x-1">
										<button
											onClick={() => openDetails(programme)}
											className="px-3 py-1.5 text-[11px] font-semibold text-green-800 bg-green-100/80 hover:bg-green-200 rounded-md transition-colors"
										>
											View
										</button>
										<button
											onClick={() => openEditModal(programme)}
											className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
											title="Edit"
										>
											<Edit className="w-3.5 h-3.5" />
										</button>
										<button
											onClick={() => handleDeleteProgramme(programme.id, programme.title)}
											className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
											title="Delete"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
									<a
										href="https://wa.me/2347076412101?text=Hello%20MSSN%20OAU%2C%20I%20have%20a%20question%20about%20the%20programmes."
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-green-700 hover:bg-green-800 text-white shadow-sm transition-all"
									>
										<MessageSquareText className="w-3.5 h-3.5" />
										<span>Contact us</span>
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			</div>

			{isDetailsModalOpen && activeProgramme ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">{activeProgramme.title}</h3>
								{activeProgramme.text ? (
									<p className="text-xs text-gray-500 mt-0.5">{activeProgramme.text}</p>
								) : null}
							</div>
							<button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
								<X className="w-5 h-5" />
							</button>
						</div>

						{activeProgramme.image ? (
							<img
								src={activeProgramme.image}
								alt={activeProgramme.title}
								className="w-full h-48 object-cover rounded-xl"
							/>
						) : null}

						{activeProgramme.description ? (
							<div
								className="prose prose-sm text-gray-600"
								dangerouslySetInnerHTML={{ __html: activeProgramme.description }}
							/>
						) : null}

						{activeProgramme.schedule && activeProgramme.schedule.length > 0 ? (
							<div className="space-y-2">
								<p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Schedule</p>
								{activeProgramme.schedule.map((item, i) => (
									<div
										key={`${item.day}-${i}`}
										className="flex items-start gap-2 text-xs text-gray-600 bg-green-50/50 p-2.5 rounded-lg border border-green-100"
									>
										<Clock className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
										<div>
											<span className="font-semibold text-green-950">{item.day}</span> — {item.time}
											{item.location ? (
												<p className="text-gray-500 mt-0.5">
													<MapPin className="w-3 h-3 inline" /> {item.location}
												</p>
											) : null}
										</div>
									</div>
								))}
							</div>
						) : null}

						<div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
							<button
								onClick={() => setIsDetailsModalOpen(false)}
								className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
							<a
								href="https://wa.me/2347076412101?text=Hello%20MSSN%20OAU%2C%20I%20have%20a%20question%20about%20the%20programmes."
								target="_blank"
								rel="noopener noreferrer"
								className="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
							>
								<MessageSquareText className="w-3.5 h-3.5" />
								<span>Contact us</span>
							</a>
						</div>
					</div>
				</div>
			) : null}

			{isFormModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 text-xs flex flex-col max-h-[85vh] min-h-0">
						<div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
							<h3 className="text-base font-bold text-green-950 flex items-center gap-2">
								<BookOpen className="w-5 h-5 text-green-700" />
								{formModalMode === "add" ? "Add Programme" : "Edit Programme"}
							</h3>
							<button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-700">
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleSaveProgramme} className="p-6 space-y-3 overflow-y-auto min-h-0 flex-1">
							<div>
								<label htmlFor="form-title" className="block font-semibold text-gray-700 mb-1">
									Title *
								</label>
								<input
									id="form-title"
									type="text"
									required
									placeholder="Tutorials"
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label htmlFor="form-text" className="block font-semibold text-gray-700 mb-1">
									Short Description (one-liner)
								</label>
								<input
									id="form-text"
									type="text"
									placeholder="Academic tutorials organised by the Academic Committee."
									value={formText}
									onChange={(e) => setFormText(e.target.value)}
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
								<p className="text-[11px] text-gray-400 mt-1">Brief tagline shown on the homepage tab.</p>
							</div>
							<div>
								<label htmlFor="form-summary" className="block font-semibold text-gray-700 mb-1">
									Summary (card text)
								</label>
								<textarea
									id="form-summary"
									rows={2}
									placeholder="Short paragraph displayed on the programme card…"
									value={formSummary}
									onChange={(e) => setFormSummary(e.target.value)}
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label htmlFor="form-description" className="block font-semibold text-gray-700 mb-1">
									Detailed Description (HTML)
								</label>
								<textarea
									id="form-description"
									rows={4}
									placeholder="<p>Full HTML description with bullets, links, etc.</p>"
									value={formDescription}
									onChange={(e) => setFormDescription(e.target.value)}
									className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
								<p className="text-[11px] text-gray-400 mt-1">HTML content shown in the programme detail modal.</p>
							</div>

							<div>
								<label className="block font-semibold text-gray-700 mb-1">Image (max 3MB)</label>
								{formImage ? (
									<div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-2">
										<img src={formImage} alt="Preview" className="w-full h-full object-cover" />
										<button
											type="button"
											onClick={removeImage}
											className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								) : null}
								<label
									className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-3 py-4 cursor-pointer transition-colors ${
										imageUploading
											? "bg-gray-100 border-gray-300"
											: "bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50"
									}`}
								>
									{imageUploading ? (
										<>
											<div className="animate-spin w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full" />
											<span className="text-gray-500 text-xs">Uploading...</span>
										</>
									) : (
										<>
											<Upload className="w-4 h-4 text-gray-500" />
											<span className="text-gray-500 text-xs">
												{formImage ? "Replace Image" : "Upload Image"}
											</span>
										</>
									)}
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleFileUpload}
										disabled={imageUploading}
									/>
								</label>
								{imageError ? <p className="text-[11px] text-rose-600 mt-1">{imageError}</p> : null}
							</div>

							<div>
								<div className="flex items-center justify-between mb-1">
									<label className="block font-semibold text-gray-700">Schedule</label>
									<button
										type="button"
										onClick={addScheduleItem}
										className="text-[11px] font-semibold text-green-700 hover:text-green-800 flex items-center gap-1"
									>
										<Plus className="w-3 h-3" /> Add Time
									</button>
								</div>
								{formSchedule.length === 0 ? (
									<p className="text-[11px] text-gray-400 italic">
										No schedule items. Click "Add Time" to add one.
									</p>
								) : (
									<div className="space-y-2">
										{formSchedule.map((item, i) => (
											<div
												key={i}
												className="flex items-center gap-2 bg-green-50/50 p-2 rounded-lg border border-green-100"
											>
												<input
													type="text"
													placeholder="Day (e.g. Mondays)"
													value={item.day}
													onChange={(e) => updateScheduleItem(i, "day", e.target.value)}
													className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600"
												/>
												<input
													type="text"
													placeholder="Time (e.g. 4PM)"
													value={item.time}
													onChange={(e) => updateScheduleItem(i, "time", e.target.value)}
													className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600"
												/>
												<input
													type="text"
													placeholder="Location"
													value={item.location ?? ""}
													onChange={(e) => updateScheduleItem(i, "location", e.target.value)}
													className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600"
												/>
												<button
													type="button"
													onClick={() => removeScheduleItem(i)}
													className="text-gray-400 hover:text-rose-600 p-1 shrink-0"
												>
													<X className="w-3.5 h-3.5" />
												</button>
											</div>
										))}
									</div>
								)}
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
									disabled={imageUploading}
									className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-bold shadow-md flex items-center gap-1.5"
								>
									{imageUploading ? (
										<>
											<div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
											<span>Uploading...</span>
										</>
									) : (
										<>
											<Save className="w-3.5 h-3.5" />
											<span>Save Programme</span>
										</>
									)}
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
