import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
	LayoutDashboard,
	Users,
	GraduationCap,
	BookUser,
	BookOpen,
	Mail,
	ExternalLink,
	ShieldCheck,
	Clock,
	Calendar,
	Newspaper,
	Building2,
	CreditCard,
	Menu,
	X,
	ChevronDown,
	ChevronRight,
	LogOut,
	type LucideIcon,
} from "lucide-react";
import { Toast } from "~/components/Toast";
import { clearAuth, getStoredToken, isTokenExpired } from "~/lib/stores/authStore";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label: string; icon: LucideIcon; items: NavItem[] };

const navGroups: NavGroup[] = [
	{
		label: "Content",
		icon: Newspaper,
		items: [
			{ label: "Latest News", href: "/latest-news", icon: Newspaper },
			{ label: "Blog Posts", href: "/blog", icon: Newspaper },
			{ label: "Newsletter", href: "/newsletter", icon: Mail },
			{ label: "Programmes", href: "/programmes", icon: BookOpen },
		],
	},
	{
		label: "Community",
		icon: Users,
		items: [
			{ label: "Past Ameers & Ameerahs", href: "/alumni", icon: GraduationCap },
			{ label: "Advisors", href: "/advisors", icon: BookUser },
			{ label: "Contacts", href: "/contacts", icon: Mail },
		],
	},
	{
		label: "Finance & Facilities",
		icon: CreditCard,
		items: [
			{ label: "Annual Dues", href: "/annual-dues", icon: CreditCard },
			{ label: "Musollahs", href: "/mosques", icon: Building2 },
		],
	},
	{
		label: "Settings",
		icon: ShieldCheck,
		items: [{ label: "Admins", href: "/admins", icon: ShieldCheck }],
	},
];

const topLinks: NavItem[] = [
	{ label: "Overview", href: "/", icon: LayoutDashboard },
	{ label: "Excos", href: "/excos", icon: Users },
	{ label: "Prayer Times", href: "/prayer-times", icon: Clock },
	{ label: "Events", href: "/events", icon: Calendar },
];

export default function DashboardLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const currentPath = location.pathname;

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

	useEffect(() => {
		const token = getStoredToken();
		if (!token || isTokenExpired()) {
			clearAuth();
			navigate("/login", { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (isTokenExpired()) {
				clearAuth();
				navigate("/login", { replace: true });
			}
		}, 60000);
		return () => clearInterval(interval);
	}, [navigate]);

	function toggleGroup(label: string) {
		setExpandedGroup((prev) => (prev === label ? null : label));
	}

	function isActive(href: string): boolean {
		if (href === "/") return currentPath === "/";
		return currentPath.startsWith(href);
	}

	function closeSidebar() {
		setSidebarOpen(false);
	}

	function handleLogout() {
		clearAuth();
		navigate("/login", { replace: true });
	}

	return (
		<div className="min-h-screen text-slate-800 flex" style={{ fontFamily: "var(--font-primary)" }}>
			<Toast />

			{sidebarOpen ? (
				<button
					type="button"
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={closeSidebar}
					aria-label="Close sidebar"
				/>
			) : null}

			<aside
				className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-950 text-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-hidden lg:translate-x-0 lg:static lg:z-auto ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
				<div className="relative h-full flex flex-col">
					<div className="px-4 py-4 border-b border-primary-700/50">
						<div className="flex items-center justify-between">
							<Link to="/" className="flex items-center space-x-2">
								<img
									src="/mssn-logo.webp"
									alt="MSSN OAU"
									className="h-9 w-auto object-contain"
								/>
								<div>
									<p className="text-sm font-bold text-white leading-tight">MSSN OAU</p>
									<p className="text-[10px] text-primary-200">Admin Dashboard</p>
								</div>
							</Link>
							<button
								type="button"
								className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-primary-200"
								onClick={closeSidebar}
								aria-label="Close sidebar"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
						{topLinks.map((link) => {
							const Icon = link.icon;
							const active = isActive(link.href);
							return (
								<Link
									key={link.href}
									to={link.href}
									onClick={closeSidebar}
									className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
										active
											? "bg-white text-primary-900 shadow-md font-bold"
											: "text-primary-100 hover:bg-white/10 hover:text-white"
									}`}
								>
									<Icon className="w-4 h-4 shrink-0" />
									<span>{link.label}</span>
								</Link>
							);
						})}

						<div className="border-t border-primary-700/40 my-3" />

						{navGroups.map((group) => {
							const GroupIcon = group.icon;
							const hasActive = group.items.some((item) => isActive(item.href));
							const expanded = expandedGroup === group.label;
							return (
								<div key={group.label}>
									<button
										type="button"
										onClick={() => toggleGroup(group.label)}
										className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
											hasActive && !expanded
												? "bg-white/5 text-amber-300"
												: expanded
													? "bg-white/10 text-white"
													: "text-primary-100 hover:bg-white/10 hover:text-white"
										}`}
									>
										<span className="flex items-center space-x-3">
											<GroupIcon className="w-4 h-4 shrink-0" />
											<span>{group.label}</span>
										</span>
										{expanded ? (
											<ChevronDown className="w-4 h-4" />
										) : (
											<ChevronRight className="w-4 h-4" />
										)}
									</button>

									{expanded ? (
										<div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary-700/40 pl-3">
											{group.items.map((item) => {
												const ItemIcon = item.icon;
												const active = isActive(item.href);
												return (
													<Link
														key={item.href}
														to={item.href}
														onClick={closeSidebar}
														className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
															active
																? "bg-white text-primary-900 shadow-sm font-bold"
																: "text-primary-200 hover:bg-white/10 hover:text-white"
														}`}
													>
														<ItemIcon className="w-3.5 h-3.5 shrink-0" />
														<span>{item.label}</span>
													</Link>
												);
											})}
										</div>
									) : null}
								</div>
							);
						})}
					</nav>

					<div className="px-4 py-4 border-t border-primary-700/50 space-y-2">
						<a
							href="https://mssnoau.org"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-700/60 hover:bg-primary-600 transition-all border border-primary-500/30"
						>
							<span>View Live Site</span>
							<ExternalLink className="w-3.5 h-3.5 text-amber-300" />
						</a>
						<button
							type="button"
							onClick={handleLogout}
							className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-primary-200 hover:bg-white/10 hover:text-white transition-all border border-primary-700/40"
						>
							<LogOut className="w-3.5 h-3.5" />
							<span>Sign Out</span>
						</button>
					</div>
				</div>
			</aside>

			<div className="relative flex-1 flex flex-col min-h-screen lg:max-w-[calc(100vw-18rem)] bg-slate-50">
				<div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
				<header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm lg:hidden">
					<div className="flex items-center justify-between h-14 px-4">
						<button
							type="button"
							className="p-2 rounded-xl hover:bg-gray-100 text-gray-700"
							onClick={() => setSidebarOpen(true)}
							aria-label="Open sidebar"
						>
							<Menu className="w-5 h-5" />
						</button>
						<div className="flex items-center space-x-2">
							<img src="/mssn-logo.webp" alt="MSSN OAU" className="h-7 w-auto object-contain" />
							<span className="text-sm font-bold text-primary-900">MSSN OAU Admin</span>
						</div>
						<div className="w-9" />
					</div>
				</header>

				<main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
					<Outlet />
				</main>

				<footer className="relative z-10 border-t border-gray-200 bg-white py-5 text-center text-xs text-gray-500">
					<p>
						&copy; {new Date().getFullYear()} Muslim Students' Society of Nigeria (MSSN), OAU Branch
						&bull; Admin Management Dashboard
					</p>
				</footer>
			</div>
		</div>
	);
}
