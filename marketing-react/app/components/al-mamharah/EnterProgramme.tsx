import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Arabic } from "~/components/al-mamharah/Arabic";
import {
	Loader2,
	KeyRound,
	ArrowLeft,
	AlertCircle,
	MailCheck,
	Lock,
	Send,
} from "lucide-react";
import { toast } from "sonner";
import {
	enterProgramme,
	verifyEnterCode,
	loginParticipant,
	forgotParticipantPassword,
	resetParticipantPassword,
	saveParticipantSession,
} from "~/lib/api/al-mamharah";
import { ARABIC } from "~/lib/data/al-mamharah";

const inputClass =
	"py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm";
const labelClass = "block mb-2 text-sm text-gray-700 font-medium font-primary";

// * Password-based student access. OTP is only used on the first login (to
// * establish a password) and for the forgotten-password reset.

type View = "name" | "password" | "setup" | "forgot" | "reset";

export function EnterProgramme() {
	const navigate = useNavigate();

	const [view, setView] = useState<View>("name");
	const [fullName, setFullName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [code, setCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [notVerified, setNotVerified] = useState<{
		message: string;
		messageAr: string;
	} | null>(null);
	const [devCode, setDevCode] = useState<string | null>(null);
	const [infoMessage, setInfoMessage] = useState<string | null>(null);

	function startError(message: string) {
		setFormError(message);
		toast.error(message);
	}

	function resetLocal() {
		setFormError(null);
		setNotVerified(null);
		setDevCode(null);
		setInfoMessage(null);
		setCode("");
		setPassword("");
		setConfirmPassword("");
	}

	function backToName() {
		resetLocal();
		setView("name");
	}

	function finish(token: string | undefined, participant: any) {
		if (!token) {
			startError("Something went wrong signing you in. Please try again.");
			return;
		}
		saveParticipantSession(token, participant);
		toast.success("Welcome back! Opening your dashboard...");
		void navigate("/al-mamharah/dashboard");
	}

	async function requestCode(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setNotVerified(null);
		if (fullName.trim().length < 2) {
			startError("Please enter your full name exactly as submitted.");
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await enterProgramme(fullName.trim());
			const data = result.data ?? {};
			if (data.status === "password_required") {
				setView("password");
			} else if (data.status === "code_sent") {
				setView("setup");
				setInfoMessage(
					data.message ?? "A 6-digit code has been sent to your email."
				);
				setDevCode(data.devCode ?? null);
				toast.success("Verification code sent.");
			} else {
				setNotVerified({
					message: data.message ?? "Your participation has not yet been verified.",
					messageAr: data.messageAr ?? "",
				});
			}
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "Something went wrong. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitPassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		if (!password) {
			startError("Enter your password.");
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await loginParticipant(fullName.trim(), password);
			const { token, participant } = result.data ?? {};
			finish(token, participant);
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "Incorrect name or password."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	function validateNewPassword(): string | null {
		if (password.length < 8) return "Password must be at least 8 characters.";
		if (password !== confirmPassword) return "Passwords do not match.";
		return null;
	}

	async function submitSetup(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		if (!/^\d{6}$/.test(code.trim())) {
			startError("Enter the 6-digit code from your email.");
			return;
		}
		const passwordError = validateNewPassword();
		if (passwordError) {
			startError(passwordError);
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await verifyEnterCode(fullName.trim(), code.trim(), password);
			const { token, participant } = result.data ?? {};
			finish(token, participant);
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "That code is invalid or has expired."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function requestReset(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		if (fullName.trim().length < 2) {
			startError("Please enter your full name exactly as submitted.");
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await forgotParticipantPassword(fullName.trim());
			const data = result.data ?? {};
			setView("reset");
			setInfoMessage(
				data.message ?? "If that name is on the approved list, a reset code has been emailed."
			);
			setDevCode(data.devCode ?? null);
			toast.success("Reset code sent.");
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "Something went wrong. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitReset(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		if (!/^\d{6}$/.test(code.trim())) {
			startError("Enter the 6-digit reset code from your email.");
			return;
		}
		const passwordError = validateNewPassword();
		if (passwordError) {
			startError(passwordError);
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await resetParticipantPassword(fullName.trim(), code.trim(), password);
			const { token, participant } = result.data ?? {};
			finish(token, participant);
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "That code is invalid or has expired."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function resendCode() {
		setFormError(null);
		if (fullName.trim().length < 2) {
			backToName();
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await enterProgramme(fullName.trim());
			const data = result.data ?? {};
			if (data.status === "code_sent") {
				setInfoMessage(data.message ?? "A new 6-digit code has been sent to your email.");
				setDevCode(data.devCode ?? null);
				toast.success("A new code has been sent.");
			} else if (data.status === "password_required") {
				toast.error("This account already has a password. Please sign in with it.");
				setView("password");
			} else {
				setNotVerified({
					message: data.message ?? "Your participation has not yet been verified.",
					messageAr: data.messageAr ?? "",
				});
				setView("name");
			}
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "Something went wrong. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function resendResetCode() {
		setFormError(null);
		if (fullName.trim().length < 2) {
			backToName();
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await forgotParticipantPassword(fullName.trim());
			const data = result.data ?? {};
			setInfoMessage(data.message ?? "A new reset code has been sent to your email.");
			setDevCode(data.devCode ?? null);
			toast.success("A new reset code has been sent.");
		} catch (error) {
			startError(
				error instanceof Error ? error.message : "Something went wrong. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	function errorBox() {
		if (!formError) return null;
		return (
			<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
				<AlertCircle className="mt-0.5 size-4 shrink-0" />
				<p>{formError}</p>
			</div>
		);
	}

	function notVerifiedBox() {
		if (!notVerified) return null;
		return (
			<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
				<div className="flex items-start gap-2">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					<div className="space-y-1">
						<p>{notVerified.message}</p>
						{notVerified.messageAr ? (
							<p className="text-right font-secondary" dir="rtl" lang="ar">
								{notVerified.messageAr}
							</p>
						) : null}
					</div>
				</div>
			</div>
		);
	}

	function devCodeBox() {
		if (!devCode) return null;
		return (
			<div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
				Development mode — your code is{" "}
				<span className="font-mono font-semibold">{devCode}</span>. This hint is never shown in
				production.
			</div>
		);
	}

	function passwordFields(showConfirm = true) {
		return (
			<>
				<div>
					<label className={labelClass} htmlFor="almh-new-password">
						New password <span className="text-red-500">*</span>
					</label>
					<input
						id="almh-new-password"
						name="password"
						type="password"
						required
						minLength={8}
						autoComplete="new-password"
						className={inputClass}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="At least 8 characters"
					/>
				</div>
				{showConfirm ? (
					<div>
						<label className={labelClass} htmlFor="almh-confirm-password">
							Confirm password <span className="text-red-500">*</span>
						</label>
						<input
							id="almh-confirm-password"
							name="confirmPassword"
							type="password"
							required
							minLength={8}
							autoComplete="new-password"
							className={inputClass}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Re-enter your password"
						/>
					</div>
				) : null}
			</>
		);
	}

	function nameField() {
		return (
			<div>
				<label className={labelClass} htmlFor="almh-enter-name">
					Full Name <span className="text-red-500">*</span>
				</label>
				<input
					id="almh-enter-name"
					name="fullName"
					type="text"
					required
					autoComplete="name"
					className={inputClass}
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					placeholder="Exactly as on your application"
				/>
			</div>
		);
	}

	function codeField(label = "6-digit code") {
		return (
			<div>
				<label className={labelClass} htmlFor="almh-enter-code">
					{label} <span className="text-red-500">*</span>
				</label>
				<input
					id="almh-enter-code"
					name="code"
					type="text"
					required
					inputMode="numeric"
					autoComplete="one-time-code"
					maxLength={6}
					pattern="[0-9]{6}"
					className={`${inputClass} text-center font-mono text-lg tracking-[0.5em]`}
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="000000"
				/>
			</div>
		);
	}

	function submitButton(label: string, spinner: string, icon?: React.ReactNode) {
		return (
			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? (
					<>
						<Loader2 className="mr-2 size-4 animate-spin" />
						<span>{spinner}</span>
					</>
				) : (
					<>
						{icon}
						<span>{label}</span>
					</>
				)}
			</Button>
		);
	}

	const subtitle =
		view === "password"
			? "Enter your password to access your dashboard."
			: view === "setup"
				? "First time signing in? Enter the code we emailed you, then choose a password."
				: view === "forgot"
					? "We'll email you a code to set a new password."
					: view === "reset"
						? "Enter the reset code from your email, then choose a new password."
						: "Approved participants can access their dashboard here. Sign in with your name and password.";

	return (
		<div
			id="enter"
			className="flex flex-col rounded-xl border border-gray-200 bg-white/90 p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8"
		>
			<h2 className="mb-2 flex flex-col gap-0.5 font-secondary text-xl font-semibold text-primary-700 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2">
				<span>Enter Programme</span>
				<Arabic className="text-base text-primary-600 sm:text-xl">{ARABIC.enterProgramme}</Arabic>
			</h2>
			<p className="mb-6 text-sm text-gray-600">{subtitle}</p>

			{view === "name" ? (
				<form onSubmit={requestCode} className="grid gap-4">
					{nameField()}
					{notVerifiedBox()}
					{errorBox()}
					{submitButton("Continue", "Checking...", <KeyRound className="mr-2 size-4" />)}
					<button
						type="button"
						onClick={() => {
							resetLocal();
							setView("forgot");
						}}
						className="mt-1 text-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
					>
						Forgotten your password?
					</button>
				</form>
			) : view === "password" ? (
				<form onSubmit={submitPassword} className="grid gap-4">
					{nameField()}
					<div>
						<label className={labelClass} htmlFor="almh-password">
							Password <span className="text-red-500">*</span>
						</label>
						<input
							id="almh-password"
							name="password"
							type="password"
							required
							autoComplete="current-password"
							className={inputClass}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Your password"
						/>
					</div>
					{errorBox()}
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button type="submit" className="flex-1" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									<span>Signing in...</span>
								</>
							) : (
								<>
									<Lock className="mr-2 size-4" />
									<span>Sign in</span>
								</>
							)}
						</Button>
						<Button type="button" variant="outline" onClick={backToName} className="sm:w-auto">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</div>
					<button
						type="button"
						onClick={() => {
							resetLocal();
							setView("forgot");
						}}
						className="mt-1 text-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
					>
						Forgotten your password?
					</button>
				</form>
			) : view === "setup" ? (
				<form onSubmit={submitSetup} className="grid gap-4">
					<div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50/60 p-3 text-sm text-primary-800">
						<MailCheck className="mt-0.5 size-4 shrink-0" />
						<p>{infoMessage}</p>
					</div>
					{devCodeBox()}
					{nameField()}
					{codeField()}
					{passwordFields(true)}
					{errorBox()}
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button type="submit" className="flex-1" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									<span>Setting up...</span>
								</>
							) : (
								<>
									<Lock className="mr-2 size-4" />
									<span>Set password &amp; enter</span>
								</>
							)}
						</Button>
						<Button type="button" variant="outline" onClick={backToName} className="sm:w-auto">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</div>
					<button
						type="button"
						onClick={resendCode}
						disabled={isSubmitting}
						className="mt-1 text-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50 disabled:pointer-events-none"
					>
						Didn't receive the code? Resend it
					</button>
				</form>
			) : view === "forgot" ? (
				<form onSubmit={requestReset} className="grid gap-4">
					{nameField()}
					{errorBox()}
					{submitButton("Send reset code", "Sending...", <Send className="mr-2 size-4" />)}
					<Button type="button" variant="outline" onClick={backToName} className="w-full">
						<ArrowLeft className="mr-2 size-4" />
						Back to sign in
					</Button>
				</form>
			) : (
				<form onSubmit={submitReset} className="grid gap-4">
					<div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50/60 p-3 text-sm text-primary-800">
						<MailCheck className="mt-0.5 size-4 shrink-0" />
						<p>{infoMessage}</p>
					</div>
					{devCodeBox()}
					{nameField()}
					{codeField("Reset code")}
					{passwordFields(true)}
					{errorBox()}
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button type="submit" className="flex-1" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									<span>Resetting...</span>
								</>
							) : (
								<>
									<Lock className="mr-2 size-4" />
									<span>Reset password &amp; enter</span>
								</>
							)}
						</Button>
						<Button type="button" variant="outline" onClick={backToName} className="sm:w-auto">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</div>
					<button
						type="button"
						onClick={resendResetCode}
						disabled={isSubmitting}
						className="mt-1 text-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50 disabled:pointer-events-none"
					>
						Didn't receive the code? Resend it
					</button>
				</form>
			)}
		</div>
	);
}
