<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import ContactForm from "$lib/components/forms/ContactForm.svelte";
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount, onDestroy } from 'svelte'
    import * as Accordion from '$lib/components/ui/accordion'
    import { MapPin, Mail, CircleHelp, ChevronRight, Phone, ExternalLink } from '@lucide/svelte'
    import { page } from '$app/state'
	import { ORGANIZATION } from "$lib/config";
	import Seo from "$lib/components/SEO.svelte";

    /** @type {{ map_link?: string, address?: string, email?: string, phone?: string, faqs?: Array<{ question: string, answer: string }> }} */
    let info = {};
    /** @type {Array<{ question: string, answer: string }>} */
    let faqs = [];
    let visible = false;
    /** @type {number|null} */
    let hoveredFaq = null;

    // Subscribe to the page store to get info and faqs
    onMount(() => {
            info = page.data?.info || {};
            faqs = page.data?.info?.faqs || [];
        visible = true;
    });
</script>

<Seo
    title="Contact Us"
    path="/contact"
    description="Get in touch with the Muslim Students Society of Nigeria, OAU Branch. Contact our team for inquiries, feedback, or to join our community. Find our location, phone numbers, and email addresses."
    images={[
        {
            url: 'https://mssnoau.sirv.com/contact-page.jpg',
            width: 1200,
            height: 630,
            alt: 'Contact MSSNOAU'
        }
    ]}
    keywords="contact MSSNOAU, MSSN contact, Muslim students contact, OAU Islamic society contact, MSSN OAU location, MSSN feedback, join MSSN OAU"
    schema={{
        "@type": "ContactPage",
        "name": "Contact MSSNOAU",
        "description": "Get in touch with the Muslim Students Society of Nigeria, OAU Branch. Contact our team for inquiries, feedback, or to join our community.",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://mssnoau.org/contact"
        },
        "publisher": {
            "@type": "Organization",
            "name": ORGANIZATION.name,
            "logo": {
                "@type": "ImageObject",
                "url": "https://mssnoau.sirv.com/mssn-logo.png"
            }
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-000-0000-000",
            "contactType": "customer service",
            "email": ORGANIZATION.email,
            "areaServed": "NG",
            "availableLanguage": ["English"]
        }
    }}
/>

<PageHeader>
    Contact Us
</PageHeader>

<section class="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24">
    <div class="mx-auto mb-8 max-w-3xl text-center md:mb-16">
        <h2 class="mb-4 text-3xl font-bold md:text-5xl">Get in touch with us</h2>
        <p class="mx-auto mb-8 max-w-lg text-gray-600 md:mb-12">
            Have a question, feedback, or want to connect with the Muslim Students Society of Nigeria, OAU Branch? We'd love to hear from you!
        </p>
    </div>

    <div class="grid gap-10 overflow-hidden rounded-2xl lg:grid-cols-2">
        <div class="flex flex-col items-center justify-center bg-primary-700/5 p-8 md:p-10">
            <div class="mb-8 flex max-w-md flex-col text-center">
                <div class="w-full font-medium text-[#0b1a2c]">You can contact us at</div>
                <p class="text-gray-600">
                    Our team is here to help you with any questions or concerns.
                </p>
            </div>
            <div class="mb-8 flex flex-col gap-6 overflow-hidden md:flex-row">
                <div class="flex items-center justify-center">
                    <div class="rounded-lg bg-[#f2f3f3] p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-700 lucide lucide-mail size-8"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                </div>
                <div class="max-w-xs">
                    <h3 class="mb-2 text-xl font-bold">Email us</h3>
                    <p class="mb-4 text-gray-600">
                        Send us an email and we'll get back to you within 48 hours.
                    </p>
                    <a href={`mailto:${page.data?.info?.email}`} class="text-primary-700 font-semibold">{page.data?.info?.email}</a>
                </div>
            </div>
            <div class="mb-8 flex flex-col gap-6 overflow-hidden md:flex-row">
                <div class="flex items-center justify-center">
                    <div class="rounded-lg bg-[#f2f3f3] p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-700 lucide lucide-map-pin size-8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                </div>
                <div class="max-w-xs">
                    <h3 class="mb-2 text-xl font-bold">Visit us</h3>
                    <p class="mb-4 text-gray-600">
                        Come by our secretariat during office hours.
                    </p>
                    <p class="font-semibold">{ORGANIZATION.address.street}, {ORGANIZATION.address.city}, {ORGANIZATION.address.state}</p>
                </div>
            </div>
            <div class="flex flex-col gap-6 overflow-hidden md:flex-row">
                <div class="flex items-center justify-center">
                    <div class="rounded-lg bg-[#f2f3f3] p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-700 lucide lucide-phone size-8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                </div>
                <div class="max-w-xs">
                    <h3 class="mb-2 text-xl font-bold">Call us</h3>
                    <p class="mb-4 text-gray-600">
                        Available Monday to Saturday from 9am to 5pm.
                    </p>
                    <a href="tel:+2340000000000" class="text-primary-700 font-semibold">+234-000-0000-000</a>
                </div>
            </div>
        </div>
        <div>
            <ContactForm />
        </div>
    </div>
</section>

<section
  id="faqs"
  class="relative z-10 overflow-hidden px-4 py-20 pt-16 sm:px-6 lg:px-8"
>
    <div class="container mx-auto">
        <div class="flex flex-wrap">
            <div class="w-full px-4">
                <div class="mx-auto mb-[60px] max-w-[520px] text-center">
                    <span class="mb-2 block text-lg font-semibold text-primary-700">FAQ</span>
                    <h2 class="mb-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-[40px]">
                        Frequently Asked Questions
                    </h2>
                    <p class="text-base text-gray-600">
                        Here are the most common questions we get about the Muslim Students Society of Nigeria, OAU Branch.
                    </p>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap">
            <div class="w-full px-4">
                <div class="w-full overflow-hidden rounded-xl bg-white shadow-xl">
                    <div class="-mx-4 flex flex-wrap">
                        <div class="w-full px-4 lg:w-1/2">
                            <div class="overflow-hidden rounded-md border border-slate-200/60 p-5 shadow-md hover:shadow-lg sm:p-8">
                                <h3 class="mb-4 text-lg font-semibold text-gray-900">
                                    How can I become a member of MSSNOAU?
                                </h3>
                                <p class="text-base text-gray-600">
                                    Any Muslim student of Obafemi Awolowo University can become a member. Simply reach out to us through our contact form, visit our secretariat, or attend any of our programs to register.
                                </p>
                            </div>
                        </div>
                        <div class="w-full px-4 lg:w-1/2">
                            <div class="overflow-hidden rounded-md border border-slate-200/60 p-5 shadow-md hover:shadow-lg sm:p-8">
                                <h3 class="mb-4 text-lg font-semibold text-gray-900">
                                    What activities does MSSNOAU organize?
                                </h3>
                                <p class="text-base text-gray-600">
                                    We organize a variety of activities including Islamic lectures, tutorials, community service, sports events, and social gatherings. Our major programs include Jihad Week, MSSN Week, and various educational workshops.
                                </p>
                            </div>
                        </div>
                        <div class="w-full px-4 lg:w-1/2">
                            <div class="overflow-hidden rounded-md border border-slate-200/60 p-5 shadow-md hover:shadow-lg sm:p-8">
                                <h3 class="mb-4 text-lg font-semibold text-gray-900">
                                    Where are your prayer locations on campus?
                                </h3>
                                <p class="text-base text-gray-600">
                                    We have prayer locations across the campus, including the Central Mosque, as well as prayer spaces in most faculties and halls of residence. Check our Prayer Times section for specific locations.
                                </p>
                            </div>
                        </div>
                        <div class="w-full px-4 lg:w-1/2">
                            <div class="overflow-hidden rounded-md border border-slate-200/60 p-5 shadow-md hover:shadow-lg sm:p-8">
                                <h3 class="mb-4 text-lg font-semibold text-gray-900">
                                    How can I contribute to MSSNOAU?
                                </h3>
                                <p class="text-base text-gray-600">
                                    You can contribute by volunteering for our committees, participating in our programs, making donations, or sharing your skills and expertise. We welcome all forms of positive contributions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>