import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Loader2, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { verifyOTP, storeAuth, login } from "~/lib/stores/authStore";
import { toast } from "~/lib/stores/toast";

const patternUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3Cpath d='M30 10L50 30L30 50L10 30Z' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='4' fill='none' stroke='rgba(255,255,255,0.07)' stroke-width='1'/%3E%3C/svg%3E")`;

export default function OTPPage() {
	const navigate = useNavigate();
	const [email] = useState(() =>
		typeof window !== "undefined" ? sessionStorage.getItem("mssn_pending_email") || "" : ""
	);
	const [devOtp, setDevOtp] = useState(() =>
		typeof window !== "undefined" ? sessionStorage.getItem("mssn_otp_dev") || "" : ""
	);

	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [resending, setResending] = useState(false);
	const [retrying, setRetrying] = useState(false);
	const [secondsLeft, setSecondsLeft] = useState(60);
	const [resetKey, setResetKey] = useState(0);

	useEffect(() => {
		if (!email) navigate("/login", { replace: true });
	}, [email, navigate]);

	useEffect(() => {
		if (success) return;
		setSecondsLeft(60);
		const interval = setInterval(() => {
			setSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
		}, 1000);
		return () => clearInterval(interval);
	}, [success, resetKey]);

	function startCountdown() {
		setResetKey((k) => k + 1);
	}

	async function handleVerify(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setRetrying(false);
		try {
			const data = await verifyOTP(email, code, () => setRetrying(true));
			if (data.success) {
				storeAuth(data.data.token, data.data.user);
				sessionStorage.removeItem("mssn_pending_email");
				sessionStorage.removeItem("mssn_pending_password");
				sessionStorage.removeItem("mssn_otp_dev");
				setSuccess(true);
				setTimeout(() => navigate("/"), 800);
			} else {
				toast("error", data.error || "Invalid code");
			}
		} catch {
			toast("error", "The server is starting up. Please wait a moment and try again.");
		} finally {
			setLoading(false);
			setRetrying(false);
		}
	}

	async function handleResend() {
		if (resending) return;
		setResending(true);
		setRetrying(false);
		try {
			const password =
				typeof window !== "undefined" ? sessionStorage.getItem("mssn_pending_password") || "" : "";
			if (!email || !password) {
				toast("error", "Session expired. Please sign in again.");
				navigate("/login");
				return;
			}
			const data = await login(email, password, () => setRetrying(true));
			if (data.success) {
				setCode("");
				setDevOtp(data.data?.otp || "");
				sessionStorage.setItem("mssn_otp_dev", data.data?.otp || "");
				startCountdown();
				toast("success", "A new code has been sent to your email.");
			} else {
				toast("error", data.error || "Could not resend code. Please sign in again.");
				navigate("/login");
			}
		} catch {
			toast("error", "The server is starting up. Please wait a moment and try again.");
		} finally {
			setResending(false);
			setRetrying(false);
		}
	}

	return (
		<div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: "var(--font-primary)" }}>
			<div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 overflow-hidden py-10 px-6 text-center lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:py-0 lg:px-12">
				<div
					className="absolute inset-0"
					style={{ backgroundImage: patternUrl, backgroundSize: "60px 60px" }}
				/>
				<div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-transparent to-primary-950/80" />

				<div className="relative z-10 max-w-md mx-auto lg:text-center">
					<img
						src="/mssn-logo.webp"
						alt="MSSN OAU"
						className="h-14 lg:h-20 w-auto mx-auto mb-5 lg:mb-8 object-contain drop-shadow-2xl"
					/>
					<h2 className="text-xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2 lg:mb-4">
						Muslim Students' Society of Nigeria
					</h2>
					<p className="text-primary-200 text-sm lg:text-base leading-relaxed">
						Obafemi Awolowo University Branch — Admin Management Dashboard
					</p>
					<div className="mt-5 lg:mt-8 flex items-center justify-center gap-3">
						<div className="h-px w-10 lg:w-12 bg-primary-400/40" />
						<span className="text-primary-300 text-[10px] lg:text-xs font-semibold tracking-widest uppercase">
							Great Ifẹ̀
						</span>
						<div className="h-px w-10 lg:w-12 bg-primary-400/40" />
					</div>
				</div>
			</div>

			<div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-12 bg-gray-50">
				<div className="w-full max-w-md">
					<div className="mb-8">
						<h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verify your code</h2>
						<p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
							<Mail className="w-3.5 h-3.5" />
							<span>
								Code sent to <span className="font-medium text-gray-700">{email}</span>
							</span>
						</p>
					</div>

					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
						{success ? (
							<div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm mb-6">
								<ShieldCheck className="w-4 h-4 shrink-0" />
								<span>Authenticated! Redirecting...</span>
							</div>
						) : null}

						{devOtp ? (
							<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs mb-6">
								<strong>Dev mode:</strong> Your OTP is{" "}
								<code className="font-mono font-bold">{devOtp}</code>
							</div>
						) : null}

						<form onSubmit={handleVerify} className="space-y-6">
							<div>
								<label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
									6-Digit Code
								</label>
								<input
									id="otp"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength={6}
									required
									value={code}
									onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
									placeholder="000000"
									className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all"
								/>
								<p className="text-xs text-gray-400 text-center mt-2">
									Expires in{" "}
									<span
										className={`font-mono font-semibold ${
											secondsLeft <= 10 ? "text-red-500" : "text-gray-600"
										}`}
									>
										{secondsLeft}s
									</span>
								</p>
								{secondsLeft <= 0 ? (
									<p className="text-xs text-red-500 text-center mt-1">This code has expired.</p>
								) : null}
							</div>

							<button
								type="submit"
								disabled={loading || code.length !== 6 || success}
								className="w-full py-3 rounded-xl bg-primary-800 hover:bg-primary-700 active:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-primary-900/20 transition-all flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>{retrying ? "Server is waking up, retrying..." : "Verifying..."}</span>
									</>
								) : (
									<span>Verify &amp; Sign In</span>
								)}
							</button>

							{secondsLeft <= 0 ? (
								<button
									type="button"
									onClick={handleResend}
									disabled={resending || success}
									className="w-full py-3 rounded-xl border border-primary-300 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-primary-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
								>
									{resending ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>
												{retrying ? "Server is waking up, retrying..." : "Sending new code..."}
											</span>
										</>
									) : (
										<>
											<RefreshCw className="w-4 h-4" />
											<span>Resend Code</span>
										</>
									)}
								</button>
							) : null}
						</form>
					</div>

					<a
						href="/login"
						className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-6"
					>
						<ArrowLeft className="w-3 h-3" />
						<span>Back to login</span>
					</a>
				</div>
			</div>
		</div>
	);
}
