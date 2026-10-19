import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, LogIn, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { managerLogin, saveManagerSession } from "~/lib/api/al-mamharah";

const inputClass =
	"block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary-600 focus:ring-primary-600";

export function ManagerLogin({
	onSuccess,
}: {
	onSuccess: (token: string, manager: any) => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setIsSubmitting(true);
		try {
			const result = await managerLogin(email.trim(), password);
			const { token, manager } = result.data ?? {};
			saveManagerSession(token, manager);
			toast.success("Signed in.");
			onSuccess(token, manager);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Invalid email or password.";
			setFormError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-md rounded-xl border border-primary-100 bg-white/90 p-6 shadow-md sm:p-8">
			<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
				<ShieldCheck className="size-7" />
			</div>
			<h1 className="mt-4 text-center font-secondary text-xl font-semibold text-primary-800">
				Programme Manager
			</h1>
			<p className="mt-2 text-center text-sm text-gray-600">
				Sign in to review applications and monitor participants.
			</p>

			<form onSubmit={submit} className="mt-6 grid gap-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="almh-mgr-email">
						Email
					</label>
					<input
						id="almh-mgr-email"
						type="email"
						required
						autoComplete="username"
						className={inputClass}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="manager@example.com"
					/>
				</div>
				<div>
					<label
						className="mb-2 block text-sm font-medium text-gray-700"
						htmlFor="almh-mgr-password"
					>
						Password
					</label>
					<div className="relative">
						<input
							id="almh-mgr-password"
							type={showPassword ? "text" : "password"}
							required
							autoComplete="current-password"
							className={`${inputClass} pr-11`}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-r-lg"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
						</button>
					</div>
				</div>

				{formError ? (
					<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
						<AlertCircle className="mt-0.5 size-4 shrink-0" />
						<p>{formError}</p>
					</div>
				) : null}

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							Signing in...
						</>
					) : (
						<>
							<LogIn className="size-4" />
							Sign in
						</>
					)}
				</Button>
			</form>

			<p className="mt-4 text-center text-xs text-gray-500">
				Invited as a manager? Use the activation link sent to your email.
			</p>
		</div>
	);
}
