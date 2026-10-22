import { useEffect, useState } from "react";
import { Seo } from "~/components/seo";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ManagerLogin } from "~/components/al-mamharah/manager/ManagerLogin";
import { OverviewPanel } from "~/components/al-mamharah/manager/OverviewPanel";
import { ApplicationsPanel } from "~/components/al-mamharah/manager/ApplicationsPanel";
import { ParticipantsPanel } from "~/components/al-mamharah/manager/ParticipantsPanel";
import { DailyPanel } from "~/components/al-mamharah/manager/DailyPanel";
import { LeaderboardPanel } from "~/components/al-mamharah/manager/LeaderboardPanel";
import { ManagersPanel } from "~/components/al-mamharah/manager/ManagersPanel";
import { SettingsPanel } from "~/components/al-mamharah/manager/SettingsPanel";
import { AuditPanel } from "~/components/al-mamharah/manager/AuditPanel";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
	getManagerToken,
	getManagerInfo,
	getManagerMe,
	clearManagerSession,
	AlMamharahError,
} from "~/lib/api/al-mamharah";
import { managerRoleLabel } from "~/lib/data/al-mamharah";
import { Arabic } from "~/components/al-mamharah/Arabic";

const tabs = [
	{ value: "overview", label: "Overview" },
	{ value: "applications", label: "Applications" },
	{ value: "participants", label: "Participants" },
	{ value: "daily", label: "Daily progress" },
	{ value: "leaderboard", label: "Leaderboard" },
	{ value: "managers", label: "Managers" },
	{ value: "settings", label: "Settings" },
	{ value: "audit", label: "Audit" },
];

export default function AlMamharahManagerPage() {
	const [token, setToken] = useState<string | null>(null);
	const [manager, setManager] = useState<any>(null);
	const [checking, setChecking] = useState(true);
	const [tab, setTab] = useState("overview");

	function onExpired() {
		clearManagerSession();
		setToken(null);
		setManager(null);
		toast.error("Your session has expired. Please sign in again.");
	}

	function onLoginSuccess(newToken: string, info: any) {
		setToken(newToken);
		setManager(info);
	}

	function logout() {
		clearManagerSession();
		setToken(null);
		setManager(null);
		toast.success("Signed out.");
	}

	useEffect(() => {
		const existing = getManagerToken();
		const cached = getManagerInfo();
		if (!existing || !cached) {
			// No stored session — show the login form immediately.
			if (existing) clearManagerSession();
			setChecking(false);
			return;
		}
		// Render the dashboard from the cached session right away so a slow /
		// cold-starting API never blocks the page. Validate in the background
		// and only sign out on a real auth failure (not network errors).
		setToken(existing);
		setManager(cached);
		setChecking(false);
		let cancelled = false;
		getManagerMe(existing)
			.then((result) => {
				if (cancelled) return;
				if (result.data) setManager(result.data);
			})
			.catch((err) => {
				if (cancelled) return;
				if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
					clearManagerSession();
					setToken(null);
					setManager(null);
					toast.error("Your session has expired. Please sign in again.");
				}
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<Seo
				title="Al Mamharah | Programme Manager"
				description="Manage Al Mamharah applications, participants, daily progress and settings."
				path="/al-mamharah/manager/"
			/>

			<section className="relative min-h-[60vh] overflow-hidden py-10 sm:py-12">
				<div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl" />
				<div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					{checking ? (
						<div className="flex justify-center py-24">
							<Loader2 className="size-10 animate-spin text-primary-600" />
						</div>
					) : !token || !manager ? (
						<ManagerLogin onSuccess={onLoginSuccess} />
					) : (
						<>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h1 className="flex flex-wrap items-baseline gap-2 font-secondary text-2xl font-bold text-primary-800 sm:text-3xl">
										Al Mamharah Manager
										<Arabic className="text-primary-600">إدارة البرنامج</Arabic>
									</h1>
									<p className="mt-1 text-sm text-gray-600">
										{manager.fullName || manager.email}{" "}
										<span className="text-gray-400">·</span> {managerRoleLabel(manager.role)}
									</p>
								</div>
								<Button variant="outline" size="sm" onClick={logout}>
									<LogOut className="size-4" /> Sign out
								</Button>
							</div>

							<div className="mt-6">
								<Tabs value={tab} onValueChange={setTab}>
									<TabsList className="h-auto w-full gap-0.5 overflow-x-auto p-1 sm:flex-wrap sm:justify-start">
										{tabs.map((t) => (
											<TabsTrigger key={t.value} value={t.value} className="min-h-[44px] px-3 py-2 text-xs whitespace-nowrap sm:text-sm">
												{t.label}
											</TabsTrigger>
										))}
									</TabsList>

									<TabsContent value="overview" className="mt-6">
										<OverviewPanel token={token} onExpired={onExpired} />
									</TabsContent>
									<TabsContent value="applications" className="mt-6">
										<ApplicationsPanel token={token} onExpired={onExpired} />
									</TabsContent>
									<TabsContent value="participants" className="mt-6">
										<ParticipantsPanel token={token} onExpired={onExpired} />
									</TabsContent>
									<TabsContent value="daily" className="mt-6">
										<DailyPanel token={token} onExpired={onExpired} />
									</TabsContent>
									<TabsContent value="leaderboard" className="mt-6">
										<LeaderboardPanel token={token} onExpired={onExpired} />
									</TabsContent>
									<TabsContent value="managers" className="mt-6">
										<ManagersPanel
											token={token}
											onExpired={onExpired}
											isPrimary={manager?.role === "PRIMARY"}
										/>
									</TabsContent>
									<TabsContent value="settings" className="mt-6">
										<SettingsPanel token={token} onExpired={onExpired} />
									</TabsContent>
									<TabsContent value="audit" className="mt-6">
										<AuditPanel token={token} onExpired={onExpired} />
									</TabsContent>
								</Tabs>
							</div>
						</>
					)}
				</div>
			</section>
		</>
	);
}
