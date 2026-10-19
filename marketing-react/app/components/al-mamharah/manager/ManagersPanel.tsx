import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, AlertCircle, UserPlus, Send, UserX, Copy, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	listManagers,
	inviteManager,
	resendManagerInvite,
	revokeManager,
	deleteManager,
	AlMamharahError,
} from "~/lib/api/al-mamharah";
import { managerStatusLabel, managerRoleLabel, formatDateTime } from "~/lib/data/al-mamharah";

const inputClass =
	"rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600";

export function ManagersPanel({
	token,
	onExpired,
	isPrimary = false,
}: {
	token: string;
	onExpired: () => void;
	isPrimary?: boolean;
}) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [managers, setManagers] = useState<any[]>([]);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteName, setInviteName] = useState("");
	const [inviting, setInviting] = useState(false);
	const [acting, setActing] = useState<string | null>(null);
	const [lastLink, setLastLink] = useState<string | null>(null);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await listManagers(token);
			setManagers(result.data ?? []);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load managers.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function invite(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setInviting(true);
		try {
			const result = await inviteManager(
				{ email: inviteEmail.trim(), fullName: inviteName.trim() || undefined },
				token
			);
			setLastLink(result.data?.activationLink ?? null);
			toast.success("Invitation sent.");
			setInviteEmail("");
			setInviteName("");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not send the invitation.");
		} finally {
			setInviting(false);
		}
	}

	async function resend(manager: any) {
		setActing(manager.id);
		try {
			const result = await resendManagerInvite(manager.id, token);
			setLastLink(result.data?.activationLink ?? null);
			toast.success("Invitation re-sent.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not resend the invitation.");
		} finally {
			setActing(null);
		}
	}

	async function revoke(manager: any) {
		setActing(manager.id);
		try {
			await revokeManager(manager.id, token);
			toast.success("Manager access revoked.");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not revoke this manager.");
		} finally {
			setActing(null);
		}
	}

	async function remove(manager: any) {
		if (
			!window.confirm(
				`Permanently delete ${manager.fullName || manager.email}? This cannot be undone.`
			)
		)
			return;
		setActing(manager.id);
		try {
			await deleteManager(manager.id, token);
			toast.success("Manager deleted.");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not delete this manager.");
		} finally {
			setActing(null);
		}
	}

	async function copyLink() {
		if (!lastLink) return;
		try {
			await navigator.clipboard.writeText(lastLink);
			toast.success("Activation link copied.");
		} catch {
			toast.error("Could not copy the link.");
		}
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
				<h3 className="flex items-center gap-2 font-secondary text-base font-semibold text-gray-800">
					<UserPlus className="size-4 text-primary-600" /> Invite a manager
				</h3>
				<p className="mt-1 text-xs text-gray-500">
					Only the primary manager can invite, resend or revoke manager access. Revoked
					managers can then be deleted permanently.
				</p>
				<form onSubmit={invite} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
					<input
						type="email"
						required
						className={inputClass}
						placeholder="manager@example.com"
						value={inviteEmail}
						onChange={(e) => setInviteEmail(e.target.value)}
					/>
					<input
						type="text"
						className={inputClass}
						placeholder="Full name (optional)"
						value={inviteName}
						onChange={(e) => setInviteName(e.target.value)}
					/>
					<Button type="submit" disabled={inviting}>
						{inviting ? <Loader2 className="size-4 animate-spin" /> : null}
						Invite
					</Button>
				</form>

				{lastLink ? (
					<div className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
						<p className="text-xs font-medium text-amber-800">Development activation link</p>
						<div className="mt-1 flex items-center gap-2">
							<code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-xs text-gray-700">
								{lastLink}
							</code>
							<Button variant="outline" size="sm" onClick={copyLink}>
								<Copy className="size-3.5" /> Copy
							</Button>
						</div>
						<p className="mt-1 text-[11px] text-amber-700">
							Never shown in production — it is emailed instead.
						</p>
					</div>
				) : null}
			</div>

			{loading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-primary-600" />
				</div>
			) : error ? (
				<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					<AlertCircle className="size-4" />
					<p>{error}</p>
				</div>
			) : (
				<>
					<ul className="space-y-3">
						{managers.map((manager) => (
							<li
								key={manager.id}
								className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm"
							>
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium text-gray-800">
											{manager.fullName || manager.email}
										</span>
										<span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
											{managerRoleLabel(manager.role)}
										</span>
										<span
											className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
												manager.status === "ACTIVE"
													? "bg-emerald-100 text-emerald-700"
													: manager.status === "PENDING"
														? "bg-amber-100 text-amber-700"
														: "bg-rose-100 text-rose-700"
											}`}
										>
											{managerStatusLabel(manager.status)}
										</span>
									</div>
									{manager.fullName ? (
										<p className="mt-1 text-sm text-gray-600">{manager.email}</p>
									) : null}
									<p className="mt-0.5 text-xs text-gray-400">
										Added {formatDateTime(manager.createdAt)}
									</p>
								</div>
								<div className="flex gap-2">
									{manager.status === "PENDING" ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => resend(manager)}
											disabled={acting === manager.id}
										>
											{acting === manager.id ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Send className="size-4" />
											)}
											Resend
										</Button>
									) : null}
								{manager.status !== "REVOKED" ? (
									<Button
										variant="outline"
										size="sm"
										onClick={() => revoke(manager)}
										disabled={acting === manager.id}
									>
										<UserX className="size-4" /> Revoke
									</Button>
								) : null}
								{isPrimary && manager.status === "REVOKED" && manager.role !== "PRIMARY" ? (
									<Button
										variant="outline"
										size="sm"
										className="border-red-200 text-red-600 hover:bg-red-50"
										onClick={() => remove(manager)}
										disabled={acting === manager.id}
									>
										{acting === manager.id ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash2 className="size-4" />
										)}
										Delete
									</Button>
								) : null}
								</div>
							</li>
						))}
					</ul>
					{managers.length > 0 && !managers.some((m: any) => m.role === "PRIMARY") ? (
						<p className="flex items-center gap-1.5 text-xs text-amber-600">
							<ShieldAlert className="size-3.5" /> No primary manager found.
						</p>
					) : null}
				</>
			)}
		</div>
	);
}
