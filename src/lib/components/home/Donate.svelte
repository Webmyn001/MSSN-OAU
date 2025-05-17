<script>
	import copyTextToClipboard from '$lib/utils/copy';
    import { page } from '$app/state'; // Changed from $app/state for Svelte 5 reactivity
	import { toast } from 'svelte-sonner';
	import { Copy } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

    /** @type {import('$app/forms').PageData["info"]["info"]["account"] | undefined} */
    const account = $derived(page.data?.info?.info?.account);
    let openModal = $state(false);

     const copyAccNumber = async () => {
        if (!account) return;
        const copy = await copyTextToClipboard(account.number)
        if (copy) {
            toast.success("Account Number Copied!")
        } else {
            toast.error("Failed to copy Account Number!")
        }
    }

    const copyAccDetails = async () => {
        if (!account) return;
        const copy = await copyTextToClipboard(`Bank Name: ${account.bank}\nAccount Name: ${account.name}\nAccount Number: ${account.number}`)
        if (copy) {
            toast.success("Account Details Copied!");
            openModal = false;
        } else {
            toast.error("Failed to copy Account Details!")
        }
    }
</script>

<!-- Donation CTA -->
<div id="donate" class="bg-white py-6 sm:py-8 lg:py-12">
    <div class="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div class="flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-100 p-4 sm:flex-row md:p-8">
            <div class="gap-6">
                <h2 class="text-xl font-bold text-neutral-800 font-primary md:text-2xl">Invest in your Ākhirah</h2>
                <p class="text-primary-900">We are a non-profit student organisation that only exists due to individual
                    and
                    collective efforts, both in cash and kind.</p>
            </div>

            {#if account}
                <Button variant="default" size="lg" onclick={() => openModal = true} class="">Donate</Button>

                {#if openModal} 
                    {#await import('$lib/components/layout/ResponsiveModal.svelte') then module}
                        {@const ResponsiveModal = module.default}
                        <ResponsiveModal bind:open={openModal} title="Donate" description="Support MSSN OAU. Your contributions make a difference.">
                            
                            <div class="space-y-3 px-4 py-2 lg:px-0 lg:py-0">
                                <dl class="flex flex-col gap-1">
                                    <dt class="text-sm text-gray-500">Account Name:</dt>
                                    <dd class="text-sm text-neutral-800">{account.name}</dd>
                                </dl>
                                <dl class="flex flex-col gap-1">
                                    <dt class="text-sm text-gray-500">Bank Name:</dt>
                                    <dd class="text-sm text-neutral-800">{account.bank}</dd>
                                </dl>
                                <dl class="flex flex-col gap-1">
                                    <dt class="text-sm text-gray-500">Account Number:</dt>
                                    <dd class="flex items-center text-sm text-neutral-800">
                                        {account.number}
                                        <Button variant="ghost" size="icon" onclick={copyAccNumber} class="ml-2 h-7 w-7">
                                            <Copy class="size-4 text-primary-700" />
                                        </Button>
                                    </dd>
                                </dl>
                            </div>

                            {#snippet footer()}
                                <Button variant="outline" onclick={() => openModal = false} class="w-full sm:w-auto">Cancel</Button>
                                <Button onclick={copyAccDetails} class="w-full sm:w-auto bg-primary-800 text-white hover:bg-primary-800/90">
                                    Copy Details
                                </Button>
                            {/snippet}
                        </ResponsiveModal>
                    {/await}
                {/if}
            {:else}
                 <Button variant="default" size="lg" disabled class="">Donate (Unavailable)</Button>
            {/if}
        </div>
    </div>
</div>
<!-- End Donation CTA -->