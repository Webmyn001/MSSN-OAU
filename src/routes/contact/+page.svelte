<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import ContactForm from "$lib/components/ContactForm.svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import {CircleHelp} from "lucide-svelte";

    const faqs = [
        {
            question: "What is MSSN OAU, and what does it stand for?",
            answer: "<strong class='text-primary-800'>MSSN OAU</strong> stands for the <strong  class='text-primary-800'>Muslim Students’ Society of Nigeria, Ọbáfẹ́mi Awólọ́wọ̀ University Branch</strong>. It is a student-run Islamic organization aimed at fostering spiritual growth, academic excellence, and community service among Muslim students on campus.",
        },
        {
            question: "Who can join MSSN OAU?",
            answer: "<strong  class='text-primary-800'>MSSN OAU</strong> is open to all Muslim students at <strong  class='text-primary-800'>Ọbáfẹ́mi Awólọ́wọ̀ University, Ilé-Ifẹ̀</strong>.",
        },
        {
            question: "Where is the MSSN Secretariat located on campus?",
            answer: "The <strong  class='text-primary-800'>MSSN OAU Secretariat</strong> is located inside <a href='https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7' class='text-primary-800'>Fájúyì Hall, Ọbáfẹ́mi Awólọ́wọ̀ University, Ilé-Ifẹ̀</a>.",
        },
        {
            question: "How can I register for MSSN OAU events?",
            answer: "You can register for <strong  class='text-primary-800'>MSSNOAU</strong> events through our <a  class='text-primary-800 underline hover:text-primary-700' href='/events'>events section</a> or by visiting the Secretariat inside <strong  class='text-primary-800'>Fájúyì Hall</strong>. Event registration details will be announced through our communication channels and on the website.",
        },
        {
            question: "Can I make donations to MSSN OAU? How?",
            answer: "Yes, donations to <strong  class='text-primary-800'>MSSN OAU</strong> are welcome! You can make donations directly at the Secretariat or through our official bank account, which can be found <a  class='text-primary-800 underline hover:text-primary-700' href='/#donate'>here</a>.",
        },
        {
            question: "How do I pay my annual dues?",
            answer: "Annual dues can be paid at the <strong  class='text-primary-800'>Secretariat</strong> or via our <a  class='text-primary-800 underline hover:text-primary-700' href='/annual-dues'>online payment platform</a>.",
        },
        {
            question: "How are the funds utilized by MSSN OAU?",
            answer: "Funds are used to support <strong  class='text-primary-800'>MSSN OAU</strong> activities, including organizing events, maintaining the Secretariat, providing resources for members, and running community service projects.",
        },
        {
            question: "What resources are available in the MSSN E-library?",
            answer: "The <strong  class='text-primary-800'>MSSN E-library</strong> offers a wide range of Islamic books, scholarly articles, lecture notes, and multimedia resources to support spiritual and academic development. Members can access these materials through our <a  class='text-primary-800 underline hover:text-primary-700' href='https://library.mssnoau.org'>e-library platform</a> or at designated times from the Secretariat.",
        },
    ];

</script>

<PageHeader>
    Contact Us
</PageHeader>

<!-- Contact Section -->
<div>
    <div class="max-w-5xl px-4 xl:px-0 py-10 lg:py-20 mx-auto">

        <!-- Contact -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16">
            <div class="md:order-2 border-b border-primary-800 pb-10 mb-10 md:border-b-0 md:pb-0 md:mb-0">
                <ContactForm wrapperClass="mx-auto" />
            </div>
            <!-- End Contact -->

            <!-- Part -->
            <div class="space-y-14">
                <!-- Address Part -->
                <div class="flex gap-x-5">
                    <svg class="shrink-0 size-6 text-primary-800" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <div class="grow">
                        <h4 class="text-neutral-800 font-semibold">Our address:</h4>

                        <a href="https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7" class="mt-1 text-neutral-700 text-sm not-italic">
                            MSSN OAU Secretariat, Inside Fájúyì Hall, <br />
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

                        <a class="mt-1 text-neutral-700 text-sm hover:text-neutral-700/90 focus:outline-none focus:text-neutral-200" href="mailto:info@mssnoau.org" target="_blank">
                            info@mssnoau.org
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