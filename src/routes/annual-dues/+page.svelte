<script>
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import copyTextToClipboard from "$lib/utils/copy.js";
    import {toast} from "svelte-sonner";
    import {Copy} from "lucide-svelte";
    import {MetaTags} from "svelte-meta-tags";

    const copyAccNumber = async () => {
        const copy = await copyTextToClipboard("0217023039")
        console.log(copy)
        if (copy) {
            toast.success("Account Number Copied!")
        } else {
            toast.error("Failed to copy Account Number!")
        }
    }

    const copyAccDetails = async () => {
        const copy = await copyTextToClipboard(`Bank Name: GTBank\nAccount Name: Muslim Students’ Society Of Nigeria, OAU\nAccount Number: 0217023039`)
        console.log(copy)
        if (copy) {
            toast.success("Account Details Copied!")
        } else {
            toast.error("Failed to copy Account Details!")
        }
    }

    const finsec_no = "+2348146851394"
</script>

<!-- Meta Tags -->
<MetaTags
        title="Pay Annual Dues"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'Pay Annual Dues | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
        alt: 'Website screenshot'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<!-- End Meta Tags -->

<section class="py-24 relative">
    <div class="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div class="w-full justify-start items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
            <div
                    class="w-full justify-center items-start gap-6 grid sm:grid-cols-2 grid-cols-1 lg:order-first order-last">
                <div class="pt-24 lg:justify-center sm:justify-end justify-start items-start gap-2.5 flex">
                    <img class=" rounded-xl object-cover" src="/images/man_phone.webp" alt="Man with phone" />
                </div>
                <img class="sm:ml-0 ml-auto rounded-xl object-cover" src="/images/woman_laptop.webp"
                     alt="Woman with Laptop" />
            </div>
            <div class="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
                <div class="w-full flex-col justify-center items-start gap-8 flex">
                    <div class="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                        <h2
                                class="text-gray-900 text-4xl font-bold font-primary leading-normal lg:text-start text-center">
                            Help Us Grow</h2>
                        <p class="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                            Every year, we are reminded of the incredible impact our collective efforts bring to the MSSNOAU community. From hosting inspiring events to fostering academic and spiritual growth, we are stronger together because we're here for ourselves and for each other.
                            <br />
                            Paying your annual dues is both a testament to and a result of the strength of our brotherhood.
                        </p>
                    </div>
                </div>
                <AlertDialog.Root>
                    <AlertDialog.Trigger>
                <button
                        class="sm:w-fit w-full px-3.5 py-2 bg-primary-800 hover:bg-primary-800/90 transition-all duration-700 ease-in-out rounded-xl shadow-sm justify-center items-center flex">
                    <span class="px-1.5 text-white text-sm font-medium leading-6">Pay Annual Dues</span>
                </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                        <AlertDialog.Header>
                            <AlertDialog.Title class="font-primary text-primary-800">Pay Annual Dues
                            </AlertDialog.Title>
                        </AlertDialog.Header>
                        <Alert.Root class="bg-orange-100 text-orange-800" variant="destructive">
                            <CircleAlert color="#9a3412" class="size-4" />
                            <Alert.Title>About Online Payment</Alert.Title>
                            <Alert.Description
                            >Online payment is currently available, so you can make payment here and then message the financial secretary on WhatsApp afterwards with your receipt.</Alert.Description
                            >
                        </Alert.Root>
                        <!-- List -->
                        <div class="space-y-3 my-4">
                            <dl class="flex flex-col sm:flex-row gap-1">
                                <dt class="min-w-40">
                                    <span class="block text-sm text-gray-500 ">Account Name:</span>
                                </dt>
                                <dd>
                                    <ul>
                                        <li class="me-1 after:content-[','] inline-flex items-center text-sm text-neutral-800">
                                            Muslim Students’ Society Of Nigeria, OAU
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
                                            GTBank
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
                                            0217023039
                                            <Copy onclick={copyAccNumber}
                                                  class="size-4 text-primary-700 cursor-pointer ml-4"/>
                                        </li>
                                    </ul>
                                </dd>
                            </dl>

                            <dl class="flex flex-col sm:flex-row gap-1">
                                <dt class="min-w-40">
                                    <span class="block text-sm text-gray-500">Financial Secretary's Number:</span>
                                </dt>
                                <dd>
                                    <ul>
                                        <li class="me-1 inline-flex items-center text-sm text-neutral-800">
                                            {finsec_no}
                                            <Copy onclick={() => {
                                                copyTextToClipboard(finsec_no)
                                            }}
                                                  class="size-4 text-primary-700 cursor-pointer ml-4"/>
                                        </li>
                                    </ul>
                                </dd>
                            </dl>
                        </div>
                        <!-- End List -->
                        <AlertDialog.Footer class="flex flex-col md:flex-row gap-2 sm:gap-3">
                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                            <AlertDialog.Action class="bg-primary-800 text-white bg-primary-800/90"
                                                onclick={copyAccDetails}>Copy Account Details
                            </AlertDialog.Action>
                            <AlertDialog.Action class="bg-primary-800 text-white bg-primary-800/90"
                                                onclick={() => {
                                                    window.open(`https://wa.me/234${finsec_no.replace(/^0/, "").replace(/^234/, "").replace(/^\+234/, "").replaceAll(" ", "")}`)
                                                }}>Message Financial Secretary
                            </AlertDialog.Action>
                        </AlertDialog.Footer>
                    </AlertDialog.Content>
                </AlertDialog.Root>
            </div>
        </div>
    </div>
</section>
