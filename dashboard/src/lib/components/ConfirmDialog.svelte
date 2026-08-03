<script lang="ts">
	import { X, AlertTriangle } from '@lucide/svelte';

	interface Props {
		open: boolean;
		title?: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		danger?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	}

	let {
		open,
		title = 'Are you sure?',
		message,
		confirmLabel = 'Yes, Delete',
		cancelLabel = 'No, Cancel',
		danger = true,
		onconfirm,
		oncancel
	}: Props = $props();

	function handleCancel() {
		oncancel?.();
	}

	function handleConfirm() {
		onconfirm?.();
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
		role="button"
		tabindex="-1"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleCancel();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter') handleCancel();
		}}
	>
		<div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 border border-gray-100 text-center animate-[confirmIn_0.15s_ease-out]">
			<div
				class={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${danger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}
			>
				<AlertTriangle class="w-7 h-7" />
			</div>

			<div class="space-y-1.5">
				<h3 class="text-base font-bold text-gray-900">{title}</h3>
				<p class="text-xs text-gray-500 leading-relaxed">{message}</p>
			</div>

			<div class="flex items-center space-x-2 pt-1">
				<button
					onclick={handleCancel}
					class="flex-1 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
				>
					{cancelLabel}
				</button>
				<button
					onclick={handleConfirm}
					class={`flex-1 py-2.5 rounded-full text-white text-xs font-bold shadow-md ${
						danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
					}`}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes confirmIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
