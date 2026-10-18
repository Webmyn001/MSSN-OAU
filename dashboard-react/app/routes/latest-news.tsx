import { useEffect, useRef, useState } from "react";
import {
	Newspaper,
	Search,
	X,
	Plus,
	Trash2,
	Eye,
	Pencil,
	Calendar,
	Save,
	Upload,
} from "lucide-react";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { toast } from "~/lib/stores/toast";
import { loadLatestNewsData, saveLatestNewsData } from "~/lib/stores/latestNewsStore";
import type { LatestNews, LatestNewsData } from "~/lib/data/sampleLatestNews";
import { uploadImage } from "~/lib/utils/cloudinary";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

const categories = ["General", "Programme", "Event Report", "Announcement", "Academic", "Welfare"];

export default function LatestNewsAdmin() {
	const [data, setData] = useState<LatestNewsData>({ items: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterCategory, setFilterCategory] = useState("all");

	// Form state
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formTitle, setFormTitle] = useState("");
	const [formSummary, setFormSummary] = useState("");
	const [formContent, setFormContent] = useState("");
	const [formImage, setFormImage] = useState("");
	const [formImage2, setFormImage2] = useState("");
	const [formDate, setFormDate] = useState("");
	const [formAuthor, setFormAuthor] = useState("");
	const [formCategory, setFormCategory] = useState("General");
	const [imageUploading, setImageUploading] = useState(false);
	const [image2Uploading, setImage2Uploading] = useState(false);
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");
	const [imagePreviewUrl2, setImagePreviewUrl2] = useState("");
	const [formLoading, setFormLoading] = useState(false);

	// Detail modal
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [activeItem, setActiveItem] = useState<LatestNews | null>(null);

	// Confirm dialog state for destructive actions
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	const fileInput = useRef<HTMLInputElement | null>(null);
	const fileInput2 = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		let cancelled = false;
		loadLatestNewsData().then((d) => {
			if (cancelled) return;
			setData(d);
			setIsLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		const preview = URL.createObjectURL(file);
		if (slot === 1) {
			setImagePreviewUrl(preview);
			setImageUploading(true);
		} else {
			setImagePreviewUrl2(preview);
			setImage2Uploading(true);
		}
		try {
			const url = await uploadImage(file);
			if (slot === 1) {
				setFormImage(url);
				setImagePreviewUrl("");
			} else {
				setFormImage2(url);
				setImagePreviewUrl2("");
			}
		} catch {
			if (slot === 1) {
				setImagePreviewUrl("");
				toast("error", "Image upload failed. Check Cloudinary credentials.");
			} else {
				setImagePreviewUrl2("");
				toast("error", "Image upload failed.");
			}
		} finally {
			if (slot === 1) setImageUploading(false);
			else setImage2Uploading(false);
		}
	}

	function handleImage1Click() {
		fileInput.current?.click();
	}

	function handleImage2Click() {
		fileInput2.current?.click();
	}

	function closeDetailModal() {
		setIsDetailModalOpen(false);
	}

	function editFromDetail() {
		setIsDetailModalOpen(false);
		if (activeItem) openForm(activeItem);
	}

	function displayedItems(): LatestNews[] {
		let list = data.items;
		if (filterCategory !== "all") {
			list = list.filter((i) => i.category === filterCategory);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(i) =>
					i.title.toLowerCase().includes(q) ||
					i.summary.toLowerCase().includes(q) ||
					(i.author && i.author.toLowerCase().includes(q))
			);
		}
		return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
	}

	function openForm(item?: LatestNews) {
		setImagePreviewUrl("");
		setImagePreviewUrl2("");
		if (item) {
			setEditingId(item.id);
			setFormTitle(item.title);
			setFormSummary(item.summary);
			setFormContent(item.content);
			setFormImage(item.image || "");
			setFormImage2(item.image2 || "");
			setFormDate(item.date);
			setFormAuthor(item.author || "");
			setFormCategory(item.category || "General");
		} else {
			setEditingId(null);
			setFormTitle("");
			setFormSummary("");
			setFormContent("");
			setFormImage("");
			setFormImage2("");
			setFormDate(new Date().toISOString().split("T")[0]);
			setFormAuthor("");
			setFormCategory("General");
		}
		setIsFormOpen(true);
	}

	function closeForm() {
		setIsFormOpen(false);
		setEditingId(null);
	}

	function clearImage1() {
		setFormImage("");
		setImagePreviewUrl("");
	}

	function clearImage2() {
		setFormImage2("");
		setImagePreviewUrl2("");
	}

	async function saveForm() {
		if (!formTitle.trim() || !formSummary.trim()) {
			toast("error", "Title and summary are required");
			return;
		}
		if (!formImage.trim()) {
			toast("error", "Main image is required");
			return;
		}

		const item: LatestNews = {
			id: editingId || `ln-${Date.now()}`,
			title: formTitle.trim(),
			summary: formSummary.trim(),
			content: formContent.trim(),
			image: formImage.trim(),
			image2: formImage2.trim() || undefined,
			date: formDate || new Date().toISOString().split("T")[0],
			author: formAuthor.trim() || undefined,
			category: formCategory,
		};

		const nextData: LatestNewsData = editingId
			? { items: data.items.map((i) => (i.id === editingId ? item : i)) }
			: { items: [item, ...data.items] };

		setFormLoading(true);
		try {
			setData(nextData);
			await saveLatestNewsData(nextData);
			toast("success", editingId ? "News updated" : "News published");
			closeForm();
		} finally {
			setFormLoading(false);
		}
	}

	function deleteItem(id: string, title: string) {
		setConfirmState({
			open: true,
			title: "Delete News?",
			message: `Delete "${title}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const nextData: LatestNewsData = { items: data.items.filter((i) => i.id !== id) };
				setData(nextData);
				await saveLatestNewsData(nextData);
				setIsDetailModalOpen(false);
				toast("success", "Deleted");
			},
		});
	}

	function openDetail(item: LatestNews) {
		setActiveItem(item);
		setIsDetailModalOpen(true);
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<Newspaper className="w-7 h-7 text-green-700" />
							Latest News
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">
							Create and manage news items displayed on the homepage.
						</p>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => openForm()}
							className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-700 text-white hover:bg-green-800 transition-all shadow-sm"
						>
							<Plus className="w-4 h-4" />
							<span>Add News</span>
						</button>
					</div>
				</div>

				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
					<div className="flex items-center gap-2 flex-wrap">
						{["all", ...categories].map((cat) => (
							<button
								type="button"
								key={cat}
								onClick={() => setFilterCategory(cat)}
								className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
									filterCategory === cat
										? "bg-green-700 text-white shadow-sm"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								{cat === "all" ? "All" : cat}
							</button>
						))}
					</div>
					<div className="relative flex-1">
						<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
						<input
							type="text"
							placeholder="Search title, summary, author..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>

				{/* Items */}
				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
					</div>
				) : displayedItems().length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<Newspaper className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No News Found</h3>
						<p className="text-xs text-gray-500">No items match your current filters.</p>
					</div>
				) : (
					<div className="space-y-3">
						{displayedItems().map((item) => (
							<button
								type="button"
								key={item.id}
								onClick={() => openDetail(item)}
								className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
							>
								<div className="flex items-start gap-3">
									{item.image ? (
										<div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
											<img src={item.image} alt={item.title} className="w-full h-full object-cover" />
										</div>
									) : null}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="text-sm font-bold text-green-950 line-clamp-1">{item.title}</h4>
											{item.category ? (
												<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 shrink-0">
													{item.category}
												</span>
											) : null}
										</div>
										<p className="text-xs text-gray-600 line-clamp-2">{item.summary}</p>
										<div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
											<span className="flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{formatDate(item.date)}
											</span>
											{item.author ? <span>{item.author}</span> : null}
										</div>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										<Eye className="w-4 h-4 text-gray-400" />
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Form Modal */}
			{isFormOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<h3 className="text-base font-bold text-green-950">
								{editingId ? "Edit News" : "Add Latest News"}
							</h3>
							<button
								type="button"
								onClick={closeForm}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-3">
							<div>
								<label htmlFor="ln-title" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Title *
								</label>
								<input
									id="ln-title"
									type="text"
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									placeholder="News title"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="ln-summary"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Summary *
								</label>
								<textarea
									id="ln-summary"
									rows={2}
									value={formSummary}
									onChange={(e) => setFormSummary(e.target.value)}
									placeholder="Short summary"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="ln-content"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Content (HTML)
								</label>
								<textarea
									id="ln-content"
									rows={5}
									value={formContent}
									onChange={(e) => setFormContent(e.target.value)}
									placeholder="<p>Full HTML content...</p>"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"
								/>
							</div>

							{/* Main Image (compulsory) */}
							<div>
								<label className="block text-[11px] font-semibold text-gray-700 mb-1">
									Main Image *
								</label>
								<input
									type="file"
									accept="image/*"
									ref={fileInput}
									onChange={(e) => handleImageUpload(e, 1)}
									className="hidden"
								/>
								<div className="space-y-2">
									{imagePreviewUrl || formImage ? (
										<div className="relative rounded-xl overflow-hidden border border-gray-200 h-32">
											<img
												src={imagePreviewUrl || formImage}
												alt="Preview"
												className="w-full h-full object-cover"
											/>
											{imageUploading ? (
												<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
													<div className="w-5 h-5 border-2 border-white border-t-green-400 rounded-full animate-spin" />
												</div>
											) : (
												<button
													type="button"
													onClick={clearImage1}
													className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-gray-600 hover:text-rose-600 text-xs"
												>
													Change
												</button>
											)}
										</div>
									) : null}
									<button
										type="button"
										onClick={handleImage1Click}
										disabled={imageUploading}
										className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-green-300 text-xs font-semibold text-green-700 hover:bg-green-50 transition-all disabled:opacity-50"
									>
										<Upload className="w-4 h-4" />
										{imageUploading
											? "Uploading..."
											: formImage
												? "Replace Image"
												: "Upload Main Image"}
									</button>
								</div>
							</div>

							{/* Second Image (optional) */}
							<div>
								<label className="block text-[11px] font-semibold text-gray-700 mb-1">
									Second Image (optional)
								</label>
								<input
									type="file"
									accept="image/*"
									ref={fileInput2}
									onChange={(e) => handleImageUpload(e, 2)}
									className="hidden"
								/>
								<div className="space-y-2">
									{imagePreviewUrl2 || formImage2 ? (
										<div className="relative rounded-xl overflow-hidden border border-gray-200 h-32">
											<img
												src={imagePreviewUrl2 || formImage2}
												alt="Preview"
												className="w-full h-full object-cover"
											/>
											{image2Uploading ? (
												<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
													<div className="w-5 h-5 border-2 border-white border-t-green-400 rounded-full animate-spin" />
												</div>
											) : (
												<button
													type="button"
													onClick={clearImage2}
													className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-gray-600 hover:text-rose-600 text-xs"
												>
													Remove
												</button>
											)}
										</div>
									) : null}
									<button
										type="button"
										onClick={handleImage2Click}
										disabled={image2Uploading}
										className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
									>
										<Upload className="w-4 h-4" />
										{image2Uploading
											? "Uploading..."
											: formImage2
												? "Replace Image"
												: "Upload Second Image (optional)"}
									</button>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										htmlFor="ln-date"
										className="block text-[11px] font-semibold text-gray-700 mb-1"
									>
										Date
									</label>
									<input
										id="ln-date"
										type="date"
										value={formDate}
										onChange={(e) => setFormDate(e.target.value)}
										className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label
										htmlFor="ln-category"
										className="block text-[11px] font-semibold text-gray-700 mb-1"
									>
										Category
									</label>
									<select
										id="ln-category"
										value={formCategory}
										onChange={(e) => setFormCategory(e.target.value)}
										className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
									>
										{categories.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<label
									htmlFor="ln-author"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Author
								</label>
								<input
									id="ln-author"
									type="text"
									value={formAuthor}
									onChange={(e) => setFormAuthor(e.target.value)}
									placeholder="e.g. Academic Committee"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
						</div>

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								type="button"
								onClick={closeForm}
								className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={saveForm}
								disabled={formLoading || imageUploading || image2Uploading}
								className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<Save className="w-3.5 h-3.5" />{" "}
								{imageUploading || image2Uploading
									? "Uploading image..."
									: editingId
										? "Update"
										: "Publish"}
							</button>
						</div>
					</div>
				</div>
			) : null}

			{/* Detail Modal */}
			{isDetailModalOpen && activeItem ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">{activeItem.title}</h3>
								<p className="text-[11px] text-gray-500 flex items-center gap-1">
									<Calendar className="w-3 h-3" />
									{formatDate(activeItem.date)}{" "}
									{activeItem.author ? (
										<>
											<span className="mx-1">•</span>
											{activeItem.author}
										</>
									) : null}
								</p>
							</div>
							<button
								type="button"
								onClick={closeDetailModal}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{activeItem.image ? (
							<div className="space-y-2">
								<img
									src={activeItem.image}
									alt={activeItem.title}
									className="w-full h-40 object-cover rounded-xl border border-gray-100"
								/>
								{activeItem.image2 ? (
									<img
										src={activeItem.image2}
										alt={`${activeItem.title} - second image`}
										className="w-full h-32 object-cover rounded-xl border border-gray-100"
									/>
								) : null}
							</div>
						) : null}

						<div className="space-y-3">
							{activeItem.category ? (
								<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
									{activeItem.category}
								</span>
							) : null}
							<div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
								<p className="text-xs text-gray-600 font-semibold mb-1">Summary</p>
								<p className="text-xs text-gray-700">{activeItem.summary}</p>
							</div>
							{activeItem.content ? (
								<div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
									<p className="text-xs text-gray-600 font-semibold mb-1">Content</p>
									<div
										className="text-xs text-gray-700 prose prose-xs max-w-none"
										dangerouslySetInnerHTML={{ __html: activeItem.content }}
									/>
								</div>
							) : null}
						</div>

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								type="button"
								onClick={editFromDetail}
								className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
								title="Edit"
							>
								<Pencil className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => deleteItem(activeItem.id, activeItem.title)}
								className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
								title="Delete"
							>
								<Trash2 className="w-4 h-4" />
							</button>
							<div className="flex-1" />
							<button
								type="button"
								onClick={closeDetailModal}
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
					action?.();
				}}
				oncancel={() => setConfirmState(null)}
			/>
		</>
	);
}
