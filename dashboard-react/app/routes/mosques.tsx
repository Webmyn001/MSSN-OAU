import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { loadMosqueData, saveMosqueData, resetMosqueData } from "~/lib/stores/mosqueStore";
import type { MosqueData, MosqueEntry } from "~/lib/data/sampleMosques";
import { uploadImage, MAX_UPLOAD_SIZE } from "~/lib/utils/cloudinary";
import {
	Building2,
	RotateCcw,
	Search,
	X,
	Plus,
	Trash2,
	Pencil,
	MapPinned,
	Save,
	Image,
	Upload,
} from "lucide-react";

const MAX_IMAGE_COUNT = 4;

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Mosques() {
	const [data, setData] = useState<MosqueData>({ mosques: [] });
	const [searchQuery, setSearchQuery] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formLabel, setFormLabel] = useState("");
	const [formAddress, setFormAddress] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formUrl, setFormUrl] = useState("");
	const [formImages, setFormImages] = useState<string[]>([]);
	const [imageUploading, setImageUploading] = useState(false);
	const [imageError, setImageError] = useState("");
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [activeItem, setActiveItem] = useState<MosqueEntry | null>(null);
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	useEffect(() => {
		void loadMosqueData().then(setData);
	}, []);

	let list = data.mosques;
	if (searchQuery.trim()) {
		const q = searchQuery.toLowerCase();
		list = list.filter(
			(m) =>
				m.label.toLowerCase().includes(q) ||
				m.address.toLowerCase().includes(q) ||
				(m.description && m.description.toLowerCase().includes(q))
		);
	}
	const displayedItems = list;

	async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) return;
		if (formImages.length >= MAX_IMAGE_COUNT) {
			setImageError(`Maximum of ${MAX_IMAGE_COUNT} images allowed. Remove one first.`);
			input.value = "";
			return;
		}
		if (file.size > MAX_UPLOAD_SIZE) {
			setImageError(
				`Image is too large. Please upload an image under 15MB (this file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`
			);
			input.value = "";
			return;
		}
		setImageError("");
		setImageUploading(true);
		try {
			const url = await uploadImage(file);
			setFormImages((prev) => [url, ...prev]);
		} catch (err) {
			setImageError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setImageUploading(false);
			input.value = "";
		}
	}

	function removeImage(index: number) {
		setFormImages((prev) => prev.filter((_, i) => i !== index));
	}

	function openForm(item?: MosqueEntry) {
		if (item) {
			setEditingId(item.id);
			setFormLabel(item.label);
			setFormAddress(item.address);
			setFormDescription(item.description || "");
			setFormUrl(item.url || "");
			setFormImages([...(item.images || [])]);
		} else {
			setEditingId(null);
			setFormLabel("");
			setFormAddress("");
			setFormDescription("");
			setFormUrl("");
			setFormImages([]);
		}
		setImageError("");
		setIsFormOpen(true);
	}

	function closeForm() {
		setIsFormOpen(false);
		setEditingId(null);
	}

	async function saveForm() {
		if (!formLabel.trim() || !formAddress.trim()) {
			toast("error", "Name and address are required");
			return;
		}

		const entry: MosqueEntry = {
			id: editingId || `mosque-${Date.now()}`,
			label: formLabel.trim(),
			address: formAddress.trim(),
			description: formDescription.trim(),
			url: formUrl.trim(),
			images: formImages,
		};

		const updated: MosqueData =
			editingId !== null
				? { ...data, mosques: data.mosques.map((m) => (m.id === editingId ? entry : m)) }
				: { ...data, mosques: [...data.mosques, entry] };

		setData(updated);
		await saveMosqueData(updated);
		toast("success", editingId ? "Musollah updated" : "Musollah added");
		closeForm();
	}

	function deleteItem(id: string, label: string) {
		setConfirmState({
			open: true,
			title: "Delete Musollah?",
			message: `Delete "${label}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const updated: MosqueData = {
					...data,
					mosques: data.mosques.filter((m) => m.id !== id),
				};
				setData(updated);
				await saveMosqueData(updated);
				setIsDetailModalOpen(false);
				toast("success", "Deleted");
			},
		});
	}

	function openDetail(item: MosqueEntry) {
		setActiveItem(item);
		setIsDetailModalOpen(true);
	}

	async function handleReset() {
		if (confirm("Reset all musollah data to sample?")) {
			const reset = await resetMosqueData();
			setData(reset);
			toast("success", "Reset to sample data");
		}
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<Building2 className="w-7 h-7 text-green-700" />
							Musollahs
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">
							Manage musollahs displayed on the website.
						</p>
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => void handleReset()}
							className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
						>
							<RotateCcw className="w-4 h-4 text-gray-500" />
							<span className="hidden sm:inline">Reset</span>
						</button>
						<button
							onClick={() => openForm()}
							className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-700 text-white hover:bg-green-800 transition-all shadow-sm"
						>
							<Plus className="w-4 h-4" />
							<span>Add Musollah</span>
						</button>
					</div>
				</div>

				<div className="relative">
					<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
					<input
						type="text"
						placeholder="Search musollahs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
				</div>

				{displayedItems.length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<Building2 className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No Musollahs Found</h3>
						<p className="text-xs text-gray-500">No musollahs match your search.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{displayedItems.map((item) => (
							<button
								key={item.id}
								onClick={() => openDetail(item)}
								className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
							>
								{item.images && item.images.length > 0 ? (
									<div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
										<img
											src={item.images[0]}
											alt={item.label}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								) : null}
								<h4 className="text-sm font-bold text-green-950 group-hover:text-green-700 transition-colors">
									{item.label}
								</h4>
								<p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
									<MapPinned className="w-3 h-3 shrink-0" />
									{item.address}
								</p>
								{item.description ? (
									<p className="text-[11px] text-gray-400 mt-2 line-clamp-2">{item.description}</p>
								) : null}
								{item.images && item.images.length > 1 ? (
									<p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
										<Image className="w-3 h-3" />
										{item.images.length} images
									</p>
								) : null}
							</button>
						))}
					</div>
				)}
			</div>

			{isFormOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<h3 className="text-base font-bold text-green-950">
								{editingId ? "Edit Musollah" : "Add Musollah"}
							</h3>
							<button onClick={closeForm} className="text-gray-400 hover:text-gray-700">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-3">
							<div>
								<label htmlFor="m-label" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Name *
								</label>
								<input
									id="m-label"
									type="text"
									value={formLabel}
									onChange={(e) => setFormLabel(e.target.value)}
									placeholder="e.g. Central Mosque"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="m-address"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Address *
								</label>
								<input
									id="m-address"
									type="text"
									value={formAddress}
									onChange={(e) => setFormAddress(e.target.value)}
									placeholder="e.g. Central Mosque, OAU."
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="m-desc"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Description
								</label>
								<textarea
									id="m-desc"
									rows={3}
									value={formDescription}
									onChange={(e) => setFormDescription(e.target.value)}
									placeholder="A short description..."
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label htmlFor="m-url" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Google Maps URL
								</label>
								<input
									id="m-url"
									type="url"
									value={formUrl}
									onChange={(e) => setFormUrl(e.target.value)}
									placeholder="https://maps.google.com/..."
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>

							{/* Image Upload */}
							<div>
								<label className="block text-[11px] font-semibold text-gray-700 mb-1">
									Images (auto-compressed to 3MB, up to {MAX_IMAGE_COUNT} images)
								</label>
								{formImages.length > 0 ? (
									<p className="text-[11px] text-gray-400 mb-1">
										{formImages.length}/{MAX_IMAGE_COUNT} uploaded
									</p>
								) : null}
								{formImages.length > 0 ? (
									<div className="grid grid-cols-3 gap-2 mb-2">
										{formImages.map((img, i) => (
											<div
												key={`${img}-${i}`}
												className="relative rounded-lg overflow-hidden h-20 bg-gray-100 border border-gray-200"
											>
												<img src={img} alt="Mosque image" className="w-full h-full object-cover" />
												<button
													type="button"
													onClick={() => removeImage(i)}
													className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
												>
													<X className="w-3 h-3" />
												</button>
											</div>
										))}
									</div>
								) : null}
								<label
									className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-3 py-3 cursor-pointer transition-colors ${
										formImages.length >= MAX_IMAGE_COUNT
											? "bg-gray-100 border-gray-200 cursor-not-allowed"
											: imageUploading
												? "bg-gray-100 border-gray-300"
												: "bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50"
									}`}
								>
									{imageUploading ? (
										<>
											<div className="animate-spin w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full"></div>
											<span className="text-gray-500 text-xs">Uploading...</span>
										</>
									) : (
										<>
											<Upload className="w-4 h-4 text-gray-500" />
											<span className="text-gray-500 text-xs">
												{formImages.length >= MAX_IMAGE_COUNT
													? `Maximum ${MAX_IMAGE_COUNT} images reached`
													: "Upload Image"}
											</span>
										</>
									)}
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => void handleFileUpload(e)}
										disabled={imageUploading || formImages.length >= MAX_IMAGE_COUNT}
									/>
								</label>
								{imageError ? <p className="text-[11px] text-rose-600 mt-1">{imageError}</p> : null}
							</div>
						</div>

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								onClick={closeForm}
								className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={() => void saveForm()}
								className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<Save className="w-3.5 h-3.5" /> {editingId ? "Update" : "Add"}
							</button>
						</div>
					</div>
				</div>
			) : null}

			{isDetailModalOpen && activeItem ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">{activeItem.label}</h3>
								<p className="text-[11px] text-gray-500 flex items-center gap-1">
									<MapPinned className="w-3 h-3" />
									{activeItem.address}
								</p>
							</div>
							<button
								onClick={() => setIsDetailModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{activeItem.images && activeItem.images.length > 0 ? (
							<>
								<div className="rounded-xl overflow-hidden">
									<img
										src={activeItem.images[0]}
										alt={activeItem.label}
										className="w-full h-48 object-cover"
									/>
								</div>
								{activeItem.images.length > 1 ? (
									<div className="grid grid-cols-3 gap-2">
										{activeItem.images.slice(1, 4).map((img, i) => (
											<div key={`${img}-${i}`} className="rounded-lg overflow-hidden h-20">
												<img
													src={img}
													alt={activeItem.label}
													className="w-full h-full object-cover"
												/>
											</div>
										))}
									</div>
								) : null}
							</>
						) : null}

						{activeItem.description ? (
							<div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
								<p className="text-xs text-gray-700 leading-relaxed">{activeItem.description}</p>
							</div>
						) : null}

						{activeItem.url ? (
							<a
								href={activeItem.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-xs text-green-700 hover:text-green-800 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors"
							>
								<MapPinned className="w-4 h-4" /> View on Maps
							</a>
						) : null}

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								onClick={() => {
									setIsDetailModalOpen(false);
									openForm(activeItem);
								}}
								className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
								title="Edit"
							>
								<Pencil className="w-4 h-4" />
							</button>
							<button
								onClick={() => deleteItem(activeItem.id, activeItem.label)}
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
