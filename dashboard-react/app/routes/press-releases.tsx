import { useEffect, useState } from "react";
import {
	Link,
	RotateCcw,
	Search,
	X,
	Plus,
	Trash2,
	Eye,
	Pencil,
	Calendar,
	ExternalLink,
	Save,
} from "lucide-react";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { toast } from "~/lib/stores/toast";
import {
	loadPressReleaseLinks,
	savePressReleaseLinks,
	resetPressReleaseLinks,
} from "~/lib/stores/pressReleaseLinkStore";
import type { PressReleaseLink, PressReleaseLinkData } from "~/lib/data/samplePressReleaseLinks";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function PressReleases() {
	const [data, setData] = useState<PressReleaseLinkData>({ links: [] });
	const [searchQuery, setSearchQuery] = useState("");

	// Form state
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formTitle, setFormTitle] = useState("");
	const [formUrl, setFormUrl] = useState("");
	const [formImage, setFormImage] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formDate, setFormDate] = useState("");

	// Detail modal
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [activeItem, setActiveItem] = useState<PressReleaseLink | null>(null);

	// Confirm dialog state for destructive actions
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	useEffect(() => {
		setData(loadPressReleaseLinks());
	}, []);

	function displayedItems(): PressReleaseLink[] {
		let list = data.links;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
			);
		}
		return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
	}

	function openForm(item?: PressReleaseLink) {
		if (item) {
			setEditingId(item.id);
			setFormTitle(item.title);
			setFormUrl(item.url);
			setFormImage(item.image || "");
			setFormDescription(item.description);
			setFormDate(item.date);
		} else {
			setEditingId(null);
			setFormTitle("");
			setFormUrl("");
			setFormImage("");
			setFormDescription("");
			setFormDate(new Date().toISOString().split("T")[0]);
		}
		setIsFormOpen(true);
	}

	function closeForm() {
		setIsFormOpen(false);
		setEditingId(null);
	}

	async function saveForm() {
		if (!formTitle.trim() || !formUrl.trim() || !formDescription.trim()) {
			toast("error", "Title, URL, and description are required");
			return;
		}

		const item: PressReleaseLink = {
			id: editingId || `prl-${Date.now()}`,
			title: formTitle.trim(),
			url: formUrl.trim(),
			image: formImage.trim() || undefined,
			description: formDescription.trim(),
			date: formDate || new Date().toISOString().split("T")[0],
		};

		const nextData: PressReleaseLinkData = editingId
			? { links: data.links.map((i) => (i.id === editingId ? item : i)) }
			: { links: [item, ...data.links] };

		setData(nextData);
		await savePressReleaseLinks(nextData);
		toast("success", editingId ? "Press release updated" : "Press release added");
		closeForm();
	}

	function deleteItem(id: string, title: string) {
		setConfirmState({
			open: true,
			title: "Delete Press Release?",
			message: `Delete "${title}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const nextData: PressReleaseLinkData = { links: data.links.filter((i) => i.id !== id) };
				setData(nextData);
				await savePressReleaseLinks(nextData);
				setIsDetailModalOpen(false);
				toast("success", "Deleted");
			},
		});
	}

	function openDetail(item: PressReleaseLink) {
		setActiveItem(item);
		setIsDetailModalOpen(true);
	}

	async function handleReset() {
		if (confirm("Reset all press release links to sample data?")) {
			const nextData = await resetPressReleaseLinks();
			setData(nextData);
			toast("success", "Reset to sample data");
		}
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<Link className="w-7 h-7 text-green-700" />
							Press Releases
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">
							Manage blog post links displayed on the homepage.
						</p>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={handleReset}
							className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
						>
							<RotateCcw className="w-4 h-4 text-gray-500" />
							<span className="hidden sm:inline">Reset</span>
						</button>
						<button
							type="button"
							onClick={() => openForm()}
							className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-700 text-white hover:bg-green-800 transition-all shadow-sm"
						>
							<Plus className="w-4 h-4" />
							<span>Add Press Release</span>
						</button>
					</div>
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
					<input
						type="text"
						placeholder="Search press releases..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
				</div>

				{/* Items */}
				{displayedItems().length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<Link className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No Press Releases</h3>
						<p className="text-xs text-gray-500">No items match your search.</p>
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
										<h4 className="text-sm font-bold text-green-950 line-clamp-1">{item.title}</h4>
										<p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description}</p>
										<div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
											<span className="flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{formatDate(item.date)}
											</span>
											<span className="flex items-center gap-1 text-green-700 truncate">
												<ExternalLink className="w-3 h-3" />
												{item.url}
											</span>
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
								{editingId ? "Edit Press Release" : "Add Press Release"}
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
								<label
									htmlFor="prl-title"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Title *
								</label>
								<input
									id="prl-title"
									type="text"
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									placeholder="Blog post title"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="prl-url"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Article URL *
								</label>
								<input
									id="prl-url"
									type="url"
									value={formUrl}
									onChange={(e) => setFormUrl(e.target.value)}
									placeholder="https://annuurpress.org.ng/..."
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="prl-image"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Image URL
								</label>
								<input
									id="prl-image"
									type="url"
									value={formImage}
									onChange={(e) => setFormImage(e.target.value)}
									placeholder="https://..."
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="prl-desc"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Short Description *
								</label>
								<textarea
									id="prl-desc"
									rows={3}
									value={formDescription}
									onChange={(e) => setFormDescription(e.target.value)}
									placeholder="A brief description of the blog post..."
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label
									htmlFor="prl-date"
									className="block text-[11px] font-semibold text-gray-700 mb-1"
								>
									Date
								</label>
								<input
									id="prl-date"
									type="date"
									value={formDate}
									onChange={(e) => setFormDate(e.target.value)}
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
								className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<Save className="w-3.5 h-3.5" /> {editingId ? "Update" : "Add"}
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
									{formatDate(activeItem.date)}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsDetailModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{activeItem.image ? (
							<img
								src={activeItem.image}
								alt={activeItem.title}
								className="w-full h-40 object-cover rounded-xl"
							/>
						) : null}

						<div className="space-y-3">
							<div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
								<p className="text-xs text-gray-600 leading-relaxed">{activeItem.description}</p>
							</div>
							<a
								href={activeItem.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-xs text-green-700 hover:text-green-800 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors"
							>
								<ExternalLink className="w-4 h-4" /> View Article
							</a>
						</div>

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								type="button"
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
								type="button"
								onClick={() => deleteItem(activeItem.id, activeItem.title)}
								className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
								title="Delete"
							>
								<Trash2 className="w-4 h-4" />
							</button>
							<div className="flex-1" />
							<a
								href={activeItem.url}
								target="_blank"
								rel="noopener noreferrer"
								className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<ExternalLink className="w-3.5 h-3.5" /> Visit
							</a>
							<button
								type="button"
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
					action?.();
				}}
				oncancel={() => setConfirmState(null)}
			/>
		</>
	);
}
