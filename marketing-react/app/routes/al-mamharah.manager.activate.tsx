import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router";
import { Seo } from "~/components/seo";
import { Button } from "~/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { validateActivation, activateManager } from "~/lib/api/al-mamharah";

const inputClass =
	"block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary-600 focus:ring-primary-600";

export default function ManagerActivatePage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const [checking, setChecking] = useState(true);
	const [valid, setValid] = useState(false);
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	useEffect(() => {
		if (!token) {
			setChecking(false);
			return;
		}
		let cancelled = false;
		validateActivation(token)
			.then((result) => {
				if (cancelled) return;
				const data = result.data ?? {};
				setValid(Boolean(data.valid));
				setEmail(data.email ?? "");
				setFullName(data.fullName ?? "");
			})
			.catch(() => {
				if (!cancelled) setValid(false);
			})
			.finally(() => {
				if (!cancelled) setChecking(false);
			});
		return () => {
			cancelled = true;
		};
	}, [token]);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		if (password.length < 8) {
			setFormError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirmPassword) {
			setFormError("Passwords do not match.");
			return;
		}
		setSubmitting(true);
		try {
			await activateManager(token, password, fullName.trim() || undefined);
			setDone(true);
			toast.success("Your account is now active.");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Activation failed.";
			setFormError(message);
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<>
			<Seo
				title="Activate Manager Account"
				description="Activate your Al-Mamharah Programme Manager account by setting a password."
				path="/al-mamharah/manager/activate/"
			/>

			<section className="relative overflow-hidden py-12">
				<div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl" />
				<div className="relative z-10 mx-auto max-w-md px-4 sm:px-6">
					{checking ? (
						<div className="flex justify-center py-24">
							<Loader2 className="size-10 animate-spin text-primary-600" />
						</div>
					) : done ? (
						<div className="rounded-xl border border-primary-100 bg-white/90 p-8 text-center shadow-md">
							<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
								<CheckCircle2 className="size-8 text-green-600" />
							</div>
							<h1 className="mt-4 font-secondary text-xl font-semibold text-primary-800">
								Account activated
							</h1>
							<p className="mt-2 text-sm text-gray-600">
								You can now sign in to the Programme Manager area with your email and password.
							</p>
							<div className="mt-6">
								<Button asChild className="w-full">
									<a href="/al-mamharah/manager">Go to Manager sign in</a>
								</Button>
							</div>
						</div>
					) : !token || !valid ? (
						<div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
							<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100">
								<AlertCircle className="size-7 text-red-600" />
							</div>
							<h1 className="mt-4 font-secondary text-lg font-semibold text-red-800">
								Invalid or expired link
							</h1>
							<p className="mt-2 text-sm text-red-700">
								This activation link is invalid, has already been used, or has expired. Please
								ask the primary manager to send a new invitation.
							</p>
							<div className="mt-6">
								<Button asChild variant="outline" className="w-full">
									<a href="/al-mamharah/manager">Manager sign in</a>
								</Button>
							</div>
						</div>
					) : (
						<div className="rounded-xl border border-primary-100 bg-white/90 p-6 shadow-md sm:p-8">
							<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
								<ShieldCheck className="size-7" />
							</div>
							<h1 className="mt-4 text-center font-secondary text-xl font-semibold text-primary-800">
								Set your password
							</h1>
							<p className="mt-2 text-center text-sm text-gray-600">
								Activating the manager account for <b>{email}</b>.
							</p>

							<form onSubmit={submit} className="mt-6 grid gap-4">
								<div>
									<label
										className="mb-2 block text-sm font-medium text-gray-700"
										htmlFor="act-name"
									>
										Full name (optional)
									</label>
									<input
										id="act-name"
										type="text"
										className={inputClass}
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										placeholder="Your name"
									/>
								</div>
								<div>
									<label
										className="mb-2 block text-sm font-medium text-gray-700"
										htmlFor="act-password"
									>
										Password
									</label>
									<input
										id="act-password"
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
								<div>
									<label
										className="mb-2 block text-sm font-medium text-gray-700"
										htmlFor="act-confirm"
									>
										Confirm password
									</label>
									<input
										id="act-confirm"
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

								{formError ? (
									<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
										<AlertCircle className="mt-0.5 size-4 shrink-0" />
										<p>{formError}</p>
									</div>
								) : null}

								<Button type="submit" className="w-full" disabled={submitting}>
									{submitting ? (
										<>
											<Loader2 className="size-4 animate-spin" /> Activating...
										</>
									) : (
										<>
											<KeyRound className="size-4" /> Activate my account
										</>
									)}
								</Button>
							</form>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
