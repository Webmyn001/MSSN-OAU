<script>
	import copyTextToClipboard from '$lib/utils/copy';
    import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Copy } from 'lucide-svelte';

     const copyAccNumber = async () => {
        const copy = await copyTextToClipboard(page.data.info.account.number)
        if (copy) {
            toast.success("Account Number Copied!")
        } else {
            toast.error("Failed to copy Account Number!")
        }
    }

    const copyAccDetails = async () => {
        const copy = await copyTextToClipboard(`Bank Name: ${page.data.info.account.bank}\nAccount Name: ${page.data.info.account.name}\nAccount Number: ${page.data.info.account.number}`)
        if (copy) {
            toast.success("Account Details Copied!")
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
            {#await import('$lib/components/ui/alert-dialog/index.js') then AlertDialog}
            <AlertDialog.Root>
                <AlertDialog.Trigger>
                    <button type="button"
                            class="inline-block font-secondary rounded-xl bg-primary-700 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-primary-300 transition duration-100 hover:bg-primary-800 focus-visible:ring active:bg-primary-800 md:text-base">
                        Donate
                    </button>

                </AlertDialog.Trigger>
                <AlertDialog.Content class="scrollbar-hide lg:max-w-[60dvw] overflow-y-scroll max-h-screen">
                    <AlertDialog.Header>
                        <AlertDialog.Title class="font-primary text-primary-800">Donate
                        </AlertDialog.Title>
                    </AlertDialog.Header>
                    <!-- List -->
                    <div class="space-y-3">
                        <dl class="flex flex-col sm:flex-row gap-1">
                            <dt class="min-w-40">
                                <span class="block text-sm text-gray-500 ">Account Name:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li class="me-1 after:content-[','] inline-flex items-center text-sm text-neutral-800">
                                        {page.data.info.account.name}
                                    </li>
                                </ul>
                            </dd>
                        </dl>

                        <dl class="flex flex-col sm:flex-row gap-1">
                            <dt class="min-w-40">
                                <span class="block text-sm text-gray-500 ">Bank Name:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li class="me-1 after:content-[','] inline-flex items-center text-sm text-neutral-800">
                                        {page.data.info.account.bank}
                                    </li>
                                </ul>
                            </dd>
                        </dl>

                        <dl class="flex flex-col sm:flex-row gap-1">
                            <dt class="min-w-40">
                                <span class="block text-sm text-gray-500">Account Number:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li class="me-1 inline-flex items-center text-sm text-neutral-800">
                                        {page.data.info.account.number}
                                        <Copy onclick={copyAccNumber}
                                              class="size-4 text-primary-700 cursor-pointer ml-4"/>
                                    </li>
                                </ul>
                            </dd>
                        </dl>
                    </div>
                    <!-- End List -->
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action class="bg-primary-800 text-white bg-primary-800/90"
                                            onclick={copyAccDetails}>Copy
                        </AlertDialog.Action>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog.Root>
                {/await}
        </div>
    </div>
</div>
<!-- End Donation CTA -->