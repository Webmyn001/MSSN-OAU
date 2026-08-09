<script lang="ts">
	import { goto } from '$app/navigation';
	import { verifyOTP, storeAuth } from '$lib/stores/authStore';
	import { toast } from '$lib/stores/toast.svelte';
	import { ShieldCheck, Loader2, ArrowLeft, Mail } from '@lucide/svelte';

	const email = $state(typeof window !== 'undefined' ? (sessionStorage.getItem('mssn_pending_email') || '') : '');
	const devOtp = $state(typeof window !== 'undefined' ? (sessionStorage.getItem('mssn_otp_dev') || '') : '');

	let code = $state('');
	let loading = $state(false);
	let success = $state(false);
	let secondsLeft = $state(60);

	$effect(() => {
		if (success) return;
		secondsLeft = 60;
		const interval = setInterval(() => {
			secondsLeft -= 1;
			if (secondsLeft <= 0) {
				clearInterval(interval);
				secondsLeft = 0;
			}
		}, 1000);
		return () => clearInterval(interval);
	});

	const patternUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3Cpath d='M30 10L50 30L30 50L10 30Z' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='4' fill='none' stroke='rgba(255,255,255,0.07)' stroke-width='1'/%3E%3C/svg%3E")`;

	$effect(() => {
		if (!email) goto('/login');
	});

	async function handleVerify(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			const data = await verifyOTP(email, code);
			if (data.success) {
				storeAuth(data.data.token, data.data.user);
				sessionStorage.removeItem('mssn_pending_email');
				sessionStorage.removeItem('mssn_otp_dev');
				success = true;
				setTimeout(() => goto('/'), 800);
			} else {
				toast('error', data.error || 'Invalid code');
			}
		} catch {
			toast('error', 'Cannot reach server.');
		} finally {
			loading = false;
		}
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		code = input.value.replace(/\D/g, '').slice(0, 6);
	}
</script>

<svelte:head>
	<title>Verify Code — MSSN OAU Admin Dashboard</title>
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
				<span class="text-primary-300 text-[10px] lg:text-xs font-semibold tracking-widest uppercase">Great Ife</span>
				<div class="h-px w-10 lg:w-12 bg-primary-400/40"></div>
			</div>
		</div>
	</div>

	<div class="flex-1 flex items-center justify-center px-6 py-10 lg:py-12 bg-gray-50">
		<div class="w-full max-w-md">

			<div class="mb-8">
				<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Verify your code</h2>
				<p class="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
					<Mail class="w-3.5 h-3.5" />
					<span>Code sent to <span class="font-medium text-gray-700">{email}</span></span>
				</p>
			</div>

			<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
				{#if success}
					<div class="flex items-center gap-2 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm mb-6">
						<ShieldCheck class="w-4 h-4 shrink-0" />
						<span>Authenticated! Redirecting...</span>
					</div>
				{/if}

				{#if devOtp}
					<div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs mb-6">
						<strong>Dev mode:</strong> Your OTP is <code class="font-mono font-bold">{devOtp}</code>
					</div>
				{/if}

				<form onsubmit={handleVerify} class="space-y-6">
					<div>
						<label for="otp" class="block text-sm font-semibold text-gray-700 mb-2">6-Digit Code</label>
						<input
							id="otp"
							type="text"
							inputmode="numeric"
							pattern="[0-9]*"
							maxlength="6"
							required
							value={code}
							oninput={handleInput}
							placeholder="000000"
							class="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all"
						/>
						<p class="text-xs text-gray-400 text-center mt-2">
							Expires in <span class="font-mono font-semibold text-gray-600" class:text-red-500={secondsLeft <= 10}>{secondsLeft}s</span>
						</p>
						{#if secondsLeft <= 0}
							<p class="text-xs text-red-500 text-center mt-1">Code expired. Go back and sign in again to get a new code.</p>
						{/if}
					</div>

					<button
						type="submit"
						disabled={loading || code.length !== 6 || success}
						class="w-full py-3 rounded-xl bg-primary-800 hover:bg-primary-700 active:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-primary-900/20 transition-all flex items-center justify-center gap-2"
					>
						{#if loading}
							<Loader2 class="w-4 h-4 animate-spin" />
							<span>Verifying...</span>
						{:else}
							<span>Verify & Sign In</span>
						{/if}
					</button>
				</form>
			</div>

			<a
				href="/login"
				class="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-6"
			>
				<ArrowLeft class="w-3 h-3" />
				<span>Back to login</span>
			</a>
		</div>
	</div>
</div>
