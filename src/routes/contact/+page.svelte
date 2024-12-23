<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import ContactForm from "$lib/components/ContactForm.svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import {CircleHelp} from "lucide-svelte";
    import {MetaTags} from "svelte-meta-tags";

    export let data;

    const info = data.info;
    const faqs = info.faqs;
    console.log(faqs)

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
<!-- End Meta Tags -->

<PageHeader>
    Contact Us
</PageHeader>

<!-- Contact Section -->
<div>
    <div class="max-w-5xl px-4 xl:px-0 py-10 lg:py-20 mx-auto">

        <!-- Contact -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16">
            <div class="md:order-2 border-b border-primary-800 pb-10 mb-10 md:border-b-0 md:pb-0 md:mb-0">
                <ContactForm title="Contact Form" wrapperClass="mx-auto" />
            </div>
            <!-- End Contact -->

            <!-- Part -->
            <div class="space-y-14">
                <!-- Address Part -->
                <div class="flex gap-x-5">
                    <svg class="shrink-0 size-6 text-primary-800" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <div class="grow">
                        <h4 class="text-neutral-800 font-semibold">Our address:</h4>

                        <a href={info.map_link} class="mt-1 text-neutral-700 text-sm not-italic">
                            {info.address}, <br />
                            OAU, Ilé-Ifẹ̀
                        </a>
                    </div>
                </div>
                <!-- End Address Part -->

                <!-- Email Part -->
                <div class="flex gap-x-5">
                    <svg class="shrink-0 size-6 text-primary-800" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                    <div class="grow">
                        <h4 class="text-neutral-800 font-semibold">Email us:</h4>

                        <a class="mt-1 text-neutral-700 text-sm hover:text-neutral-700/90 focus:outline-none focus:text-neutral-200" href={"mailto:" + info.email} target="_blank">
                            {info.email}
                        </a>
                    </div>
                </div>
                <!-- End Email Part -->

                <!-- FAQs Part -->
                <div class="flex gap-x-5">
                    <CircleHelp class="shrink-0 size-6 text-primary-800" />
                    <div class="grow">
                        <h4 class="text-neutral-800 font-semibold">FAQs</h4>
                        <p class="mt-1 text-neutral-700">We've collated and answered some question you may have.</p>
                        <p class="mt-2">
                            <a class="group inline-flex items-center gap-x-2 font-medium text-sm text-primary-800 decoration-2 hover:underline focus:outline-none focus:underline" href="#faqs">
                                See FAQs
                                <svg class="shrink-0 size-4 transition group-hover:translate-x-0.5 group-hover:translate-x-0 group-focus:translate-x-0.5 group-focus:translate-x-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </a>
                        </p>
                    </div>
                </div>
                <!-- End FAQs Part-->

            </div>
            <!-- End Part -->

        </div>
    </div>
</div>
<!-- End Contact Section -->

<!-- FAQs -->
<section id="faqs" class="max-w-5xl px-4 xl:px-0 py-10 lg:py-20 mx-auto">
    <div class="container">
        <div class="flex flex-col items-start text-left">
            <h2 class="mb-3 max-w-3xl text-2xl font-primary font-semibold md:mb-4 md:text-4xl lg:mb-6 text-primary-800">
                Frequently asked questions
            </h2>
        </div>
        <div data-orientation="vertical">
            <Accordion.Root type="single">
                {#each faqs as faq, i}
                <Accordion.Item value={`faq_${i}`}>
                    <Accordion.Trigger class="hover:text-primary-800">{faq.question}</Accordion.Trigger>
                    <Accordion.Content>
                        {@html faq.answer}
                    </Accordion.Content>
                </Accordion.Item>
                    {/each}
            </Accordion.Root>
        </div>
    </div>
</section>
<!-- End FAQs -->