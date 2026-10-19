import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Arabic } from "~/components/al-mamharah/Arabic";
import { Loader2, KeyRound, ArrowLeft, AlertCircle, MailCheck } from "lucide-react";
import { toast } from "sonner";
import {
	enterProgramme,
	verifyEnterCode,
	saveParticipantSession,
} from "~/lib/api/al-mamharah";
import { ARABIC } from "~/lib/data/al-mamharah";

const inputClass =
	"py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm";
const labelClass = "block mb-2 text-sm text-gray-700 font-medium font-primary";

export function EnterProgramme() {
	const navigate = useNavigate();

	const [step, setStep] = useState(1);
	const [fullName, setFullName] = useState("");
	const [code, setCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [notVerified, setNotVerified] = useState<{
		message: string;
		messageAr: string;
	} | null>(null);
	const [devCode, setDevCode] = useState<string | null>(null);
	const [infoMessage, setInfoMessage] = useState<string | null>(null);

	async function requestCode(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setNotVerified(null);
		if (fullName.trim().length < 2) {
			setFormError("Please enter your full name exactly as submitted.");
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await enterProgramme(fullName.trim());
			const data = result.data ?? {};
			if (data.status === "code_sent") {
				setStep(2);
				setInfoMessage(data.message ?? "A 6-digit code has been sent to your email.");
				setDevCode(data.devCode ?? null);
				toast.success("Verification code sent.");
			} else {
				setNotVerified({
					message: data.message ?? "Your participation has not yet been verified.",
					messageAr: data.messageAr ?? "",
				});
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Something went wrong. Please try again.";
			setFormError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitCode(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		if (!/^\d{6}$/.test(code.trim())) {
			setFormError("Enter the 6-digit code from your email.");
			return;
		}
		setIsSubmitting(true);
		try {
			const result = await verifyEnterCode(fullName.trim(), code.trim());
			const { token, participant } = result.data ?? {};
			saveParticipantSession(token, participant);
			toast.success("Welcome back! Opening your dashboard...");
			await navigate("/al-mamharah/dashboard");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "That code is invalid or has expired.";
			setFormError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	function back() {
		setStep(1);
		setCode("");
		setDevCode(null);
		setInfoMessage(null);
		setFormError(null);
	}

	async function resendCode() {
		setFormError(null);
		if (fullName.trim().length < 2) {
			back();
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
			} else {
				setNotVerified({
					message: data.message ?? "Your participation has not yet been verified.",
					messageAr: data.messageAr ?? "",
				});
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Something went wrong. Please try again.";
			setFormError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div
			id="enter"
			className="flex flex-col rounded-xl border border-gray-200 bg-white/90 p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8"
		>
			<h2 className="mb-2 flex flex-col gap-0.5 font-secondary text-xl font-semibold text-primary-700 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2">
				<span>Enter Programme</span>
				<Arabic className="text-base text-primary-600 sm:text-xl">{ARABIC.enterProgramme}</Arabic>
			</h2>
			<p className="mb-6 text-sm text-gray-600">
				Approved participants can access their dashboard here. Enter your full name, then the code
				we email you.
			</p>

			{step === 1 ? (
				<form onSubmit={requestCode} className="grid gap-4">
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

					{notVerified ? (
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
					) : null}

					{formError ? (
						<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<p>{formError}</p>
						</div>
					) : null}

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								<span>Checking...</span>
							</>
						) : (
							<>
								<KeyRound className="mr-2 size-4" />
								<span>Send me a code</span>
							</>
						)}
					</Button>
				</form>
			) : (
				<form onSubmit={submitCode} className="grid gap-4">
					<div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50/60 p-3 text-sm text-primary-800">
						<MailCheck className="mt-0.5 size-4 shrink-0" />
						<p>{infoMessage}</p>
					</div>

					{devCode ? (
						<div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
							Development mode — your code is{" "}
							<span className="font-mono font-semibold">{devCode}</span>. This hint is never
							shown in production.
						</div>
					) : null}

					<div>
						<label className={labelClass} htmlFor="almh-enter-code">
							6-digit code <span className="text-red-500">*</span>
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

					{formError ? (
						<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<p>{formError}</p>
						</div>
					) : null}

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button type="submit" className="flex-1" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									<span>Verifying...</span>
								</>
							) : (
								<span>Enter Dashboard</span>
							)}
						</Button>
						<Button type="button" variant="outline" onClick={back} className="sm:w-auto">
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
			)}
		</div>
	);
}
