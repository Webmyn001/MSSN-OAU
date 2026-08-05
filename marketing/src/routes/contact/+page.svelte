<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import ContactForm from "$lib/components/forms/ContactForm.svelte";
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount } from 'svelte'
    import * as Accordion from '$lib/components/ui/accordion'
    import { MapPin, Mail, CircleHelp, ChevronDown, Phone, ExternalLink } from '@lucide/svelte'
    import { page } from '$app/state'
    import { ORGANIZATION } from "$lib/config";
	import Seo from "$lib/components/SEO.svelte";

    // Data provided in the user query
    const pageJsonData = {
        "status": true,
        "data": {
            "info": {
            "maintenance": false,
            "maintenance_ends": null,
            "faqs": [
                {
                "question": "What is MSSN OAU, and what does it stand for?",
                "answer": "<strong class='text-primary-800'>MSSN OAU</strong> stands for the <strong  class='text-primary-800'>Muslim Students' Society of Nigeria, Ọbáfẹ́mi Awólọ́wọ̀ University Branch</strong>. It is a student-run Islamic organization aimed at fostering spiritual growth, academic excellence, and community service among Muslim students on campus."
                },
                {
                "question": "Who can join MSSN OAU?",
                "answer": "<strong  class='text-primary-800'>MSSN OAU</strong> is open to all Muslim students at <strong  class='text-primary-800'>Ọbáfẹ́mi Awólọ́wọ̀ University, Ilé-Ifẹ̀</strong>."
                },
                {
                "question": "Where is the MSSN Secretariat located on campus?",
                "answer": "The <strong  class='text-primary-800'>MSSN OAU Secretariat</strong> is located inside <a href='https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7' class='text-primary-800'>Fájúyì Hall, Ọbáfẹ́mi Awólọ́wọ̀ University, Ilé-Ifẹ̀</a>."
                },
                {
                "question": "How can I register for MSSN OAU events?",
                "answer": "You can register for <strong  class='text-primary-800'>MSSNOAU</strong> events through our <a  class='text-primary-800 underline hover:text-primary-700' href='/events'>events section</a> or by visiting the Secretariat inside <strong  class='text-primary-800'>Fájúyì Hall</strong>. Event registration details will be announced through our communication channels and on the website."
                },
                {
                "question": "Can I make donations to MSSN OAU? How?",
                "answer": "Yes, donations to <strong  class='text-primary-800'>MSSN OAU</strong> are welcome! You can make donations directly at the Secretariat or through our official bank account, which can be found <a  class='text-primary-800 underline hover:text-primary-700' href='/#donate'>here</a>."
                },
                {
                "question": "How do I pay my annual dues?",
                "answer": "Annual dues can be paid at the <strong  class='text-primary-800'>Secretariat</strong> or via our <a  class='text-primary-800 underline hover:text-primary-700' href='/annual-dues'>online payment platform</a>."
                },
                {
                "question": "How are the funds utilized by MSSN OAU?",
                "answer": "Funds are used to support <strong  class='text-primary-800'>MSSN OAU</strong> activities, including organizing events, maintaining the Secretariat, providing resources for members, and running community service projects."
                },
            ],
            "map_link": "https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7",
            "address": "MSSN OAU Secretariat, Inside Fájúyì Hall",
            "email": "info@mssnoau.org",
            "account": {
                "number": "0217023039",
                "bank": "GTBank",
                "name": "Muslim Students' Society Of Nigeria, OAU"
            },
            "prayer_times": { /* ... prayer times data ... */ }
            }
        }
    };

    const info = pageJsonData.data.info || {};
    const faqs = pageJsonData.data.info.faqs || [];

    // Add JSDoc type for info to clarify its structure, making phone optional
    /**
     * @typedef {object} ContactInfo
     * @property {boolean} [maintenance]
     * @property {null|string} [maintenance_ends]
     * @property {Array<{question: string, answer: string}>} [faqs]
     * @property {string} [map_link]
     * @property {string} [address]
     * @property {string} [email]
     * @property {string} [phone] // Added as optional
     * @property {{number: string, bank: string, name: string}} [account]
     * @property {object} [prayer_times] // Simplified for brevity
     */
    /** @type {ContactInfo} */
    const typedInfo = info;

    let visible = $state(false);

    onMount(() => {
        visible = true;
    });

    // Prepare Schemas
    const contactPageSchema = {
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
            "telephone": typedInfo.phone || "+234-000-0000-000",
            "contactType": "customer service",
            "email": typedInfo.email || ORGANIZATION.email,
            "areaServed": "NG",
            "availableLanguage": ["English"]
        }
    };

    const faqPageSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    const combinedSchema = [contactPageSchema, faqPageSchema];

</script>

<Seo
    title="Contact Us"
    path="/contact"
    description="Muslim Students' Society of Nigeria at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus."
    images={[
        {
            url: '/images/bg-1.webp',
            width: 1200,
            height: 630,
            alt: 'Contact MSSNOAU'
        }
    ]}
    keywords="contact MSSNOAU, MSSN contact, Muslim students contact, OAU Islamic society contact, MSSN OAU location, MSSN feedback, join MSSN OAU"
    schema={combinedSchema}
/>

<PageHeader subtitle="Have a question, suggestion or partnership idea? We'd love to hear from you.">
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
                    <a href={`mailto:${typedInfo.email || ORGANIZATION.email}`} class="text-primary-700 font-semibold">{typedInfo.email || ORGANIZATION.email}</a>
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
                    {#if typedInfo.phone}
                        <a href={`tel:${typedInfo.phone}`} class="text-primary-700 font-semibold">{typedInfo.phone}</a>
                    {:else}
                        <p class="text-primary-700 font-semibold">Phone number not available</p>
                    {/if}
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
                    <span class="mb-2 block text-lg font-semibold text-primary-700"><CircleHelp class="inline-block h-6 w-6 mr-2 align-text-bottom" />FAQ</span>
                    <h2 class="mb-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-[40px]">
                        Frequently Asked Questions
                    </h2>
                    <p class="text-base text-gray-600">
                        Here are the most common questions we get about the Muslim Students Society of Nigeria, OAU Branch.
                    </p>
                </div>
            </div>
        </div>

        {#if faqs.length > 0}
        <div class="mx-auto max-w-3xl">
            <Accordion.Root class="w-full space-y-3" type="multiple">
                {#each faqs as faq, i (faq.question)}
                    <Accordion.Item value={`item-${i}`} class="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out bg-white">
                        <Accordion.Trigger class="flex w-full items-center justify-between p-4 sm:p-5 text-left font-medium text-gray-700 hover:bg-gray-50 rounded-t-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors">
                            <span class="text-base sm:text-lg">{faq.question}</span>
                            <!-- Chevron will be handled by Accordion.Trigger or add one if needed -->
                        </Accordion.Trigger>
                        <Accordion.Content class="overflow-hidden text-sm text-gray-600 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                            <div class="p-4 sm:p-5 pt-0 prose prose-sm max-w-none">
                                {@html faq.answer}
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                {/each}
            </Accordion.Root>
        </div>
        {:else}
            <p class="text-center text-gray-500">No FAQs available at the moment.</p>
        {/if}
    </div>
</section>