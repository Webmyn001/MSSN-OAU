<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import {MetaTags, JsonLd} from "svelte-meta-tags";
    import ContactForm from "$lib/components/ContactForm.svelte";
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount, onDestroy } from 'svelte'
    import * as Accordion from '$lib/components/ui/accordion'
    import { MapPin, Mail, CircleHelp, ChevronRight, Phone, ExternalLink } from 'lucide-svelte'
    import { page } from '$app/stores'

    /** @type {{ map_link?: string, address?: string, email?: string, phone?: string, faqs?: Array<{ question: string, answer: string }> }} */
    let info = {};
    /** @type {Array<{ question: string, answer: string }>} */
    let faqs = [];
    let visible = false;
    /** @type {number|null} */
    let hoveredFaq = null;

    // Subscribe to the page store to get info and faqs
    let unsubscribe;
    onMount(() => {
        unsubscribe = page.subscribe(($page) => {
            info = $page.data?.info || {};
            faqs = $page.data?.info?.faqs || [];
        });
        visible = true;
    });
    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });
</script>

<!-- Meta Tags -->
<MetaTags
        title="Contact Us"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'Contact Us | MSSNOAU',
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
<JsonLd schema={{
            "@type": "WebPage",
            "name": "Contact Us | MSSNOAU",
            "description": "Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.",
            "publisher": {
                "@type": "Organization",
                "name": "MSSNOAU.org"
            }
        }}
        />
<!-- End Meta Tags -->

<PageHeader>
    Contact Us
</PageHeader>

<!-- Contact Section with enhanced styling -->
<div class="relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="max-w-5xl px-4 xl:px-0 py-10 lg:py-20 mx-auto relative z-10">
        {#if visible}
            <!-- Contact Grid -->
            <div 
                class="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16"
                in:fly={{ y: 30, duration: 800, delay: 200 }}
            >
                <div class="md:order-2 border-b border-primary-300 pb-10 mb-10 md:border-b-0 md:pb-0 md:mb-0">
                    <ContactForm />
                </div>
                
                <!-- Contact Info -->
                <div class="space-y-14">
                    <!-- Address Part with animation -->
                    <div 
                        class="flex gap-x-5 group"
                        in:fly={{ x: -30, duration: 800, delay: 400 }}
                    >
                        <div class="shrink-0 size-12 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <MapPin class="size-6 text-primary-700" />
                        </div>
                        <div class="grow">
                            <h4 class="text-primary-800 font-semibold font-secondary text-lg">Our address:</h4>

                            <a 
                                href={info?.map_link} 
                                class="mt-2 text-neutral-700 text-sm font-primary not-italic hover:text-primary-600 transition-colors flex items-center gap-2 group"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>
                                    {info?.address}, <br />
                                    OAU, Ilé-Ifẹ̀
                                </span>
                                <ExternalLink class="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                    </div>
                    
                    <!-- Email Part with animation -->
                    <div 
                        class="flex gap-x-5 group"
                        in:fly={{ x: -30, duration: 800, delay: 600 }}
                    >
                        <div class="shrink-0 size-12 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <Mail class="size-6 text-primary-700" />
                        </div>
                        <div class="grow">
                            <h4 class="text-primary-800 font-semibold font-secondary text-lg">Email us:</h4>

                            <a 
                                class="mt-2 text-neutral-700 text-sm font-primary hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors flex items-center gap-2 group" 
                                href={"mailto:" + info?.email} 
                                target="_blank"
                            >
                                <span>{info?.email}</span>
                                <ExternalLink class="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                    </div>
                    
                    <!-- Phone Part with animation (if available) -->
                    {#if info?.phone}
                        <div 
                            class="flex gap-x-5 group"
                            in:fly={{ x: -30, duration: 800, delay: 800 }}
                        >
                            <div class="shrink-0 size-12 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                <Phone class="size-6 text-primary-700" />
                            </div>
                            <div class="grow">
                                <h4 class="text-primary-800 font-semibold font-secondary text-lg">Call us:</h4>

                                <a 
                                    class="mt-2 text-neutral-700 text-sm font-primary hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors flex items-center gap-2 group" 
                                    href={"tel:" + info?.phone} 
                                >
                                    <span>{info?.phone}</span>
                                    <ExternalLink class="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>
                    {/if}
                    
                    <!-- FAQs Part with animation -->
                    <div 
                        class="flex gap-x-5 group"
                        in:fly={{ x: -30, duration: 800, delay: 1000 }}
                    >
                        <div class="shrink-0 size-12 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <CircleHelp class="size-6 text-primary-700" />
                        </div>
                        <div class="grow">
                            <h4 class="text-primary-800 font-semibold font-secondary text-lg">FAQs</h4>
                            <p class="mt-2 text-neutral-700 font-primary">We've collated and answered some question you may have.</p>
                            <p class="mt-3">
                                <a 
                                    class="group inline-flex items-center gap-x-2 font-medium text-sm text-primary-700 decoration-2 hover:underline focus:outline-none focus:underline transition-colors" 
                                    href="#faqs"
                                >
                                    See FAQs
                                    <ChevronRight class="shrink-0 size-4 transition group-hover:translate-x-0.5 group-focus:translate-x-0.5" />
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                <!-- End Contact Info -->
            </div>
            <!-- End Contact Grid -->
        {/if}
    </div>
</div>
<!-- End Contact Section -->

<!-- Enhanced FAQs Section -->
<section id="faqs" class="max-w-5xl px-4 xl:px-0 py-10 lg:py-20 mx-auto relative">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="container relative z-10">
        {#if visible}
            <div 
                class="flex flex-col items-start text-left mb-10"
                in:fly={{ y: 30, duration: 800, delay: 200 }}
            >
                <h2 class="mb-3 max-w-3xl text-2xl font-primary font-semibold md:mb-4 md:text-4xl lg:mb-6 text-primary-700 relative inline-block">
                    Frequently asked questions
                    <span class="absolute -bottom-2 left-0 w-1/4 h-1 bg-primary-700 rounded-full"></span>
                </h2>
            </div>
            
            <div 
                data-orientation="vertical"
                in:fly={{ y: 30, duration: 800, delay: 400 }}
                class="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 shadow-md p-6"
            >
                <Accordion.Root type="single" collapsible>
                    {#each faqs as faq, i}
                        <Accordion.Item 
                            value={`faq_${i}`}
                            class="border-b border-primary-100 last:border-b-0"
                            onmouseenter={() => hoveredFaq = i}
                            onmouseleave={() => hoveredFaq = null}
                        >
                            <Accordion.Trigger 
                                class="hover:text-primary-700 font-secondary py-4 text-left {hoveredFaq === i ? 'text-primary-700' : 'text-gray-800'} transition-colors"
                            >
                                {faq.question || ''}
                            </Accordion.Trigger>
                            <Accordion.Content class="pb-4">
                                <div class="font-primary text-neutral-700 prose prose-sm max-w-none">
                                    {@html faq.answer || ''}
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    {/each}
                </Accordion.Root>
            </div>
        {/if}
    </div>
</section>
<!-- End FAQs Section -->