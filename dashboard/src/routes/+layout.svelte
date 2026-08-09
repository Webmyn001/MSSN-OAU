<script lang="ts">
	import './layout.css';
	import Toast from '$lib/components/Toast.svelte';
	import { page } from '$app/state';
	import {
		LayoutDashboard, Users, GraduationCap, BookUser, BookOpen, Mail,
		ExternalLink, ShieldCheck, Clock, Calendar, Newspaper, Link, Building2, CreditCard,
		Menu, X, ChevronDown, ChevronRight, LogOut
	} from '@lucide/svelte';
	import { isTokenExpired } from '$lib/stores/authStore';

	let { children } = $props();

	const currentPath = $derived(page.url.pathname);
	const isPublicPage = $derived(currentPath === '/login' || currentPath === '/otp');

	let sidebarOpen = $state(false);
	let expandedGroup = $state<string | null>(null);

	type NavItem = { label: string; href: string; icon: any };
	type NavGroup = { label: string; icon: any; items: NavItem[] };

	const navGroups: NavGroup[] = [
		{
			label: 'Content',
			icon: Newspaper,
			items: [
				{ label: 'Latest News', href: '/latest-news', icon: Newspaper },
				{ label: 'Blog Posts', href: '/blog', icon: Newspaper },
				{ label: 'Newsletter', href: '/newsletter', icon: Mail },
				{ label: 'Programmes', href: '/programmes', icon: BookOpen },
			]
		},
		{
			label: 'Community',
			icon: Users,
			items: [
				{ label: 'Past Ameers & Ameerahs', href: '/alumni', icon: GraduationCap },
				{ label: 'Advisors', href: '/advisors', icon: BookUser },
				{ label: 'Contacts', href: '/contacts', icon: Mail },
			]
		},
		{
			label: 'Finance & Facilities',
			icon: CreditCard,
			items: [
				{ label: 'Annual Dues', href: '/annual-dues', icon: CreditCard },
				{ label: 'Musollahs', href: '/mosques', icon: Building2 },
			]
		},
		{
			label: 'Settings',
			icon: ShieldCheck,
			items: [
				{ label: 'Admins', href: '/admins', icon: ShieldCheck },
			]
		}
	];

	const topLinks: NavItem[] = [
		{ label: 'Overview', href: '/', icon: LayoutDashboard },
		{ label: 'Excos', href: '/excos', icon: Users },
		{ label: 'Prayer Times', href: '/prayer-times', icon: Clock },
		{ label: 'Events', href: '/events', icon: Calendar },
	];

	function toggleGroup(label: string) {
		expandedGroup = expandedGroup === label ? null : label;
	}

	function isActive(href: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	function handleLogout() {
		localStorage.removeItem('mssn_admin_token');
		localStorage.removeItem('mssn_admin_user');
		window.location.href = '/login';
	}

	// Enforce the 30-minute token expiry even while the user is idle
	$effect(() => {
		if (isPublicPage) return;
		const interval = setInterval(() => {
			if (isTokenExpired()) {
				handleLogout();
			}
		}, 30000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
	<title>MSSN OAU Admin Dashboard</title>
</svelte:head>

<Toast />

{#if isPublicPage}
	{@render children()}
{:else}
	<div class="min-h-screen text-slate-800 flex" style="font-family: var(--font-primary);">

		{#if sidebarOpen}
			<button
				type="button"
				class="fixed inset-0 bg-black/50 z-40 lg:hidden"
				onclick={closeSidebar}
				aria-label="Close sidebar"
			></button>
		{/if}

		<aside
			class={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-950 text-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-hidden
				lg:translate-x-0 lg:static lg:z-auto
				${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
		>
			<div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
			<div class="relative flex flex-col h-full">
				<div class="px-5 py-5 border-b border-primary-700/50">
					<div class="flex items-center justify-between">
						<a href="/" class="flex items-center space-x-3">
							<img src="/mssn-logo.webp" alt="MSSN OAU" class="h-9 w-auto object-contain" />
							<div>
								<h1 class="text-sm font-bold text-white tracking-wide">MSSN OAU</h1>
								<p class="text-[10px] text-primary-200/70">Admin Dashboard</p>
							</div>
						</a>
						<button
							type="button"
							class="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-primary-200"
							onclick={closeSidebar}
							aria-label="Close sidebar"
						>
							<X class="w-5 h-5" />
						</button>
					</div>
				</div>

				<nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
					{#each topLinks as link}
						{@const Icon = link.icon}
						<a
							href={link.href}
							onclick={closeSidebar}
							class={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
								${isActive(link.href)
									? 'bg-white text-primary-900 shadow-md font-bold'
									: 'text-primary-100 hover:bg-white/10 hover:text-white'
								}`}
						>
							<Icon class="w-4.5 h-4.5 shrink-0" />
							<span>{link.label}</span>
						</a>
					{/each}

					<div class="border-t border-primary-700/40 my-3"></div>

					{#each navGroups as group}
						{@const GroupIcon = group.icon}
						{@const hasActive = group.items.some(item => isActive(item.href))}
						<div>
							<button
								type="button"
								onclick={() => toggleGroup(group.label)}
								class={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
									${hasActive && expandedGroup !== group.label
										? 'bg-white/5 text-amber-300'
										: expandedGroup === group.label
											? 'bg-white/10 text-white'
											: 'text-primary-100 hover:bg-white/10 hover:text-white'
									}`}
							>
								<span class="flex items-center space-x-3">
									<GroupIcon class="w-4.5 h-4.5 shrink-0" />
									<span>{group.label}</span>
								</span>
								{#if expandedGroup === group.label}
									<ChevronDown class="w-4 h-4" />
								{:else}
									<ChevronRight class="w-4 h-4" />
								{/if}
							</button>

							{#if expandedGroup === group.label}
								<div class="ml-4 mt-1 space-y-0.5 border-l-2 border-primary-700/40 pl-3">
									{#each group.items as item}
										{@const ItemIcon = item.icon}
										<a
											href={item.href}
											onclick={closeSidebar}
											class={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
												${isActive(item.href)
													? 'bg-white text-primary-900 shadow-sm font-bold'
													: 'text-primary-200 hover:bg-white/10 hover:text-white'
												}`}
										>
											<ItemIcon class="w-3.5 h-3.5 shrink-0" />
											<span>{item.label}</span>
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</nav>

				<div class="px-4 py-4 border-t border-primary-700/50 space-y-2">
					<a
						href="https://mssn-oau.vercel.app"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-700/60 hover:bg-primary-600 transition-all border border-primary-500/30"
					>
						<span>View Live Site</span>
						<ExternalLink class="w-3.5 h-3.5 text-amber-300" />
					</a>
					<button
						type="button"
						onclick={handleLogout}
						class="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-primary-200 hover:bg-white/10 hover:text-white transition-all border border-primary-700/40"
					>
						<LogOut class="w-3.5 h-3.5" />
						<span>Sign Out</span>
					</button>
				</div>
			</div>
		</aside>

		<div class="relative flex-1 flex flex-col min-h-screen lg:max-w-[calc(100vw-18rem)] bg-slate-50">
			<div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
			<header class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm lg:hidden">
				<div class="flex items-center justify-between h-14 px-4">
					<button
						type="button"
						class="p-2 rounded-xl hover:bg-gray-100 text-gray-700"
						onclick={() => { sidebarOpen = true; }}
						aria-label="Open sidebar"
					>
						<Menu class="w-5 h-5" />
					</button>
					<div class="flex items-center space-x-2">
						<img src="/mssn-logo.webp" alt="MSSN OAU" class="h-7 w-auto object-contain" />
						<span class="text-sm font-bold text-primary-900">MSSN OAU Admin</span>
					</div>
					<div class="w-9"></div>
				</div>
			</header>

			<main class="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
				{@render children()}
			</main>

			<footer class="relative z-10 border-t border-gray-200 bg-white py-5 text-center text-xs text-gray-500">
				<p>&copy; {new Date().getFullYear()} Muslim Students' Society of Nigeria (MSSN), OAU Branch &bull; Admin Management Dashboard</p>
			</footer>
		</div>
	</div>
{/if}
