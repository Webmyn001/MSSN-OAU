import { useEffect, useState } from "react";
import { authFetch, getStoredUser } from "~/lib/stores/authStore";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { ShieldCheck, UserPlus, Trash2, Loader2, KeyRound, Users } from "lucide-react";

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Admins() {
	const [admins, setAdmins] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [newEmail, setNewEmail] = useState("");
	const [adding, setAdding] = useState(false);
	const [removingEmail, setRemovingEmail] = useState<string | null>(null);
	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	const currentUser = getStoredUser();

	useEffect(() => {
		void loadAdmins();
	}, []);

	async function loadAdmins() {
		setLoading(true);
		try {
			const res = await authFetch("/admin-auth/admins");
			const data = await res.json();
			if (data.success) {
				setAdmins(data.data.admins);
			} else {
				toast("error", data.error || "Could not load admins.");
			}
		} catch {
			toast("error", "Cannot reach server.");
		} finally {
			setLoading(false);
		}
	}

	async function addAdmin() {
		const email = newEmail.trim();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast("error", "Enter a valid email address.");
			return;
		}
		setAdding(true);
		try {
			const res = await authFetch("/admin-auth/admins", {
				method: "POST",
				body: JSON.stringify({ email }),
			});
			const data = await res.json();
			if (data.success) {
				setNewEmail("");
				await loadAdmins();
				toast("success", `Added ${data.data.email} as admin.`);
			} else {
				toast("error", data.error || "Could not add admin.");
			}
		} catch {
			toast("error", "Cannot reach server.");
		} finally {
			setAdding(false);
		}
	}

	function requestRemove(email: string) {
		setConfirmState({
			open: true,
			title: "Remove Admin?",
			message: `Remove "${email}" from dashboard admins? They will no longer be able to sign in.`,
			action: () => removeAdmin(email),
		});
	}

	async function removeAdmin(email: string) {
		setRemovingEmail(email);
		try {
			const res = await authFetch(`/admin-auth/admins/${encodeURIComponent(email)}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				await loadAdmins();
				toast("success", `Removed ${email} from admins.`);
			} else {
				toast("error", data.error || "Could not remove admin.");
			}
		} catch {
			toast("error", "Cannot reach server.");
		} finally {
			setRemovingEmail(null);
		}
	}

	function isBuiltIn(email: string) {
		return (
			email === "bellomuhyideen0001@gmail.com" ||
			email === "abdmuizzyekeen@gmail.com" ||
			email === "amaofareed11@gmail.com"
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
				<div>
					<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
						<Users className="w-7 h-7 text-green-700" />
						Admin Management
					</h2>
					<p className="text-xs sm:text-sm text-gray-600 mt-1">
						Add or remove dashboard admins. All admins share the same password.
					</p>
				</div>
			</div>

			<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-4">
				<div>
					<h3 className="text-sm font-bold text-green-950 flex items-center gap-2 mb-1">
						<UserPlus className="w-4 h-4 text-green-700" />
						Add a New Admin
					</h3>
					<p className="text-[11px] text-gray-500 mb-3">
						Enter an email address to grant dashboard access. They sign in with the shared admin
						password.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-3">
					<input
						type="email"
						placeholder="newadmin@example.com"
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") void addAdmin();
						}}
						className="flex-1 bg-green-50/50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
					<button
						onClick={() => void addAdmin()}
						disabled={adding}
						className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all"
					>
						{adding ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Adding...</span>
							</>
						) : (
							<>
								<UserPlus className="w-4 h-4" />
								<span>Add Admin</span>
							</>
						)}
					</button>
				</div>
			</div>

			<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
				<h3 className="text-sm font-bold text-green-950 flex items-center gap-2 mb-1">
					<ShieldCheck className="w-4 h-4 text-green-700" />
					Current Admins
				</h3>
				<p className="text-[11px] text-gray-500 mb-4">
					All share one password. Built-in admins cannot be removed.
				</p>

				{loading ? (
					<div className="flex items-center justify-center gap-2 py-10 text-gray-400">
						<Loader2 className="w-5 h-5 animate-spin" />
						<span className="text-xs">Loading admins...</span>
					</div>
				) : admins.length === 0 ? (
					<div className="py-10 text-center text-gray-400 text-xs">No admins found.</div>
				) : (
					<ul className="divide-y divide-gray-100">
						{admins.map((email) => (
							<li key={email} className="flex items-center justify-between gap-3 py-3">
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center shrink-0">
										<KeyRound className="w-4 h-4" />
									</div>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-green-950 truncate">{email}</p>
										<p className="text-[11px] text-gray-400">
											{email === currentUser?.email ? (
												<span className="text-green-700 font-semibold">You </span>
											) : null}
											{isBuiltIn(email) ? "Built-in admin" : "Added via dashboard"}
										</p>
									</div>
								</div>
								{!isBuiltIn(email) ? (
									<button
										onClick={() => requestRemove(email)}
										disabled={removingEmail === email}
										className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
										title="Remove admin"
										aria-label={`Remove ${email}`}
									>
										{removingEmail === email ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Trash2 className="w-4 h-4" />
										)}
									</button>
								) : null}
							</li>
						))}
					</ul>
				)}
			</div>

			<ConfirmDialog
				open={confirmState?.open ?? false}
				title={confirmState?.title ?? "Are you sure?"}
				message={confirmState?.message ?? ""}
				confirmLabel="Yes, Remove"
				cancelLabel="No, Cancel"
				onconfirm={() => {
					const action = confirmState?.action;
					setConfirmState(null);
					void action?.();
				}}
				oncancel={() => {
					setConfirmState(null);
				}}
			/>
		</div>
	);
}
