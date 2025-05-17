<script>
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js"
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { Copy, CircleAlert, MapPinned, Phone, MessageCircle } from '@lucide/svelte';
    import copyTextToClipboard from "$lib/utils/copy.js";
    import {toast} from "svelte-sonner";
    import {MetaTags} from "svelte-meta-tags";
    import SEO from '$lib/components/SEO.svelte';
    import { PUBLIC_FINSEC_NUMBER } from '$env/static/public';
    let { data } = $props();

    let visible = $state(false)
    
    onMount(() => {
        visible = true
    })

    const copyAccNumber = async () => {
        const copy = await copyTextToClipboard(data.info.account.number)
        if (copy) {
            toast.success("Account Number Copied!")
        } else {
            toast.error("Failed to copy Account Number!")
        }
    }

    const copyAccDetails = async () => {
        const copy = await copyTextToClipboard(`Bank Name: ${data.info.account.bank}\nAccount Name: ${data.info.account.name}\nAccount Number: ${data.info.account.number}`)
        if (copy) {
            toast.success("Account Details Copied!")
        } else {
            toast.error("Failed to copy Account Details!")
        }
    }

    const finsec_no = PUBLIC_FINSEC_NUMBER
</script>

<SEO
    title="Pay Annual Dues"
    description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
    path="/annual-dues"
    type="WebPage"
    images={[
        {
            url: 'https://i.ibb.co/zbWfh5B/home.webp',
            width: 1200,
            height: 640,
            alt: 'MSSNOAU Annual Dues Page'
        }
    ]}
    schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Pay Annual Dues | MSSNOAU",
        "description": "Contribute to the Muslim Students Society of Nigeria, OAU Branch by paying your annual dues. Support our activities and community initiatives.",
        "url": "https://mssnoau.org/annual-dues",
        "publisher": {
            "@type": "Organization",
            "name": "MSSNOAU"
        }
    }}
    keywords={["mssnoau annual dues", "pay mssn oau dues", "support mssnoau", "muslim students oau finance", "oau mssn contribution"]}
/>

<section class="py-24 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto relative z-10">
        <div class="w-full justify-start items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
            {#if visible}
                <!-- Images with staggered animation -->
                <div
                    in:fly={{ x: -30, duration: 800, delay: 200 }}
                    class="w-full justify-center items-start gap-6 grid sm:grid-cols-2 grid-cols-1 lg:order-first order-last"
                >
                    <div class="pt-24 lg:justify-center sm:justify-end justify-start items-start gap-2.5 flex">
                        <img 
                            class="rounded-xl object-cover shadow-lg border border-gray-100 transition-transform duration-500 hover:scale-105" 
                            src="/images/man_phone.webp" 
                            alt="Man with phone" 
                        />
                    </div>
                    <img 
                        class="sm:ml-0 ml-auto rounded-xl object-cover shadow-lg border border-gray-100 transition-transform duration-500 hover:scale-105" 
                        src="/images/woman_laptop.webp"
                        alt="Woman with Laptop" 
                    />
                </div>
                
                <!-- Content with animation -->
                <div 
                    in:fly={{ x: 30, duration: 800, delay: 400 }}
                    class="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex"
                >
                    <div class="w-full flex-col justify-center items-start gap-8 flex">
                        <div class="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                            <h2
                                class="text-gray-900 text-4xl font-bold font-primary leading-normal lg:text-start text-center relative inline-block"
                            >
                                Help Us Grow
                                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-700 rounded-full"></span>
                            </h2>
                            <p class="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                                Every year, we are reminded of the incredible impact our collective efforts bring to the MSSNOAU community. From hosting inspiring events to fostering academic and spiritual growth, we are stronger together because we're here for ourselves and for each other.
                                <br />
                                Paying your annual dues is both a testament to and a result of the strength of our brotherhood.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Enhanced button with animation -->
                    <AlertDialog.Root>
                        <AlertDialog.Trigger>
                            <button
                                class="sm:w-fit w-full px-5 py-3 bg-primary-800 hover:bg-primary-800/90 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 justify-center items-center flex gap-2"
                            >
                                <span class="text-white text-sm font-medium leading-6">Pay Annual Dues</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M2.5 19A1.5 1.5 0 0 0 4 20.5h16A1.5 1.5 0 0 0 21.5 19v-1.5h-19V19Z"></path><path d="M21.5 5V4A1.5 1.5 0 0 0 20 2.5H4A1.5 1.5 0 0 0 2.5 4v1H21.5Z"></path><path d="M2.5 5v12.5h19V5"></path><path d="M10 10h4"></path></svg>
                            </button>
                        </AlertDialog.Trigger>
                        
                        <!-- Enhanced dialog content -->
                        <AlertDialog.Content class="lg:max-w-[60dvw] overflow-y-auto max-h-[90vh] scrollbar-hide rounded-xl border-primary-100 shadow-xl">
                            <AlertDialog.Header>
                                <AlertDialog.Title class="font-primary text-primary-800 flex items-center gap-2">
                                    Pay Annual Dues
                                    <span class="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20">
                                        2024/2025
                                    </span>
                                </AlertDialog.Title>
                            </AlertDialog.Header>
                            
                            <Alert.Root class="bg-orange-100 text-orange-800 border border-orange-200" variant="destructive">
                                <CircleAlert color="#9a3412" class="size-4" />
                                <Alert.Title>About Online Payment</Alert.Title>
                                <Alert.Description>
                                    Online payment is currently available, so you can make payment here and then message the financial secretary on WhatsApp afterwards with your receipt.
                                </Alert.Description>
                            </Alert.Root>
                            
                            <!-- Account details with enhanced styling -->
                            <div class="space-y-3 my-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3 class="text-sm font-medium text-gray-900 mb-4">Account Information</h3>
                                
                                <dl class="flex flex-col sm:flex-row gap-1 p-3 bg-white rounded-lg shadow-sm">
                                    <dt class="min-w-40">
                                        <span class="block text-sm text-gray-500">Account Name:</span>
                                    </dt>
                                    <dd>
                                        <ul>
                                            <li class="me-1 after:content-[','] inline-flex items-center text-sm font-medium text-primary-800">
                                                {data.info.account.name}
                                            </li>
                                        </ul>
                                    </dd>
                                </dl>

                                <dl class="flex flex-col sm:flex-row gap-1 p-3 bg-white rounded-lg shadow-sm">
                                    <dt class="min-w-40">
                                        <span class="block text-sm text-gray-500">Bank Name:</span>
                                    </dt>
                                    <dd>
                                        <ul>
                                            <li class="me-1 after:content-[','] inline-flex items-center text-sm font-medium text-primary-800">
                                                {data.info.account.bank}
                                            </li>
                                        </ul>
                                    </dd>
                                </dl>

                                <dl class="flex flex-col sm:flex-row gap-1 p-3 bg-white rounded-lg shadow-sm">
                                    <dt class="min-w-40">
                                        <span class="block text-sm text-gray-500">Account Number:</span>
                                    </dt>
                                    <dd>
                                        <ul>
                                            <li class="me-1 inline-flex items-center text-sm font-medium text-primary-800">
                                                {data.info.account.number}
                                                <button 
                                                    onclick={copyAccNumber}
                                                    class="ml-4 p-1.5 rounded-full bg-gray-100 hover:bg-primary-100 transition-colors"
                                                >
                                                    <Copy class="size-3.5 text-primary-700"/>
                                                </button>
                                            </li>
                                        </ul>
                                    </dd>
                                </dl>

                                <dl class="flex flex-col sm:flex-row gap-1 p-3 bg-white rounded-lg shadow-sm">
                                    <dt class="min-w-40">
                                        <span class="block text-sm text-gray-500">Financial Secretary's Number:</span>
                                    </dt>
                                    <dd>
                                        <ul>
                                            <li class="me-1 inline-flex items-center text-sm font-medium text-primary-800">
                                                {finsec_no}
                                                <button 
                                                    onclick={() => copyTextToClipboard(finsec_no)}
                                                    class="ml-4 p-1.5 rounded-full bg-gray-100 hover:bg-primary-100 transition-colors"
                                                >
                                                    <Copy class="size-3.5 text-primary-700"/>
                                                </button>
                                            </li>
                                        </ul>
                                    </dd>
                                </dl>
                            </div>
                            
                            <AlertDialog.Footer class="flex flex-col md:flex-row gap-2 sm:gap-3">
                                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                <AlertDialog.Action 
                                    class="bg-primary-800 text-white hover:bg-primary-700 flex items-center gap-2"
                                    onclick={copyAccDetails}
                                >
                                    <Copy class="size-4" />
                                    Copy Account Details
                                </AlertDialog.Action>
                                <AlertDialog.Action 
                                    class="bg-[#25D366] text-white hover:bg-[#25D366]/90 flex items-center gap-2"
                                    onclick={() => {
                                        window.open(`https://wa.me/234${finsec_no.replace(/^0/, "").replace(/^234/, "").replace(/^\+234/, "").replaceAll(" ", "")}`)
                                    }}
                                >
                                    <svg class="size-4 fill-current" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    Message Financial Secretary
                                </AlertDialog.Action>
                            </AlertDialog.Footer>
                        </AlertDialog.Content>
                    </AlertDialog.Root>
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    
    /* Hide scrollbar for IE, Edge and Firefox */
    .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style>