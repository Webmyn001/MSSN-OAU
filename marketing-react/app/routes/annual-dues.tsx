import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	CreditCard,
	Download,
	Printer,
	Loader2,
	User,
	GraduationCap,
	Mail,
	FileText,
	CheckCircle2,
} from "lucide-react";
import { Seo } from "~/components/seo";
import { ResponsiveModal } from "~/components/layout/ResponsiveModal";
import { API_BASE } from "~/lib/api/base";
import { SITE_URL } from "~/lib/config";

const faculties = [
	"Faculty of Administration",
	"Faculty of Agriculture",
	"Faculty of Arts",
	"Faculty of Education",
	"Faculty of Environmental Design & Management",
	"Faculty of Law",
	"Faculty of Medicine",
	"Faculty of Pharmacy",
	"Faculty of Science",
	"Faculty of Social Sciences",
	"Faculty of Technology",
];

const levels = [
	"100 Level",
	"200 Level",
	"300 Level",
	"400 Level",
	"500 Level",
	"600 Level",
	"Postgraduate",
];

const printStyles = `
@media print {
	.no-print { display: none !important; }
	section { display: none !important; }
	.print-only { display: block; }
	.print-receipt {
		max-width: 600px; margin: 0 auto; padding: 32px;
		font-family: 'Segoe UI', Tahoma, sans-serif; color: #1a1a1a;
		border: 2px solid #166534; border-radius: 12px;
		position: relative; overflow: hidden;
	}
	.print-watermark {
		position: absolute; top: 50%; left: 50%;
		transform: translate(-50%, -50%) rotate(-30deg);
		display: flex; flex-direction: column; align-items: center; gap: 6px;
		color: #166534; opacity: 0.07; white-space: nowrap; pointer-events: none;
		z-index: 0; font-weight: 900; font-size: 38px; letter-spacing: 6px;
	}
	.print-watermark-logo { width: 64px; height: 64px; object-fit: contain; }
	.print-watermark span:last-child { font-size: 16px; letter-spacing: 2px; }
	.print-header { position: relative; z-index: 1; text-align: center; border-bottom: 2px solid #166534; padding-bottom: 16px; margin-bottom: 20px; }
	.print-header h1 { margin: 0; font-size: 22px; color: #166534; }
	.print-header p { margin: 4px 0 0; color: #666; font-size: 12px; }
	.print-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
	.print-amount { position: relative; z-index: 1; text-align: center; padding: 16px; background: #f0fdf4; border-radius: 8px; margin-bottom: 20px; }
	.print-amount h2 { margin: 0; color: #166534; font-size: 28px; }
	.print-amount p { margin: 4px 0 0; color: #666; font-size: 12px; }
	.print-info { position: relative; z-index: 1; margin: 16px 0; }
	.print-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
	.print-row span:first-child { color: #666; }
	.print-row span:last-child { font-weight: 600; text-align: right; }
	.print-footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; }
}
.print-only { display: none; }
`;

type Step = "form" | "processing" | "pending" | "receipt";

interface Receipt {
	amount: number;
	sessionName: string;
	receiptNumber: string;
	id: string;
	fullName: string;
	email: string;
	department: string;
	faculty: string;
	level: string;
	paidAt?: string;
	paymentReference: string;
	status: string;
}

export default function AnnualDuesPage() {
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<Step>("form");

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [department, setDepartment] = useState("");
	const [faculty, setFaculty] = useState("");
	const [level, setLevel] = useState("");

	const [receipt, setReceipt] = useState<Receipt | null>(null);
	const [showReceiptModal, setShowReceiptModal] = useState(false);
	const [paymentReference, setPaymentReference] = useState("");
	const [, setPaymentId] = useState("");

	const [currentSession, setCurrentSession] = useState("");
	const [duesAmount, setDuesAmount] = useState(0);

	useEffect(() => {
		void loadConfig();
	}, []);

	async function loadConfig() {
		try {
			const cfgRes = await fetch(`${API_BASE}/public/annual-dues/config`);
			const cfg = await cfgRes.json();
			if (cfg.success) {
				setDuesAmount(Number(cfg.data.amount) || 0);
				setCurrentSession(cfg.data.sessionName || "");
			}
		} catch {
			// Paystack will show an error if the key is missing
		}
	}

	async function loadPaystack(): Promise<boolean> {
		await loadConfig();
		if ((window as any).PaystackPop) return true;
		return new Promise((resolve) => {
			const s = document.createElement("script");
			s.src = "https://js.paystack.co/v2/inline.js";
			s.onload = () => resolve(true);
			document.head.appendChild(s);
		});
	}

	function validateForm() {
		if (!fullName.trim()) {
			toast.error("Please enter your full name");
			return false;
		}
		if (!email.trim() || !email.includes("@")) {
			toast.error("Please enter a valid email address");
			return false;
		}
		if (!department.trim()) {
			toast.error("Please enter your department");
			return false;
		}
		if (!faculty.trim()) {
			toast.error("Please enter your faculty");
			return false;
		}
		if (!level.trim()) {
			toast.error("Please enter your level");
			return false;
		}
		return true;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		setLoading(true);
		setStep("processing");

		try {
			await loadPaystack();

			const res = await fetch(`${API_BASE}/public/annual-dues/initiate-payment`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fullName: fullName.trim(),
					email: email.trim(),
					department: department.trim(),
					faculty: faculty.trim(),
					level: level.trim(),
				}),
			});
			const json = await res.json();

			if (!json.success) {
				toast.error(json.error || "Could not initiate payment. Please try again.");
				setStep("form");
				setLoading(false);
				return;
			}

			const { accessCode } = json.data;
			setPaymentReference(json.data.paymentReference || "");
			setPaymentId(json.data.paymentId || "");

			const paystackWindow = window as any;
			const popup = new paystackWindow.PaystackPop();
			popup.checkout({
				accessCode,
				onSuccess: async (transaction: { reference: string }) => {
					try {
						const vRes = await fetch(
							`${API_BASE}/public/annual-dues/verify-payment?ref=${transaction.reference}`
						);
						const vJson = await vRes.json();

						if (vJson.success && vJson.data.paid) {
							setReceipt(vJson.data.payment);
							setStep("receipt");
							setShowReceiptModal(true);
							toast.success("Payment successful! Your receipt is ready.");
						} else if (vJson.success && vJson.data.status === "pending") {
							setStep("pending");
							toast.info(
								"Payment received, but confirmation is still in progress. Please check back shortly."
							);
						} else {
							toast.error("Payment failed. Please try again later.");
							setStep("form");
						}
					} catch {
						toast.error(
							"Payment done but verification failed. Your reference: " + transaction.reference
						);
						setStep("form");
					} finally {
						setLoading(false);
					}
				},
				onCancel: () => {
					toast.error("Payment was cancelled.");
					setStep("form");
					setLoading(false);
				},
				onError: (error: { message?: string }) => {
					console.error("Paystack checkout error", error);
					toast.error(error?.message || "Payment could not be loaded. Please try again.");
					setStep("form");
					setLoading(false);
				},
			});
		} catch {
			toast.error("Unable to initiate payment. Please try again.");
			setStep("form");
			setLoading(false);
		}
	}

	async function checkPayment() {
		try {
			const vRes = await fetch(
				`${API_BASE}/public/annual-dues/verify-payment?ref=${paymentReference}`
			);
			const vJson = await vRes.json();

			if (vJson.success && vJson.data.paid) {
				setReceipt(vJson.data.payment);
				setStep("receipt");
				setShowReceiptModal(true);
				toast.success("Payment successful! Your receipt is ready.");
			} else if (vJson.success && vJson.data.status === "pending") {
				toast.info(
					"Payment received, but confirmation is still in progress. Please check back shortly."
				);
			} else {
				toast.error("Payment failed. Please try again later.");
				setStep("form");
			}
		} catch {
			toast.error("Payment done but verification failed.");
			setStep("form");
		} finally {
			setLoading(false);
		}
	}

	function printReceipt() {
		setShowReceiptModal(false);
		setTimeout(() => window.print(), 100);
	}

	function generateReceiptHtml() {
		if (!receipt) return "";
		const paidDate = receipt.paidAt
			? new Date(receipt.paidAt).toLocaleString("en-NG", {
					dateStyle: "full",
					timeStyle: "short",
				})
			: "N/A";
		return `<!DOCTYPE html><html><head><title>Receipt - ${receipt.receiptNumber}</title><style>
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
				<span class="wm-ref">${receipt.receiptNumber}</span>
			</div>
			<div class="header"><h1>MSSN OAU</h1><p>Muslim Students' Society of Nigeria, OAU Branch</p><div class="badge">&#10003; Payment Confirmed</div></div>
			<div class="amount"><h2>&#8358;${Number(receipt.amount).toLocaleString()}</h2><p>Annual Dues - ${receipt.sessionName}</p></div>
			<div class="info">
				<div class="info-row"><span class="info-label">Receipt Number</span><span class="info-value">${receipt.receiptNumber}</span></div>
				<div class="info-row"><span class="info-label">Payment ID</span><span class="info-value">${receipt.id}</span></div>
				<div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${receipt.fullName}</span></div>
				<div class="info-row"><span class="info-label">Email</span><span class="info-value">${receipt.email}</span></div>
				<div class="info-row"><span class="info-label">Department</span><span class="info-value">${receipt.department}</span></div>
				<div class="info-row"><span class="info-label">Faculty</span><span class="info-value">${receipt.faculty}</span></div>
				<div class="info-row"><span class="info-label">Level</span><span class="info-value">${receipt.level}</span></div>
				<div class="info-row"><span class="info-label">Amount Paid</span><span class="info-value">&#8358;${Number(receipt.amount).toLocaleString()}</span></div>
				<div class="info-row"><span class="info-label">Payment Date</span><span class="info-value">${paidDate}</span></div>
				<div class="info-row"><span class="info-label">Reference</span><span class="info-value">${receipt.paymentReference}</span></div>
				<div class="info-row"><span class="info-label">Status</span><span class="info-value">${receipt.status}</span></div>
			</div>
			<div class="footer"><p>This is a computer-generated receipt. No signature required.</p><p>MSSN OAU &bull; ${new Date().getFullYear()}</p></div>
		</div></body></html>`;
	}

	function printReceiptHtml() {
		const win = window.open("", "_blank");
		if (!win) {
			toast.error("Could not open a new window. Please allow popups and try again.");
			return;
		}
		win.document.write(generateReceiptHtml());
		win.document.close();
		win.focus();
		setTimeout(() => win.print(), 500);
	}

	return (
		<>
			<Seo
				title="Pay Annual Dues"
				description="Pay your MSSN OAU annual dues securely online. Support the Muslim Students Society of Nigeria, Obafemi Awolowo University."
				path="/annual-dues"
				type="WebPage"
				images={[
					{ url: "https://i.ibb.co/zbWfh5B/home.webp", width: 1200, height: 640, alt: "MSSNOAU Annual Dues Page" },
				]}
				schema={{
					"@context": "https://schema.org",
					"@type": "WebPage",
					name: "Pay Annual Dues | MSSNOAU",
					description: "Pay your MSSN OAU annual dues securely online.",
					url: `${SITE_URL}/annual-dues`,
					publisher: { "@type": "Organization", name: "MSSNOAU" },
				}}
				keywords={[
					"mssnoau annual dues",
					"pay mssn oau dues",
					"support mssnoau",
					"muslim students oau finance",
				]}
			/>

			<style dangerouslySetInnerHTML={{ __html: printStyles }} />

			<div className="print-only">
				{receipt ? (
					<div className="print-receipt">
						<div className="print-watermark">
							<img src="/favicon.png" alt="" className="print-watermark-logo" />
							<span>MSSN OAU</span>
							<span>{receipt.receiptNumber}</span>
						</div>
						<div className="print-header">
							<h1>MSSN OAU</h1>
							<p>Muslim Students&apos; Society of Nigeria, OAU Branch</p>
							<span className="print-badge">&#10003; Payment Confirmed</span>
						</div>
						<div className="print-amount">
							<h2>&#8358;{Number(receipt.amount).toLocaleString()}</h2>
							<p>Annual Dues - {receipt.sessionName}</p>
						</div>
						<div className="print-info">
							<div className="print-row">
								<span>Receipt Number</span>
								<span>{receipt.receiptNumber}</span>
							</div>
							<div className="print-row">
								<span>Payment ID</span>
								<span>{receipt.id}</span>
							</div>
							<div className="print-row">
								<span>Full Name</span>
								<span>{receipt.fullName}</span>
							</div>
							<div className="print-row">
								<span>Email</span>
								<span>{receipt.email}</span>
							</div>
							<div className="print-row">
								<span>Department</span>
								<span>{receipt.department}</span>
							</div>
							<div className="print-row">
								<span>Faculty</span>
								<span>{receipt.faculty}</span>
							</div>
							<div className="print-row">
								<span>Level</span>
								<span>{receipt.level}</span>
							</div>
							<div className="print-row">
								<span>Amount Paid</span>
								<span>&#8358;{Number(receipt.amount).toLocaleString()}</span>
							</div>
							<div className="print-row">
								<span>Payment Date</span>
								<span>
									{receipt.paidAt
										? new Date(receipt.paidAt).toLocaleString("en-NG", {
												dateStyle: "full",
												timeStyle: "short",
											})
										: "N/A"}
								</span>
							</div>
							<div className="print-row">
								<span>Reference</span>
								<span>{receipt.paymentReference}</span>
							</div>
							<div className="print-row">
								<span>Status</span>
								<span>{receipt.status}</span>
							</div>
						</div>
						<div className="print-footer">
							<p>This is a computer-generated receipt. No signature required.</p>
						</div>
					</div>
				) : null}
			</div>

			<section className="py-12 md:py-24 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

				<div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto relative z-10">
					<div className="w-full justify-start items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
						<div className="animate-fade-in w-full justify-center items-start gap-6 grid sm:grid-cols-2 grid-cols-1 lg:order-first order-last">
							<div className="pt-24 lg:justify-center sm:justify-end justify-start items-start gap-2.5 flex">
								<img
									className="rounded-xl object-cover shadow-lg border border-gray-100 transition-transform duration-500 hover:scale-105"
									src="/images/man_phone.webp"
									alt="Man with phone"
								/>
							</div>
							<img
								className="sm:ml-0 ml-auto rounded-xl object-cover shadow-lg border border-gray-100 transition-transform duration-500 hover:scale-105"
								src="/images/woman_laptop.webp"
								alt="Woman with Laptop"
							/>
						</div>

						<div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
							{step === "form" ? (
								<>
									<div className="w-full flex-col justify-center items-start gap-8 flex">
										<div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
											<h2 className="text-gray-900 text-4xl font-bold font-primary leading-normal lg:text-start text-center relative inline-block">
												Pay Annual Dues
												<span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-700 rounded-full"></span>
											</h2>
											<p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
												Every year, we are reminded of the incredible impact our collective
												efforts bring to the MSSNOAU community. Paying your annual dues is
												both a testament to and a result of the strength of our brotherhood.
											</p>
											<div className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20">
												&#8358;{duesAmount.toLocaleString()} &bull; {currentSession}
											</div>
										</div>
									</div>

									<form
										onSubmit={(e) => {
											e.preventDefault();
											void handleSubmit();
										}}
										className="w-full space-y-4"
									>
										<div>
											<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
												Full Name *
											</label>
											<div className="relative">
												<User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
												<input
													id="fullName"
													type="text"
													value={fullName}
													onChange={(e) => setFullName(e.target.value)}
													required
													placeholder="e.g. Abdulrozaq Taslim"
													className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
												Email Address *
											</label>
											<div className="relative">
												<Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
												<input
													id="email"
													type="email"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													required
													placeholder="you@example.com"
													className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
												Department *
											</label>
											<div className="relative">
												<FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
												<input
													id="department"
													type="text"
													value={department}
													onChange={(e) => setDepartment(e.target.value)}
													required
													placeholder="e.g. Computer Science"
													className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
												Faculty *
											</label>
											<div className="relative">
												<GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
												<select
													id="faculty"
													value={faculty}
													onChange={(e) => setFaculty(e.target.value)}
													required
													className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
												>
													<option value="">Select Faculty</option>
													{faculties.map((f) => (
														<option key={f} value={f}>
															{f}
														</option>
													))}
												</select>
											</div>
										</div>

										<div>
											<label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
												Level *
											</label>
											<div className="relative">
												<FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
												<select
													id="level"
													value={level}
													onChange={(e) => setLevel(e.target.value)}
													required
													className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
												>
													<option value="">Select Level</option>
													{levels.map((l) => (
														<option key={l} value={l}>
															{l}
														</option>
													))}
												</select>
											</div>
										</div>

										<button
											type="submit"
											disabled={loading}
											className="sm:w-fit w-full px-6 py-3 bg-primary-800 hover:bg-primary-800/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 justify-center items-center flex gap-2 text-white text-sm font-medium"
										>
											<CreditCard className="w-4 h-4" />
											Pay &#8358;{duesAmount.toLocaleString()}
										</button>
									</form>
								</>
							) : null}

							{step === "processing" ? (
								<div className="w-full text-center py-12 space-y-4 animate-fade-in">
									<Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
									<h3 className="text-lg font-semibold text-gray-900">Processing Payment...</h3>
									<p className="text-sm text-gray-500">
										Please complete the payment in the popup window.
									</p>
								</div>
							) : null}

							{step === "pending" ? (
								<div className="w-full text-center py-8 space-y-5 animate-fade-in border border-amber-200 bg-amber-50/50 rounded-2xl p-6">
									<Loader2 className="w-12 h-12 text-amber-600 mx-auto" />
									<h3 className="text-lg font-semibold text-gray-900">Awaiting Confirmation</h3>
									<p className="text-sm text-gray-500">
										Your payment was received and is being confirmed. This usually takes a
										moment. You can check the status below.
									</p>
									{paymentReference ? (
										<p className="text-xs text-gray-500">
											Reference:{" "}
											<span className="font-mono font-semibold text-gray-700">
												{paymentReference}
											</span>
										</p>
									) : null}
									<button
										type="button"
										onClick={() => {
											setLoading(true);
											void checkPayment();
										}}
										disabled={loading}
										className="inline-flex items-center gap-2 px-6 py-3 bg-primary-800 hover:bg-primary-800/90 disabled:opacity-50 transition-all rounded-xl shadow-md text-white text-sm font-medium"
									>
										{loading ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<CheckCircle2 className="w-4 h-4" />
										)}
										Check Payment Status
									</button>
								</div>
							) : null}

							{step === "receipt" && receipt ? (
								<div className="w-full space-y-6 animate-fade-in">
									<div className="text-center space-y-2">
										<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
											<CheckCircle2 className="w-8 h-8 text-green-600" />
										</div>
										<h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
										<p className="text-sm text-gray-500">
											Your annual dues payment has been confirmed.
										</p>
									</div>

									<div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
										<div className="bg-gradient-to-r from-green-800 to-green-900 text-white p-6 text-center">
											<h3 className="text-lg font-bold">MSSN OAU</h3>
											<p className="text-green-200 text-xs">Annual Dues Receipt</p>
											<span className="inline-block mt-2 bg-green-600/50 px-3 py-1 rounded-full text-xs font-medium">
												&#10003; Confirmed
											</span>
										</div>

										<div className="bg-green-50 p-4 text-center border-b border-green-100">
											<p className="text-3xl font-bold text-green-800">
												&#8358;{Number(receipt.amount).toLocaleString()}
											</p>
											<p className="text-xs text-green-600 mt-1">{receipt.sessionName} Session</p>
										</div>

										<div className="p-6 space-y-3">
											<div className="flex justify-between py-2 border-b border-gray-100">
												<span className="text-xs text-gray-500">Receipt Number</span>
												<span className="text-xs font-semibold text-gray-900">
													{receipt.receiptNumber}
												</span>
											</div>
											<div className="flex justify-between py-2 border-b border-gray-100">
												<span className="text-xs text-gray-500">Full Name</span>
												<span className="text-xs font-semibold text-gray-900">
													{receipt.fullName}
												</span>
											</div>
											<div className="flex justify-between py-2 border-b border-gray-100">
												<span className="text-xs text-gray-500">Email</span>
												<span className="text-xs font-semibold text-gray-900">{receipt.email}</span>
											</div>
											<div className="flex justify-between py-2 border-b border-gray-100">
												<span className="text-xs text-gray-500">Amount Paid</span>
												<span className="text-xs font-semibold text-gray-900">
													&#8358;{Number(receipt.amount).toLocaleString()}
												</span>
											</div>
											<div className="flex justify-between py-2">
												<span className="text-xs text-gray-500">Status</span>
												<span className="text-xs font-semibold text-green-700 uppercase">
													{receipt.status}
												</span>
											</div>
										</div>
									</div>

									<div className="flex flex-wrap gap-3">
										<button
											type="button"
											onClick={printReceiptHtml}
											className="inline-flex items-center gap-2 px-6 py-3 bg-primary-800 hover:bg-primary-800/90 transition-all rounded-xl shadow-md text-white text-sm font-medium"
										>
											<Download className="w-4 h-4" /> Download
										</button>
										<button
											type="button"
											onClick={printReceipt}
											className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 hover:bg-gray-50 transition-all rounded-xl text-gray-700 text-sm font-medium"
										>
											<Printer className="w-4 h-4" /> Print
										</button>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</section>

			<ResponsiveModal
				open={showReceiptModal}
				onOpenChange={setShowReceiptModal}
				title="Payment Successful"
				description="Your annual dues receipt is ready for download."
			>
				{receipt ? (
					<div className="space-y-4">
						<div className="bg-green-50 rounded-xl border border-green-100 p-5 text-center">
							<p className="text-3xl font-bold text-green-800">
								&#8358;{Number(receipt.amount).toLocaleString()}
							</p>
							<p className="text-xs text-green-600 mt-1">{receipt.sessionName} Session</p>
							<span className="inline-block mt-2 bg-green-600/10 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
								&#10003; Confirmed
							</span>
						</div>

						<div className="space-y-2 text-sm">
							<div className="flex justify-between py-2 border-b border-gray-100">
								<span className="text-xs text-gray-500">Receipt Number</span>
								<span className="text-xs font-semibold text-gray-900">
									{receipt.receiptNumber}
								</span>
							</div>
							<div className="flex justify-between py-2 border-b border-gray-100">
								<span className="text-xs text-gray-500">Payment ID</span>
								<span className="text-xs font-semibold text-gray-900 font-mono">
									{receipt.id}
								</span>
							</div>
							<div className="flex justify-between py-2 border-b border-gray-100">
								<span className="text-xs text-gray-500">Full Name</span>
								<span className="text-xs font-semibold text-gray-900">{receipt.fullName}</span>
							</div>
							<div className="flex justify-between py-2 border-b border-gray-100">
								<span className="text-xs text-gray-500">Payment Date</span>
								<span className="text-xs font-semibold text-gray-900">
									{receipt.paidAt
										? new Date(receipt.paidAt).toLocaleString("en-NG", {
												dateStyle: "medium",
												timeStyle: "short",
											})
										: "N/A"}
								</span>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<button
								type="button"
								onClick={printReceiptHtml}
								className="flex-1 px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
							>
								<Download className="w-4 h-4" /> Download PDF
							</button>
							<button
								type="button"
								onClick={printReceipt}
								className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
							>
								<Printer className="w-4 h-4" /> Print Receipt
							</button>
						</div>

						<button
							type="button"
							onClick={() => setShowReceiptModal(false)}
							className="w-full px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
						>
							Done
						</button>
					</div>
				) : null}
			</ResponsiveModal>
		</>
	);
}
