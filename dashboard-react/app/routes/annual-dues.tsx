import { useEffect, useRef, useState } from "react";
import {
	CreditCard,
	Search,
	X,
	Download,
	Printer,
	Eye,
	CheckCircle2,
	Clock,
	XCircle,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Users,
	Coins,
	Trash2,
	type LucideIcon,
} from "lucide-react";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { toast } from "~/lib/stores/toast";
import { API_BASE } from "~/lib/api/base";

interface Payment {
	id: string;
	receiptNumber: string;
	fullName: string;
	email: string;
	department: string;
	faculty: string;
	level: string;
	amount: number;
	sessionName: string;
	status: string;
	paymentReference: string;
	paidAt?: string;
	createdAt?: string;
}

interface Stats {
	total: number;
	completed: number;
	pending: number;
	failed: number;
	totalAmount: number;
	amount: number;
	sessionName: string;
}

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export function meta() {
	return [{ title: "Annual Dues Payments | MSSN OAU Admin" }];
}

export default function AnnualDues() {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [stats, setStats] = useState<Stats>({
		total: 0,
		completed: 0,
		pending: 0,
		failed: 0,
		totalAmount: 0,
		amount: 0,
		sessionName: "",
	});
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	// Detail modal
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [activePayment, setActivePayment] = useState<Payment | null>(null);

	// Confirm dialog state for destructive actions
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	const queryRef = useRef({ page: 1, search: "", status: "" });
	const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	async function fetchStats() {
		try {
			const res = await fetch(`${API_BASE}/public/annual-dues/admin/stats`);
			const json = await res.json();
			if (json.success) setStats(json.data);
		} catch (err) {
			console.error("Failed to fetch stats:", err);
		}
	}

	async function fetchPayments() {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.set("page", String(queryRef.current.page));
			params.set("limit", "20");
			if (queryRef.current.search.trim()) params.set("search", queryRef.current.search.trim());
			if (queryRef.current.status) params.set("status", queryRef.current.status);

			const res = await fetch(`${API_BASE}/public/annual-dues/admin/payments?${params}`);
			const json = await res.json();
			if (json.success) {
				setPayments(json.data);
				setTotalCount(json.meta?.pagination?.total || 0);
				setTotalPages(json.meta?.pagination?.totalPages || 1);
			}
		} catch (err) {
			console.error("Failed to fetch payments:", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchStats();
		fetchPayments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Debounced search
	function handleSearch() {
		if (searchTimeout.current) clearTimeout(searchTimeout.current);
		searchTimeout.current = setTimeout(() => {
			queryRef.current.page = 1;
			setCurrentPage(1);
			fetchPayments();
		}, 300);
	}

	function handleFilter(value: string) {
		queryRef.current.status = value;
		queryRef.current.page = 1;
		setCurrentPage(1);
		fetchPayments();
	}

	function handlePageChange(page: number) {
		queryRef.current.page = page;
		setCurrentPage(page);
		fetchPayments();
	}

	function openDetail(payment: Payment) {
		setActivePayment(payment);
		setIsDetailModalOpen(true);
	}

	function printReceipt(payment: Payment) {
		if (typeof window === "undefined") return;
		const win = window.open("", "_blank");
		if (!win) return;
		const paidDate = payment.paidAt
			? new Date(payment.paidAt).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })
			: "N/A";
		win.document.write(`<!DOCTYPE html><html><head><title>Receipt - ${payment.receiptNumber}</title><style>
			body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;padding:40px;color:#1a1a1a}
			.receipt{position:relative;overflow:hidden;max-width:600px;margin:0 auto;border:2px solid #166534;border-radius:12px;padding:32px}
			.watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);display:flex;flex-direction:column;align-items:center;gap:6px;color:#166534;opacity:0.07;pointer-events:none;white-space:nowrap;z-index:0}
			.watermark-logo{width:64px;height:64px;object-fit:contain}
			.watermark .wm-title{font-size:38px;font-weight:900;letter-spacing:6px}
			.watermark .wm-ref{font-size:16px;font-weight:700;letter-spacing:2px}
			.header{position:relative;z-index:1;text-align:center;border-bottom:2px solid #166534;padding-bottom:20px;margin-bottom:24px}
			.header h1{margin:0;font-size:22px;color:#166534}.header p{margin:4px 0 0;color:#666;font-size:13px}
			.badge{display:inline-block;background:#dcfce7;color:#166534;padding:4px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-top:8px}
			.info{position:relative;z-index:1;margin:20px 0}.info-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}
			.info-label{font-size:13px;color:#666}.info-value{font-size:13px;font-weight:600;text-align:right}
			.amount{position:relative;z-index:1;text-align:center;margin:24px 0;padding:20px;background:#f0fdf4;border-radius:8px}
			.amount h2{margin:0;color:#166534;font-size:28px}.amount p{margin:4px 0 0;color:#666;font-size:12px}
			.footer{position:relative;z-index:1;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#999}
			@media print{body{padding:20px}.receipt{border:2px solid #166534}}
		</style></head><body><div class="receipt">
			<div class="watermark">
				<img src="${window.location.origin}/favicon.png" alt="" class="watermark-logo" />
				<span class="wm-title">MSSN OAU</span>
				<span class="wm-ref">${payment.receiptNumber}</span>
			</div>
			<div class="header"><h1>MSSN OAU</h1><p>Muslim Students' Society of Nigeria, OAU Branch</p><div class="badge">&#10003; Payment Confirmed</div></div>
			<div class="amount"><h2>&#8358;${Number(payment.amount).toLocaleString()}</h2><p>Annual Dues - ${payment.sessionName}</p></div>
			<div class="info">
				<div class="info-row"><span class="info-label">Receipt Number</span><span class="info-value">${payment.receiptNumber}</span></div>
				<div class="info-row"><span class="info-label">Payment ID</span><span class="info-value">${payment.id}</span></div>
				<div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${payment.fullName}</span></div>
				<div class="info-row"><span class="info-label">Email</span><span class="info-value">${payment.email}</span></div>
				<div class="info-row"><span class="info-label">Department</span><span class="info-value">${payment.department}</span></div>
				<div class="info-row"><span class="info-label">Faculty</span><span class="info-value">${payment.faculty}</span></div>
				<div class="info-row"><span class="info-label">Level</span><span class="info-value">${payment.level}</span></div>
				<div class="info-row"><span class="info-label">Amount Paid</span><span class="info-value">&#8358;${Number(payment.amount).toLocaleString()}</span></div>
				<div class="info-row"><span class="info-label">Payment Date</span><span class="info-value">${paidDate}</span></div>
				<div class="info-row"><span class="info-label">Reference</span><span class="info-value">${payment.paymentReference}</span></div>
				<div class="info-row"><span class="info-label">Status</span><span class="info-value">${payment.status}</span></div>
			</div>
			<div class="footer"><p>This is a computer-generated receipt. No signature required.</p><p>MSSN OAU &bull; ${new Date().getFullYear()}</p></div>
		</div></body></html>`);
		win.document.close();
		win.focus();
		setTimeout(() => win.print(), 500);
	}

	function handleDelete(payment: Payment) {
		setConfirmState({
			open: true,
			title: "Delete Payment?",
			message: `Delete payment for ${payment.fullName} (${payment.receiptNumber})? This cannot be undone.`,
			action: async () => {
				try {
					const res = await fetch(`${API_BASE}/public/annual-dues/admin/payments/${payment.id}`, {
						method: "DELETE",
					});
					const json = await res.json();
					if (json.success) {
						toast("success", "Payment deleted successfully");
						if (activePayment?.id === payment.id) setIsDetailModalOpen(false);
						fetchPayments();
						fetchStats();
					} else {
						toast("error", json.error || "Failed to delete payment");
					}
				} catch (err) {
					console.error("Failed to delete payment:", err);
					toast("error", "Failed to delete payment");
				}
			},
		});
	}

	function exportCSV() {
		if (typeof document === "undefined") return;
		if (payments.length === 0) {
			toast("error", "No data to export");
			return;
		}
		const headers = [
			"Receipt Number",
			"Full Name",
			"Email",
			"Department",
			"Faculty",
			"Level",
			"Amount",
			"Session",
			"Status",
			"Payment Reference",
			"Paid At",
			"Created At",
		];
		const rows = payments.map((p) => [
			p.receiptNumber,
			p.fullName,
			p.email,
			p.department,
			p.faculty,
			p.level,
			p.amount,
			p.sessionName,
			p.status,
			p.paymentReference,
			p.paidAt || "",
			p.createdAt,
		]);
		const csv = [headers, ...rows]
			.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
			.join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `annual-dues-payments-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast("success", "CSV exported successfully");
	}

	function getStatusIcon(status: string): LucideIcon {
		switch (status) {
			case "COMPLETED":
				return CheckCircle2;
			case "PENDING":
				return Clock;
			case "FAILED":
			case "CANCELLED":
				return XCircle;
			default:
				return Clock;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case "COMPLETED":
				return "bg-green-100 text-green-800 border-green-200";
			case "PENDING":
				return "bg-amber-100 text-amber-800 border-amber-200";
			case "FAILED":
				return "bg-red-100 text-red-800 border-red-200";
			case "CANCELLED":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	}

	const DetailStatusIcon = activePayment ? getStatusIcon(activePayment.status) : null;

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<CreditCard className="w-7 h-7 text-green-700" />
							Annual Dues Payments
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">
							View and manage all annual dues payment records &bull; {stats.sessionName}
						</p>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={exportCSV}
							className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
						>
							<Download className="w-4 h-4 text-gray-500" />
							<span className="hidden sm:inline">Export CSV</span>
						</button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
								<Users className="w-5 h-5 text-green-700" />
							</div>
							<div>
								<p className="text-[11px] text-gray-500">Total Payments</p>
								<p className="text-lg font-bold text-gray-900">{stats.total}</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
								<CheckCircle2 className="w-5 h-5 text-green-700" />
							</div>
							<div>
								<p className="text-[11px] text-gray-500">Completed</p>
								<p className="text-lg font-bold text-green-700">{stats.completed}</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
								<Clock className="w-5 h-5 text-amber-700" />
							</div>
							<div>
								<p className="text-[11px] text-gray-500">Pending</p>
								<p className="text-lg font-bold text-amber-700">{stats.pending}</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
								<Coins className="w-5 h-5 text-green-700" />
							</div>
							<div>
								<p className="text-[11px] text-gray-500">Total Revenue</p>
								<p className="text-lg font-bold text-green-700">₦{stats.totalAmount.toLocaleString()}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Search + Filter */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
						<input
							type="text"
							placeholder="Search by name, email, department, receipt no..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								queryRef.current.search = e.target.value;
								handleSearch();
							}}
							className="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value);
							handleFilter(e.target.value);
						}}
						className="bg-white border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					>
						<option value="">All Status</option>
						<option value="COMPLETED">Completed</option>
						<option value="PENDING">Pending</option>
						<option value="FAILED">Failed</option>
						<option value="CANCELLED">Cancelled</option>
					</select>
				</div>

				{/* Payments Table */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="w-8 h-8 text-green-600 animate-spin" />
					</div>
				) : payments.length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<CreditCard className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No Payments Found</h3>
						<p className="text-xs text-gray-500">No payments match your search criteria.</p>
					</div>
				) : (
					<div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-xs">
								<thead>
									<tr className="bg-gray-50 border-b border-gray-200">
										<th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
										<th className="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
										<th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
											Faculty
										</th>
										<th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
											Level
										</th>
										<th className="text-left px-4 py-3 font-semibold text-gray-600">Receipt</th>
										<th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
										<th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
											Date
										</th>
										<th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
									</tr>
								</thead>
								<tbody>
									{payments.map((payment) => {
										const StatusIcon = getStatusIcon(payment.status);
										return (
											<tr
												key={payment.id}
												className="border-b border-gray-50 hover:bg-green-50/30 transition-colors"
											>
												<td className="px-4 py-3">
													<div>
														<p className="font-semibold text-gray-900">{payment.fullName}</p>
														<p className="text-[10px] text-gray-500">{payment.email}</p>
													</div>
												</td>
												<td className="px-4 py-3 text-gray-700">{payment.department}</td>
												<td className="px-4 py-3 text-gray-700 hidden md:table-cell">
													{payment.faculty}
												</td>
												<td className="px-4 py-3 text-gray-700 hidden lg:table-cell">
													{payment.level}
												</td>
												<td className="px-4 py-3 font-mono text-gray-600">{payment.receiptNumber}</td>
												<td className="px-4 py-3">
													<span
														className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(payment.status)}`}
													>
														<StatusIcon className="w-3 h-3" />
														{payment.status}
													</span>
												</td>
												<td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
													{payment.paidAt
														? new Date(payment.paidAt).toLocaleDateString("en-NG", {
																dateStyle: "medium",
															})
														: payment.createdAt
															? new Date(payment.createdAt).toLocaleDateString("en-NG", {
																	dateStyle: "medium",
																})
															: "N/A"}
												</td>
												<td className="px-4 py-3 text-right">
													<div className="flex items-center justify-end gap-1">
														<button
															type="button"
															onClick={() => openDetail(payment)}
															className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
															title="View Details"
														>
															<Eye className="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onClick={() => printReceipt(payment)}
															className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
															title="Print Receipt"
														>
															<Printer className="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onClick={() => handleDelete(payment)}
															className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
															title="Delete Payment"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalPages > 1 ? (
							<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
								<p className="text-[11px] text-gray-500">
									Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of{" "}
									{totalCount}
								</p>
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
										className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
									>
										<ChevronLeft className="w-4 h-4" />
									</button>
									{Array.from({ length: totalPages }, (_, i) => i).map((i) => {
										const page = i + 1;
										if (
											page === currentPage ||
											(page >= currentPage - 1 && page <= currentPage + 1)
										) {
											return (
												<button
													type="button"
													key={page}
													onClick={() => handlePageChange(page)}
													className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors ${
														page === currentPage
															? "bg-green-700 text-white"
															: "text-gray-600 hover:bg-gray-100"
													}`}
												>
													{page}
												</button>
											);
										}
										if (page === currentPage - 2 || page === currentPage + 2) {
											return (
												<span key={page} className="text-gray-400 text-[11px]">
													...
												</span>
											);
										}
										return null;
									})}
									<button
										type="button"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
									>
										<ChevronRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						) : null}
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{isDetailModalOpen && activePayment && DetailStatusIcon ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">{activePayment.fullName}</h3>
								<p className="text-[11px] text-gray-500">{activePayment.email}</p>
							</div>
							<button
								type="button"
								onClick={() => setIsDetailModalOpen(false)}
								className="text-gray-400 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Status + Amount */}
						<div className="flex items-center justify-between bg-green-50 rounded-xl p-4 border border-green-100">
							<div>
								<p className="text-2xl font-bold text-green-800">
									₦{Number(activePayment.amount).toLocaleString()}
								</p>
								<p className="text-[11px] text-green-600">{activePayment.sessionName} Session</p>
							</div>
							<span
								className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(activePayment.status)}`}
							>
								<DetailStatusIcon className="w-3.5 h-3.5" />
								{activePayment.status}
							</span>
						</div>

						{/* Student Info */}
						<div className="space-y-2">
							<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
								Student Information
							</h4>
							<div className="grid grid-cols-2 gap-2">
								<div className="bg-gray-50 rounded-lg p-3">
									<p className="text-[10px] text-gray-500">Department</p>
									<p className="text-xs font-semibold text-gray-900">{activePayment.department}</p>
								</div>
								<div className="bg-gray-50 rounded-lg p-3">
									<p className="text-[10px] text-gray-500">Faculty</p>
									<p className="text-xs font-semibold text-gray-900">{activePayment.faculty}</p>
								</div>
								<div className="bg-gray-50 rounded-lg p-3">
									<p className="text-[10px] text-gray-500">Level</p>
									<p className="text-xs font-semibold text-gray-900">{activePayment.level}</p>
								</div>
								<div className="bg-gray-50 rounded-lg p-3">
									<p className="text-[10px] text-gray-500">Receipt No.</p>
									<p className="text-xs font-semibold text-gray-900 font-mono">
										{activePayment.receiptNumber}
									</p>
								</div>
							</div>
						</div>

						{/* Payment Info */}
						<div className="space-y-2">
							<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
								Payment Details
							</h4>
							<div className="space-y-1.5">
								<div className="flex justify-between py-1.5 border-b border-gray-100">
									<span className="text-[11px] text-gray-500">Payment ID</span>
									<span className="text-[11px] font-semibold text-gray-900 font-mono">
										{activePayment.id}
									</span>
								</div>
								<div className="flex justify-between py-1.5 border-b border-gray-100">
									<span className="text-[11px] text-gray-500">Reference</span>
									<span className="text-[11px] font-semibold text-gray-900 font-mono">
										{activePayment.paymentReference}
									</span>
								</div>
								<div className="flex justify-between py-1.5 border-b border-gray-100">
									<span className="text-[11px] text-gray-500">Paid At</span>
									<span className="text-[11px] font-semibold text-gray-900">
										{activePayment.paidAt
											? new Date(activePayment.paidAt).toLocaleString("en-NG", {
													dateStyle: "medium",
													timeStyle: "short",
												})
											: "N/A"}
									</span>
								</div>
								<div className="flex justify-between py-1.5">
									<span className="text-[11px] text-gray-500">Created</span>
										<span className="text-[11px] font-semibold text-gray-900">
											{activePayment.createdAt
												? new Date(activePayment.createdAt).toLocaleString("en-NG", {
														dateStyle: "medium",
														timeStyle: "short",
													})
												: "N/A"}
										</span>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<button
								type="button"
								onClick={() => handleDelete(activePayment)}
								className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<Trash2 className="w-3.5 h-3.5" /> Delete
							</button>
							<button
								type="button"
								onClick={() => printReceipt(activePayment)}
								className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
							>
								<Printer className="w-3.5 h-3.5" /> Print Receipt
							</button>
							<div className="flex-1" />
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
