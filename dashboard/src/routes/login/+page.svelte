<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/stores/authStore';
	import { toast } from '$lib/stores/toast.svelte';
	import { Mail, Lock, Loader2, Eye, EyeOff } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let showPassword = $state(false);
	let retrying = $state(false);

	const patternUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3Cpath d='M30 10L50 30L30 50L10 30Z' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='4' fill='none' stroke='rgba(255,255,255,0.07)' stroke-width='1'/%3E%3C/svg%3E")`;

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		retrying = false;

		try {
			const data = await login(email, password, () => (retrying = true));
			if (data.success) {
				sessionStorage.setItem('mssn_pending_email', email);
				sessionStorage.setItem('mssn_pending_password', password);
				sessionStorage.setItem('mssn_otp_dev', data.data?.otp || '');
				goto('/otp');
			} else {
				toast('error', data.error || 'Invalid credentials');
			}
		} catch {
			toast('error', 'The server is starting up. Please wait a moment and try again.');
		} finally {
			loading = false;
			retrying = false;
		}
	}
</script>

<svelte:head>
	<title>Login — MSSN OAU Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen flex flex-col lg:flex-row" style="font-family: var(--font-primary);">

	<div class="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 overflow-hidden
		py-10 px-6 text-center
		lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:py-0 lg:px-12">
		<div class="absolute inset-0" style="background-image: {patternUrl}; background-size: 60px 60px;"></div>
		<div class="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-transparent to-primary-950/80"></div>

		<div class="relative z-10 max-w-md mx-auto lg:text-center">
			<img src="/mssn-logo.webp" alt="MSSN OAU" class="h-14 lg:h-20 w-auto mx-auto mb-5 lg:mb-8 object-contain drop-shadow-2xl" />
			<h2 class="text-xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2 lg:mb-4">
				Muslim Students' Society of Nigeria
			</h2>
			<p class="text-primary-200 text-sm lg:text-base leading-relaxed">
				Obafemi Awolowo University Branch — Admin Management Dashboard
			</p>
			<div class="mt-5 lg:mt-8 flex items-center justify-center gap-3">
				<div class="h-px w-10 lg:w-12 bg-primary-400/40"></div>
				<span class="text-primary-300 text-[10px] lg:text-xs font-semibold tracking-widest uppercase">Great Ifẹ̀</span>
				<div class="h-px w-10 lg:w-12 bg-primary-400/40"></div>
			</div>
		</div>
	</div>

	<div class="flex-1 flex items-center justify-center px-6 py-10 lg:py-12 bg-gray-50">
		<div class="w-full max-w-md">

			<div class="mb-8">
				<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
				<p class="text-gray-500 text-sm mt-1.5">Sign in to your admin account</p>
			</div>

			<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
				<form onsubmit={handleLogin} class="space-y-5">
					<div>
						<label for="email" class="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
						<div class="relative">
							<Mail class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
							<input
								id="email"
								type="email"
								required
								bind:value={email}
								placeholder="you@example.com"
								class="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all"
							/>
						</div>
					</div>

					<div>
						<label for="password" class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
						<div class="relative">
							<Lock class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								required
								bind:value={password}
								placeholder="Enter your password"
								class="w-full pl-11 pr-11 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all"
							/>
							<button
								type="button"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 rounded-md transition-colors"
							>
								{#if showPassword}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || !email || !password}
						class="w-full py-3 rounded-xl bg-primary-800 hover:bg-primary-700 active:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-primary-900/20 transition-all flex items-center justify-center gap-2"
					>
					{#if loading}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>{retrying ? 'Server is waking up, retrying...' : 'Signing in...'}</span>
					{:else}
						<span>Sign in</span>
					{/if}
					</button>
				</form>
			</div>

			<p class="text-xs text-gray-400 text-center mt-6">
				A verification code will be sent to your email after signing in.
			</p>
		</div>
	</div>
</div>
