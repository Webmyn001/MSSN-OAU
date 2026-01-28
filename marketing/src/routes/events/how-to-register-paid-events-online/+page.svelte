<script>
    import SEO from "$lib/components/SEO.svelte";
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { SITE_URL } from "$lib/config";
</script>

<SEO
    title="How to Register for Paid MSSN Events Online"
    path="/events/how-to-register-paid-events-online"
    description="Step-by-step guide on how to register and pay for MSSN OAU paid events securely through the official website."
    keywords={[
        "MSSN OAU events",
        "register MSSN paid events",
        "MSSN OAU online registration",
        "how to pay for MSSN events",
        "MSSN event payment guide"
    ]}
    schema={{
        "@type": "HowTo",
        "name": "How to Register for Paid MSSN Events Online",
        "description": "Learn how to register and pay for MSSN OAU paid events using the official MSSNOAU website.",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_URL}/events/how-to-register-paid-events-online`
        },
        "step": [
            {
                "@type": "HowToStep",
                "name": "Open the MSSN OAU website",
                "text": "Visit the official MSSN OAU website and ensure you are on the correct domain before proceeding with any payment."
            },
            {
                "@type": "HowToStep",
                "name": "Go to the Events page",
                "text": "From the main navigation, click on the Events link to see a list of upcoming and recent events."
            },
            {
                "@type": "HowToStep",
                "name": "Identify paid events",
                "text": "Look for events that are marked as paid with a price badge on the event card or in the event details."
            },
            {
                "@type": "HowToStep",
                "name": "Open the event details",
                "text": "Click on an event card to open the detailed view and review the description, venue, time, and any special instructions."
            },
            {
                "@type": "HowToStep",
                "name": "Click the registration button",
                "text": "Use the Register / View Details button in the event details modal to open the official registration or payment page."
            },
            {
                "@type": "HowToStep",
                "name": "Complete payment",
                "text": "Follow the instructions on the registration page, provide accurate information, and complete payment using the approved payment channel."
            }
        ]
    }}
/>

<PageHeader>
    How to Register for Paid MSSN Events Online
</PageHeader>

<section class="max-w-4xl mx-auto px-4 md:px-6 lg:px-0 py-10 space-y-10">
    <div class="space-y-4">
        <p class="text-gray-700 font-tertiary leading-relaxed">
            Paid MSSN events help us cover logistics, materials, and welfare so that programmes remain excellent and impactful.
            This guide walks you through how to safely register and pay for any <span class="font-semibold">paid MSSN OAU event</span> using the official website.
        </p>
        <p class="text-gray-700 font-tertiary leading-relaxed">
            If at any point something does not look right, or you are unsure about a payment request, please reach out through the
            <a href="/contact" class="text-primary-700 underline decoration-primary-300 hover:text-primary-800">Contact Us</a>
            page before proceeding.
        </p>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
        <div>
            <h2 class="text-xl md:text-2xl font-semibold font-secondary text-primary-800 mb-3">
                1. Start from the official MSSNOAU Events page
            </h2>
            <p class="text-gray-700 font-tertiary leading-relaxed">
                Open the
                <a href="/events" class="text-primary-700 underline decoration-primary-300 hover:text-primary-800">Events</a>
                page from the main navigation. This page lists all upcoming and recent programmes organized by MSSN OAU.
            </p>
            <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
                <li>Use the <span class="font-semibold">Upcoming</span> tab to see events you can still attend.</li>
                <li>Use the search and filters to quickly find a specific programme.</li>
                <li>Always confirm that you are on the official MSSN OAU site before taking any further steps.</li>
            </ul>
        </div>

        <div>
            <h2 class="text-xl md:text-2xl font-semibold font-secondary text-primary-800 mb-3">
                2. Identify which events are paid
            </h2>
            <p class="text-gray-700 font-tertiary leading-relaxed">
                On the Events page, each event card indicates whether it is <span class="font-semibold">Free</span> or
                <span class="font-semibold">Paid</span>.
            </p>
            <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
                <li>Paid events usually have a gold or highlighted badge showing the <span class="font-semibold">price</span> (e.g. “₦1,000”).</li>
                <li>Free events have a green <span class="font-semibold">Free</span> badge.</li>
                <li>Some events may allow “Pay what you can”; the details will be inside the event description.</li>
            </ul>
        </div>

        <div>
            <h2 class="text-xl md:text-2xl font-semibold font-secondary text-primary-800 mb-3">
                3. Open the event details
            </h2>
            <p class="text-gray-700 font-tertiary leading-relaxed">
                Click on the event card (or the “View Details” button on hover) to open the full event details in a modal.
            </p>
            <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
                <li>Carefully read the <span class="font-semibold">summary</span> and any extra instructions.</li>
                <li>Confirm the <span class="font-semibold">date, time, and venue</span> so you are available to attend.</li>
                <li>Check for any <span class="font-semibold">registration deadline</span> or limited capacity notice.</li>
                <li>If a contact phone number is provided, you may also call or message to clarify any details.</li>
            </ul>
        </div>

        <div>
            <h2 class="text-xl md:text-2xl font-semibold font-secondary text-primary-800 mb-3">
                4. Use the official “Register / View Details” button
            </h2>
            <p class="text-gray-700 font-tertiary leading-relaxed">
                At the bottom of the event details, you will see a
                <span class="font-semibold">“Register / View Details”</span> button (for events that support online registration).
            </p>
            <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
                <li>Click this button to open the official registration or payment page in a new tab.</li>
                <li>Do not follow random links forwarded on social media if they do not match the link from this button.</li>
                <li>Confirm that the opened page still clearly references MSSN OAU or the specific event you selected.</li>
            </ul>
        </div>

        <div>
            <h2 class="text-xl md:text-2xl font-semibold font-secondary text-primary-800 mb-3">
                5. Fill in your details and complete payment
            </h2>
            <p class="text-gray-700 font-tertiary leading-relaxed">
                On the registration page, you will be asked for basic information and then redirected to or shown a payment method.
            </p>
            <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
                <li>Provide your <span class="font-semibold">full name, department, level, and contact details</span> accurately.</li>
                <li>Review the <span class="font-semibold">amount</span> to be paid and confirm it matches what you saw on the event page.</li>
                <li>Follow the instructions for the available payment channel (e.g. card, transfer, or wallet).</li>
                <li>Do not share your ATM PIN, full card details, or OTP with anyone claiming to “help” you register.</li>
            </ul>
        </div>

        <div>
            <h2 class="text-xl md:text-2xl font-semibold font-secondary text-primary-800 mb-3">
                6. Save your proof of payment & confirmation
            </h2>
            <p class="text-gray-700 font-tertiary leading-relaxed">
                After successful payment, you should receive a confirmation on-screen, via email, SMS, or WhatsApp (depending on the event setup).
            </p>
            <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
                <li>Screenshot or download the <span class="font-semibold">payment receipt</span> and keep it safe.</li>
                <li>Note any <span class="font-semibold">reference ID</span> or ticket number provided.</li>
                <li>Some events may require you to show this proof at the venue before entry.</li>
            </ul>
        </div>
    </div>

    <div class="bg-primary-50 border border-primary-100 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 class="text-lg md:text-xl font-semibold font-secondary text-primary-800">
            If something goes wrong
        </h2>
        <p class="text-gray-700 font-tertiary leading-relaxed">
            If your payment is debited but you do not get confirmation, or if you are unsure whether your registration was successful:
        </p>
        <ul class="mt-3 list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base font-tertiary">
            <li>Wait a few minutes and refresh your email or messaging app used during registration.</li>
            <li>Contact the event’s official contact person (shown in the event details) with your payment reference.</li>
            <li>Or use the
                <a href="/contact" class="text-primary-700 underline decoration-primary-300 hover:text-primary-800">
                    Contact Us
                </a>
                page to reach MSSN OAU directly.
            </li>
        </ul>
        <p class="text-gray-700 font-tertiary leading-relaxed">
            MSSN OAU will never ask you to send money to a private account that is different from what is stated on the official website
            or registration page. When in doubt, always verify through the official channels.
        </p>
    </div>
</section>

