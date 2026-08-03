<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
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
		FileText,
		Building2,
		GraduationCap,
		Mail,
		User,
		Trash2
	} from '@lucide/svelte';

	const API_BASE = 'http://localhost:3000';

	let payments = $state<any[]>([]);
	let stats = $state({ total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0, amount: 0, sessionName: '' });
	let loading = $state(false);
	let searchQuery = $state('');
	let statusFilter = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalCount = $state(0);

	// Detail modal
	let isDetailModalOpen = $state(false);
	let activePayment = $state<any>(null);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	async function fetchStats() {
		try {
			const res = await fetch(`${API_BASE}/public/annual-dues/admin/stats`);
			const json = await res.json();
			if (json.success) stats = json.data;
		} catch (err) {
			console.error('Failed to fetch stats:', err);
		}
	}

	async function fetchPayments() {
		loading = true;
		try {
			const params = new URLSearchParams();
			params.set('page', String(currentPage));
			params.set('limit', '20');
			if (searchQuery.trim()) params.set('search', searchQuery.trim());
			if (statusFilter) params.set('status', statusFilter);

			const res = await fetch(`${API_BASE}/public/annual-dues/admin/payments?${params}`);
			const json = await res.json();
			if (json.success) {
				payments = json.data;
				totalCount = json.meta?.pagination?.total || 0;
				totalPages = json.meta?.pagination?.totalPages || 1;
			}
		} catch (err) {
			console.error('Failed to fetch payments:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchStats();
		fetchPayments();
	});

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			currentPage = 1;
			fetchPayments();
		}, 300);
	}

	function handleFilter() {
		currentPage = 1;
		fetchPayments();
	}

	function handlePageChange(page: number) {
		currentPage = page;
		fetchPayments();
	}

	function openDetail(payment: any) {
		activePayment = payment;
		isDetailModalOpen = true;
	}

	function printReceipt(payment: any) {
		const win = window.open('', '_blank');
		if (!win) return;
		const paidDate = payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
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

	async function handleDelete(payment: any) {
		confirmState = {
			open: true,
			title: 'Delete Payment?',
			message: `Delete payment for ${payment.fullName} (${payment.receiptNumber})? This cannot be undone.`,
			action: async () => {
				try {
					const res = await fetch(`${API_BASE}/public/annual-dues/admin/payments/${payment.id}`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						toast('success', 'Payment deleted successfully');
						if (activePayment?.id === payment.id) isDetailModalOpen = false;
						fetchPayments();
						fetchStats();
					} else {
						toast('error', json.error || 'Failed to delete payment');
					}
				} catch (err) {
					console.error('Failed to delete payment:', err);
					toast('error', 'Failed to delete payment');
				}
			}
		};
	}

	function exportCSV() {
		if (payments.length === 0) {
			toast('error', 'No data to export');
			return;
		}
		const headers = ['Receipt Number', 'Full Name', 'Email', 'Department', 'Faculty', 'Level', 'Amount', 'Session', 'Status', 'Payment Reference', 'Paid At', 'Created At'];
		const rows = payments.map(p => [
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
			p.paidAt || '',
			p.createdAt
		]);
		const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `annual-dues-payments-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast('success', 'CSV exported successfully');
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'COMPLETED': return CheckCircle2;
			case 'PENDING': return Clock;
			case 'FAILED':
			case 'CANCELLED': return XCircle;
			default: return Clock;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
			case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
			case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
			case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}
</script>

<svelte:head>
	<title>Annual Dues Payments | MSSN OAU Admin</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<CreditCard class="w-7 h-7 text-green-700" />
				Annual Dues Payments
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">
				View and manage all annual dues payment records &bull; {stats.sessionName}
			</p>
		</div>
		<div class="flex gap-2">
			<button onclick={exportCSV}
				class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
				<Download class="w-4 h-4 text-gray-500" /><span class="hidden sm:inline">Export CSV</span>
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Users class="w-5 h-5 text-green-700" /></div>
				<div>
					<p class="text-[11px] text-gray-500">Total Payments</p>
					<p class="text-lg font-bold text-gray-900">{stats.total}</p>
				</div>
			</div>
		</div>
		<div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle2 class="w-5 h-5 text-green-700" /></div>
				<div>
					<p class="text-[11px] text-gray-500">Completed</p>
					<p class="text-lg font-bold text-green-700">{stats.completed}</p>
				</div>
			</div>
		</div>
		<div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Clock class="w-5 h-5 text-amber-700" /></div>
				<div>
					<p class="text-[11px] text-gray-500">Pending</p>
					<p class="text-lg font-bold text-amber-700">{stats.pending}</p>
				</div>
			</div>
		</div>
		<div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Coins class="w-5 h-5 text-green-700" /></div>
				<div>
					<p class="text-[11px] text-gray-500">Total Revenue</p>
					<p class="text-lg font-bold text-green-700">&#8358;{stats.totalAmount.toLocaleString()}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Search + Filter -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
			<input type="text" placeholder="Search by name, email, department, receipt no..."
				bind:value={searchQuery}
				oninput={handleSearch}
				class="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
		</div>
		<select bind:value={statusFilter} onchange={handleFilter}
			class="bg-white border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600">
			<option value="">All Status</option>
			<option value="COMPLETED">Completed</option>
			<option value="PENDING">Pending</option>
			<option value="FAILED">Failed</option>
			<option value="CANCELLED">Cancelled</option>
		</select>
	</div>

	<!-- Payments Table -->
	{#if loading}
		<div class="flex items-center justify-center py-16">
			<Loader2 class="w-8 h-8 text-green-600 animate-spin" />
		</div>
	{:else if payments.length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><CreditCard class="w-6 h-6" /></div>
			<h3 class="text-base font-semibold text-green-950">No Payments Found</h3>
			<p class="text-xs text-gray-500">No payments match your search criteria.</p>
		</div>
	{:else}
		<div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-xs">
					<thead>
						<tr class="bg-gray-50 border-b border-gray-200">
							<th class="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
							<th class="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
							<th class="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Faculty</th>
							<th class="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Level</th>
							<th class="text-left px-4 py-3 font-semibold text-gray-600">Receipt</th>
							<th class="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
							<th class="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
							<th class="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each payments as payment (payment.id)}
							{@const StatusIcon = getStatusIcon(payment.status)}
							<tr class="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
								<td class="px-4 py-3">
									<div>
										<p class="font-semibold text-gray-900">{payment.fullName}</p>
										<p class="text-[10px] text-gray-500">{payment.email}</p>
									</div>
								</td>
								<td class="px-4 py-3 text-gray-700">{payment.department}</td>
								<td class="px-4 py-3 text-gray-700 hidden md:table-cell">{payment.faculty}</td>
								<td class="px-4 py-3 text-gray-700 hidden lg:table-cell">{payment.level}</td>
								<td class="px-4 py-3 font-mono text-gray-600">{payment.receiptNumber}</td>
								<td class="px-4 py-3">
									<span class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(payment.status)}`}>
										<StatusIcon class="w-3 h-3" />
										{payment.status}
									</span>
								</td>
								<td class="px-4 py-3 text-gray-500 hidden lg:table-cell">
									{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : 'N/A'}
								</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-1">
										<button onclick={() => openDetail(payment)} class="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors" title="View Details">
											<Eye class="w-3.5 h-3.5" />
										</button>
										<button onclick={() => printReceipt(payment)} class="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Print Receipt">
											<Printer class="w-3.5 h-3.5" />
										</button>
										<button onclick={() => handleDelete(payment)} class="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors" title="Delete Payment">
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
					<p class="text-[11px] text-gray-500">
						Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount}
					</p>
					<div class="flex items-center gap-1">
						<button onclick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
							class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
							<ChevronLeft class="w-4 h-4" />
						</button>
						{#each Array(totalPages) as _, i}
							{#if i + 1 === currentPage || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
								<button onclick={() => handlePageChange(i + 1)}
									class={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors ${i + 1 === currentPage ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
									{i + 1}
								</button>
							{:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
								<span class="text-gray-400 text-[11px]">...</span>
							{/if}
						{/each}
						<button onclick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
							class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
							<ChevronRight class="w-4 h-4" />
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Detail Modal -->
{#if isDetailModalOpen && activePayment}
	{@const StatusIcon = getStatusIcon(activePayment.status)}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activePayment.fullName}</h3>
					<p class="text-[11px] text-gray-500">{activePayment.email}</p>
				</div>
				<button onclick={() => (isDetailModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			<!-- Status + Amount -->
			<div class="flex items-center justify-between bg-green-50 rounded-xl p-4 border border-green-100">
				<div>
					<p class="text-2xl font-bold text-green-800">&#8358;{Number(activePayment.amount).toLocaleString()}</p>
					<p class="text-[11px] text-green-600">{activePayment.sessionName} Session</p>
				</div>
				<span class={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(activePayment.status)}`}>
					<StatusIcon class="w-3.5 h-3.5" />
					{activePayment.status}
				</span>
			</div>

			<!-- Student Info -->
			<div class="space-y-2">
				<h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Student Information</h4>
				<div class="grid grid-cols-2 gap-2">
					<div class="bg-gray-50 rounded-lg p-3">
						<p class="text-[10px] text-gray-500">Department</p>
						<p class="text-xs font-semibold text-gray-900">{activePayment.department}</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-3">
						<p class="text-[10px] text-gray-500">Faculty</p>
						<p class="text-xs font-semibold text-gray-900">{activePayment.faculty}</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-3">
						<p class="text-[10px] text-gray-500">Level</p>
						<p class="text-xs font-semibold text-gray-900">{activePayment.level}</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-3">
						<p class="text-[10px] text-gray-500">Receipt No.</p>
						<p class="text-xs font-semibold text-gray-900 font-mono">{activePayment.receiptNumber}</p>
					</div>
				</div>
			</div>

			<!-- Payment Info -->
			<div class="space-y-2">
				<h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment Details</h4>
				<div class="space-y-1.5">
					<div class="flex justify-between py-1.5 border-b border-gray-100">
						<span class="text-[11px] text-gray-500">Payment ID</span>
						<span class="text-[11px] font-semibold text-gray-900 font-mono">{activePayment.id}</span>
					</div>
					<div class="flex justify-between py-1.5 border-b border-gray-100">
						<span class="text-[11px] text-gray-500">Reference</span>
						<span class="text-[11px] font-semibold text-gray-900 font-mono">{activePayment.paymentReference}</span>
					</div>
					<div class="flex justify-between py-1.5 border-b border-gray-100">
						<span class="text-[11px] text-gray-500">Paid At</span>
						<span class="text-[11px] font-semibold text-gray-900">
							{activePayment.paidAt ? new Date(activePayment.paidAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
						</span>
					</div>
					<div class="flex justify-between py-1.5">
						<span class="text-[11px] text-gray-500">Created</span>
						<span class="text-[11px] font-semibold text-gray-900">
							{new Date(activePayment.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
						</span>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={() => handleDelete(activePayment)}
					class="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
					<Trash2 class="w-3.5 h-3.5" /> Delete
				</button>
				<button onclick={() => printReceipt(activePayment)}
					class="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
					<Printer class="w-3.5 h-3.5" /> Print Receipt
				</button>
				<div class="flex-1"></div>
				<button onclick={() => (isDetailModalOpen = false)}
					class="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Confirm Dialog -->
<ConfirmDialog
	open={confirmState?.open ?? false}
	title={confirmState?.title ?? 'Are you sure?'}
	message={confirmState?.message ?? ''}
	confirmLabel="Yes, Delete"
	cancelLabel="No, Cancel"
	onconfirm={() => {
		const action = confirmState?.action;
		confirmState = null;
		action?.();
	}}
	oncancel={() => {
		confirmState = null;
	}}
/>
